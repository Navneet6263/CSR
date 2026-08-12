import { Knex } from 'knex';
import db from '../config/database';
import { ConflictError, ForbiddenError, ValidationError } from '../utils/errors';
import type { ScreeningDecisionInput } from '../validators/screening.validator';
import { writeAudit } from './audit.service';
import { applicationStudentUserId, queueNotification } from './notification.service';
import { WorkflowActor, lockApplication, transitionApplication } from './workflow.service';

async function recordDecision(
  trx: Knex.Transaction,
  applicationId: number,
  actor: WorkflowActor,
  stage: 'Screening' | 'CSR',
  decision: string,
  reason?: string,
) {
  const inserted = await trx('ApplicationDecisions').insert({
    ApplicationID: applicationId, Stage: stage, Decision: decision,
    Reason: reason || null, ActorUserID: actor.userId, ActorRole: actor.role,
  }).returning('DecisionID');
  await writeAudit(trx, {
    userId: actor.userId, action: `${stage.toUpperCase()}_DECISION_RECORDED`, entityType: 'ApplicationDecision',
    entityId: Number((inserted[0] as any)?.DecisionID ?? inserted[0]), newValue: { applicationId, decision, reason },
    requestId: actor.requestId, ipAddress: actor.ipAddress,
  });
}

export async function submitScreeningDecision(
  applicationId: number,
  actor: WorkflowActor,
  input: ScreeningDecisionInput,
) {
  return db.transaction(async (trx) => {
    await trx('Applications').where({ ApplicationID: applicationId }).whereNull('AssignedScreener')
      .update({ AssignedScreener: actor.userId, UpdatedAt: new Date() });
    const application = await lockApplication(trx, applicationId);
    if (!['BGCheckComplete', 'ScreeningPending'].includes(application.Status)) {
      throw new ConflictError('Application is not ready for screening.');
    }
    if (application.IsHeldByAdmin) throw new ForbiddenError('Application is currently on hold.');
    if (application.AssignedScreener !== actor.userId) throw new ConflictError('Application is assigned to another screener.');
    if ([application.AssignedDocReviewer, application.AssignedBGOfficer].includes(actor.userId)) {
      throw new ForbiddenError('Maker-checker policy prevents reviewing your own prior verification.');
    }
    if (input.decision === 'Approve') {
      const [documents, checks] = await Promise.all([
        trx('DocumentChecklist').select('Status').where({ ApplicationID: applicationId }),
        trx('BackgroundChecks').select('CheckType', 'Result').where({ ApplicationID: applicationId }),
      ]);
      const required = ['Identity', 'Address', 'IncomeVerification'];
      const background = new Map(checks.map((check) => [check.CheckType, check.Result]));
      if (!documents.length || documents.some((document) => document.Status !== 'Verified')) {
        throw new ConflictError('All submitted documents must be verified before approval.');
      }
      if (!required.every((type) => background.get(type) === 'Pass')) {
        throw new ConflictError('All required background checks must pass before approval.');
      }
    }
    if (input.decision === 'Reject' && input.returnTo !== 'CloseApplication') {
      return returnForCorrection(trx, applicationId, application, actor, input);
    }
    const status = input.decision === 'Approve' ? 'ScreeningApproved' : 'ScreeningRejected';
    await transitionApplication(trx, applicationId, status, actor, {
      assignment: 'AssignedScreener', reason: input.notes,
    });
    await recordDecision(trx, applicationId, actor, 'Screening', input.decision, input.notes);
    const studentUserId = await applicationStudentUserId(trx, applicationId);
    if (studentUserId) await queueNotification(trx, studentUserId, 'SCREENING_DECISION',
      `Your application screening decision is ${status}.`, { applicationId, status });
    return { applicationId, status };
  });
}

