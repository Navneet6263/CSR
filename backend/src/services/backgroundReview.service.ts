import { Knex } from 'knex';
import db from '../config/database';
import { ConflictError, ForbiddenError } from '../utils/errors';
import { writeAudit } from './audit.service';
import { applicationStudentUserId, queueNotification } from './notification.service';
import { WorkflowActor, lockApplication, transitionApplication } from './workflow.service';

export type BackgroundCheckType = 'Identity' | 'Address' | 'IncomeVerification';
export type BackgroundCheckResult = 'Pass' | 'Fail' | 'Inconclusive';
const requiredChecks: BackgroundCheckType[] = ['Identity', 'Address', 'IncomeVerification'];

async function claimApplication(trx: Knex.Transaction, applicationId: number, officerId: number) {
  await trx('Applications').where({ ApplicationID: applicationId }).whereNull('AssignedBGOfficer')
    .update({ AssignedBGOfficer: officerId, UpdatedAt: trx.fn.now() });
  const application = await lockApplication(trx, applicationId);
  if (application.AssignedBGOfficer !== officerId) throw new ConflictError('Application is assigned to another officer.');
  if (!['DocAuditComplete', 'BGCheckInProgress'].includes(application.Status)) {
    throw new ConflictError('Application is not ready for a background check.');
  }
  if (application.IsHeldByAdmin) throw new ForbiddenError('Application is currently on hold.');
  return application;
}

export async function submitBGCheck(
  applicationId: number,
  actor: WorkflowActor,
  checkType: BackgroundCheckType,
  result: BackgroundCheckResult,
  notes?: string,
  evidenceUrl?: string,
) {
  return db.transaction(async (trx) => {
    let application = await claimApplication(trx, applicationId, actor.userId);
    if (application.Status === 'DocAuditComplete') {
      application = await transitionApplication(trx, applicationId, 'BGCheckInProgress', actor, {
        assignment: 'AssignedBGOfficer',
      });
    }
    const existing = await trx('BackgroundChecks').where({ ApplicationID: applicationId, CheckType: checkType }).first();
    if (existing?.Result === 'Pass') throw new ConflictError('A passed check cannot be replaced.');
    const values = {
      OfficerID: actor.userId, Result: result, Notes: notes || null,
      EvidenceURL: evidenceUrl || null, CompletedAt: trx.fn.now(), UpdatedAt: trx.fn.now(),
      Version: Number(existing?.Version ?? 0) + 1,
    };
    let checkId: number;
    if (existing) {
      await trx('BackgroundChecks').where({ CheckID: existing.CheckID, Version: existing.Version ?? 0 }).update(values);
      checkId = existing.CheckID;
    } else {
      const inserted = await trx('BackgroundChecks').insert({ ApplicationID: applicationId, CheckType: checkType, ...values })
        .returning('CheckID');
      checkId = Number((inserted[0] as any)?.CheckID ?? inserted[0]);
    }
    await writeAudit(trx, {
      userId: actor.userId, action: 'BACKGROUND_CHECK_RECORDED', entityType: 'BackgroundCheck', entityId: checkId,
      oldValue: existing ? { result: existing.Result, version: existing.Version } : undefined,
      newValue: { applicationId, checkType, result, version: values.Version },
      requestId: actor.requestId, ipAddress: actor.ipAddress,
    });

    const checks = await trx('BackgroundChecks').select('CheckType', 'Result').where({ ApplicationID: applicationId });
    const byType = new Map(checks.map((check) => [check.CheckType, check.Result]));
    const anyFailed = requiredChecks.some((type) => byType.get(type) === 'Fail');
    const allPassed = requiredChecks.every((type) => byType.get(type) === 'Pass');
    let finalStatus = application.Status;
    if (anyFailed) {
      await transitionApplication(trx, applicationId, 'ScreeningPending', actor, {
        assignment: 'AssignedBGOfficer', reason: 'One or more background checks failed.',
      });
      finalStatus = 'ScreeningPending';
    } else if (allPassed) {
      await transitionApplication(trx, applicationId, 'BGCheckComplete', actor, { assignment: 'AssignedBGOfficer' });
      finalStatus = 'BGCheckComplete';
    }
    const studentUserId = await applicationStudentUserId(trx, applicationId);
    if (studentUserId && finalStatus !== 'BGCheckInProgress') {
      await queueNotification(trx, studentUserId, 'BACKGROUND_CHECK_UPDATED',
        'Your application background verification has been completed.', { applicationId, status: finalStatus });
    }
    return { checkId, applicationId, checkType, result, applicationStatus: finalStatus };
  });
}
