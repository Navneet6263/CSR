import { Knex } from 'knex';
import { ALLOWED_TRANSITIONS, canRoleTransition } from '../domain/applicationStatus';
import { ApplicationStatus, UserRole } from '../types';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../utils/errors';
import { writeAudit } from './audit.service';

export interface WorkflowActor {
  userId: number;
  role: UserRole;
  requestId?: string;
  ipAddress?: string;
}

interface TransitionOptions {
  reason?: string;
  allowHeld?: boolean;
  assignment?: 'AssignedDocReviewer' | 'AssignedBGOfficer' | 'AssignedScreener';
}

export async function lockApplication(trx: Knex.Transaction, applicationId: number) {
  const rows = await trx.raw(
    'SELECT * FROM Applications WITH (UPDLOCK, ROWLOCK) WHERE ApplicationID = ?',
    [applicationId],
  );
  const application = Array.isArray(rows) ? rows[0] : undefined;
  if (!application) throw new NotFoundError('Application not found.');
  return application;
}

export async function transitionApplication(
  trx: Knex.Transaction,
  applicationId: number,
  toStatus: ApplicationStatus,
  actor: WorkflowActor,
  options: TransitionOptions = {},
) {
  const application = await lockApplication(trx, applicationId);
  const fromStatus = application.Status as ApplicationStatus;

  if (application.IsHeldByAdmin && !options.allowHeld && actor.role !== 'Admin') {
    throw new ForbiddenError('Application is currently on hold.');
  }
  if (!ALLOWED_TRANSITIONS[fromStatus]?.includes(toStatus)) {
    throw new ValidationError(`Invalid application transition: ${fromStatus} -> ${toStatus}.`);
  }
  if (!canRoleTransition(actor.role, toStatus)) {
    throw new ForbiddenError('Your role cannot perform this workflow transition.');
  }
  if (options.assignment) {
    const assignedTo = application[options.assignment];
    if (assignedTo && assignedTo !== actor.userId) {
      throw new ConflictError('Application is assigned to another officer.');
    }
  }

  const nextVersion = Number(application.Version ?? 0) + 1;
  const payload: Record<string, unknown> = {
    Status: toStatus,
    Version: nextVersion,
    StageEnteredAt: trx.fn.now(),
    UpdatedAt: trx.fn.now(),
  };
  if (options.assignment) payload[options.assignment] = actor.userId;

  const updated = await trx('Applications')
    .where({ ApplicationID: applicationId, Status: fromStatus, Version: application.Version ?? 0 })
    .update(payload);
  if (updated !== 1) throw new ConflictError('Application changed; refresh and retry.');

  await trx('ApplicationStatusHistory').insert({
    ApplicationID: applicationId,
    FromStatus: fromStatus,
    ToStatus: toStatus,
    ActorUserID: actor.userId,
    ActorRole: actor.role,
    Reason: options.reason?.slice(0, 1000) ?? null,
    RequestID: actor.requestId?.slice(0, 100) ?? null,
    Version: nextVersion,
  });
  await writeAudit(trx, {
    userId: actor.userId,
    action: 'APPLICATION_STATUS_CHANGED',
    entityType: 'Application',
    entityId: applicationId,
    oldValue: { status: fromStatus, version: application.Version ?? 0 },
    newValue: { status: toStatus, version: nextVersion, reason: options.reason },
    requestId: actor.requestId,
    ipAddress: actor.ipAddress,
  });
  return { ...application, Status: toStatus, Version: nextVersion };
}
