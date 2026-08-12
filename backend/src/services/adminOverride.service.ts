import { Knex } from 'knex';
import db from '../config/database';
import type { ApplicationStatus } from '../types';
import { ConflictError, ForbiddenError, ValidationError } from '../utils/errors';
import type { EmergencyApprovalInput } from '../validators/admin.validator';
import { writeAudit } from './audit.service';
import { applicationStudentUserId, queueNotification } from './notification.service';
import { lockApplication, transitionApplication, WorkflowActor } from './workflow.service';

const approvalTargets: Partial<Record<ApplicationStatus, ApplicationStatus>> = {
  Submitted: 'DocAuditComplete',
  AutoMatched: 'DocAuditComplete',
  DocAuditInProgress: 'DocAuditComplete',
  DocAuditComplete: 'BGCheckComplete',
  BGCheckInProgress: 'BGCheckComplete',
  BGCheckComplete: 'ScreeningApproved',
  ScreeningPending: 'ScreeningApproved',
  ScreeningApproved: 'CSRApproved',
  CSRPending: 'CSRApproved',
};

export function emergencyApprovalTarget(status: ApplicationStatus): ApplicationStatus | null {
  return approvalTargets[status] ?? null;
}

export async function emergencyApproveApplication(
  applicationId: number,
  input: EmergencyApprovalInput,
  actor: WorkflowActor,
) {
  if (actor.role !== 'Admin') throw new ForbiddenError('Administrator access is required.');
  if (input.confirmation.toUpperCase() !== `APP-${applicationId}`) {
    throw new ValidationError(`Type APP-${applicationId} to confirm this override.`);
  }
  return db.transaction(async (trx) => {
    const application = await lockApplication(trx, applicationId);
    if (application.IsHeldByAdmin) throw new ConflictError('Release the administrative hold before approval.');
    const fromStatus = application.Status as ApplicationStatus;
    if (input.expectedStatus !== fromStatus) {
      throw new ConflictError('Application status changed; refresh before approving.');
    }
    const toStatus = emergencyApprovalTarget(fromStatus);
    if (!toStatus) throw new ConflictError('Emergency approval is not available at this application stage.');
    const evidence = await evidenceSnapshot(trx, applicationId);
    await transitionApplication(trx, applicationId, toStatus, actor, { reason: input.reason });
    if (toStatus === 'ScreeningApproved') {
      await recordAdminDecision(trx, applicationId, actor, 'Screening', input.reason);
    } else if (toStatus === 'CSRApproved') {
      await recordAdminDecision(trx, applicationId, actor, 'CSR', input.reason);
    }
    await writeAudit(trx, {
      userId: actor.userId,
      action: 'ADMIN_EMERGENCY_STAGE_APPROVED',
      entityType: 'Application',
      entityId: applicationId,
      oldValue: { status: fromStatus, evidence },
      newValue: { status: toStatus, reason: input.reason, emergencyOverride: true },
      requestId: actor.requestId,
      ipAddress: actor.ipAddress,
    });
    const studentUserId = await applicationStudentUserId(trx, applicationId);
    if (studentUserId) await queueNotification(trx, studentUserId, 'APPLICATION_ADMIN_REVIEWED',
      'Your application advanced after an authorised administrative review.',
      { applicationId, status: toStatus });
    return { applicationId, fromStatus, status: toStatus, approvedBy: actor.userId };
  });
}

async function evidenceSnapshot(trx: Knex.Transaction, applicationId: number) {
  const [documents, checks] = await Promise.all([
    trx('DocumentChecklist').select('Status').where({ ApplicationID: applicationId }),
    trx('BackgroundChecks').select('Result').where({ ApplicationID: applicationId }),
  ]);
  return {
    documents: {
      total: documents.length,
      verified: documents.filter((item) => item.Status === 'Verified').length,
    },
    backgroundChecks: {
      total: checks.length,
      passed: checks.filter((item) => item.Result === 'Pass').length,
    },
  };
}

async function recordAdminDecision(
  trx: Knex.Transaction,
  applicationId: number,
  actor: WorkflowActor,
  stage: 'Screening' | 'CSR',
  reason: string,
) {
  await trx('ApplicationDecisions').insert({
    ApplicationID: applicationId,
    Stage: stage,
    Decision: 'AdminApprove',
    Reason: reason,
    ActorUserID: actor.userId,
    ActorRole: actor.role,
  });
}