async function returnForCorrection(
  trx: Knex.Transaction,
  applicationId: number,
  application: Record<string, any>,
  actor: WorkflowActor,
  input: ScreeningDecisionInput,
) {
  const items = [...new Set(input.affectedItems ?? [])];
  if (input.returnTo === 'DocumentReviewer') {
    if (!items.length) throw new ValidationError('Select at least one document to return.');
    const ids = items.map(Number);
    if (ids.some((value) => !Number.isInteger(value) || value < 1)) {
      throw new ValidationError('Select valid documents to return.');
    }
    const documents = await trx('DocumentChecklist').select('ChecklistID')
      .where({ ApplicationID: applicationId }).whereIn('ChecklistID', ids);
    if (documents.length !== ids.length) throw new ValidationError('One or more selected documents are invalid.');
    await trx('DocumentChecklist').where({ ApplicationID: applicationId }).whereIn('ChecklistID', ids).update({
      Status: 'Pending', ReviewedAt: null, Version: trx.raw('Version + 1'),
    });
    await trx('BackgroundChecks').where({ ApplicationID: applicationId }).update({
      Result: 'Inconclusive', CompletedAt: null, UpdatedAt: new Date(), Version: trx.raw('Version + 1'),
    });
    await transitionApplication(trx, applicationId, 'DocAuditInProgress', actor, { reason: input.notes });
    await trx('Applications').where({ ApplicationID: applicationId }).update({ AssignedScreener: null });
    await recordDecision(trx, applicationId, actor, 'Screening', 'ReturnDocument', input.notes);
    await writeAudit(trx, { userId: actor.userId, action: 'SCREENING_RETURNED_TO_DOCUMENT_REVIEW',
      entityType: 'Application', entityId: applicationId, newValue: { affectedChecklistIds: ids, reason: input.notes },
      requestId: actor.requestId, ipAddress: actor.ipAddress });
    await notifyResponsible(trx, application.AssignedDocReviewer, applicationId, 'Document review', input.notes, items);
    return { applicationId, status: 'DocAuditInProgress', returnedTo: 'DocumentReviewer' };
  }

  if (input.returnTo !== 'BGCheckOfficer' || !items.length) {
    throw new ValidationError('Choose a valid correction destination and affected evidence.');
  }
  const validTypes = ['Identity', 'Address', 'IncomeVerification'];
  if (items.some((value) => !validTypes.includes(value))) {
    throw new ValidationError('Select valid background checks to return.');
  }
  const checks = await trx('BackgroundChecks').select('CheckType')
    .where({ ApplicationID: applicationId }).whereIn('CheckType', items);
  if (checks.length !== items.length) throw new ValidationError('One or more selected background checks are invalid.');
  await trx('BackgroundChecks').where({ ApplicationID: applicationId }).whereIn('CheckType', items).update({
    Result: 'Inconclusive', CompletedAt: null, UpdatedAt: new Date(), Version: trx.raw('Version + 1'),
  });
  await transitionApplication(trx, applicationId, 'BGCheckInProgress', actor, { reason: input.notes });
  await trx('Applications').where({ ApplicationID: applicationId }).update({ AssignedScreener: null });
  await recordDecision(trx, applicationId, actor, 'Screening', 'ReturnBackground', input.notes);
  await writeAudit(trx, { userId: actor.userId, action: 'SCREENING_RETURNED_TO_BACKGROUND_CHECK',
    entityType: 'Application', entityId: applicationId, newValue: { affectedCheckTypes: items, reason: input.notes },
    requestId: actor.requestId, ipAddress: actor.ipAddress });
  await notifyResponsible(trx, application.AssignedBGOfficer, applicationId, 'Background verification', input.notes, items);
  return { applicationId, status: 'BGCheckInProgress', returnedTo: 'BGCheckOfficer' };
}

async function notifyResponsible(
  trx: Knex.Transaction,
  userId: number | null | undefined,
  applicationId: number,
  stage: string,
  notes: string,
  affectedItems: string[],
) {
  if (!userId) return;
  await queueNotification(trx, userId, 'SCREENING_CORRECTION_REQUIRED',
    `APP-${applicationId} was returned to ${stage}. Screener note: ${notes}`,
    { applicationId, stage, notes, affectedItems });
}

export async function submitCSRDecision(
  applicationId: number,
  actor: WorkflowActor,
  sponsorId: number,
  decision: 'Approve' | 'Decline',
  notes?: string,
) {
  return db.transaction(async (trx) => {
    const application = await lockApplication(trx, applicationId);
    if (application.Status !== 'ScreeningApproved') throw new ConflictError('Application is not ready for CSR approval.');
    if (application.SponsorID !== sponsorId) throw new ForbiddenError('Application belongs to another sponsor.');
    if (application.IsHeldByAdmin) throw new ForbiddenError('Application is currently on hold.');
    const status = decision === 'Approve' ? 'CSRApproved' : 'CSRDeclined';
    await transitionApplication(trx, applicationId, status, actor, { reason: notes });
    await recordDecision(trx, applicationId, actor, 'CSR', decision, notes);
    const studentUserId = await applicationStudentUserId(trx, applicationId);
    if (studentUserId) await queueNotification(trx, studentUserId, 'CSR_DECISION',
      `The sponsor ${decision.toLowerCase()}d your application.`, { applicationId, status });
    return { applicationId, status };
  });
}
