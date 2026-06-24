import db from '../config/database';
import { NotFoundError } from '../utils/errors';

export async function getPendingBGChecks() {
  return db('Applications as a')
    .join('Students as s', 's.StudentID', 'a.StudentID')
    .join('Users as u', 'u.UserID', 's.UserID')
    .select(
      'a.ApplicationID',
      'a.Status as ApplicationStatus',
      'a.ScholarshipID',
      'u.FullName as StudentName',
      'u.Email as StudentEmail'
    )
    .whereIn('a.Status', ['DocAuditComplete', 'BGCheckInProgress'])
    .orderBy('a.SubmissionDate', 'asc');
}

export async function submitBGCheck(
  applicationId: number,
  officerId: number,
  checkType: string,
  result: 'Pass' | 'Fail' | 'Inconclusive',
  notes?: string,
  evidenceUrl?: string
) {
  const trx = await db.transaction();
  try {
    const app = await trx('Applications').where({ ApplicationID: applicationId }).first();
    if (!app) throw new NotFoundError('Application not found');

    if (app.Status === 'DocAuditComplete') {
      await trx('Applications')
        .where({ ApplicationID: applicationId })
        .update({ Status: 'BGCheckInProgress' });
    }

    const [inserted] = await trx('BackgroundChecks')
      .insert({
        ApplicationID: applicationId,
        OfficerID: officerId,
        CheckType: checkType,
        Result: result,
        Notes: notes || null,
        EvidenceURL: evidenceUrl || null,
        CompletedAt: trx.fn.now(),
      })
      .returning('*');

    const allChecks = await trx('BackgroundChecks').where({ ApplicationID: applicationId });
    
    const requiredChecks = ['Identity', 'Address', 'IncomeVerification'];
    const allPassed = requiredChecks.every((reqCheck) => {
      const checkRecord = allChecks.find((c: { CheckType: string }) => c.CheckType === reqCheck);
      return checkRecord?.Result === 'Pass';
    });

    if (allPassed) {
      await trx('Applications')
        .where({ ApplicationID: applicationId })
        .update({ Status: 'BGCheckComplete', AssignedBGOfficer: officerId });
    } else if (result === 'Fail') {
      await trx('Applications')
        .where({ ApplicationID: applicationId })
        .update({ Status: 'ScreeningPending', AssignedBGOfficer: officerId });
    }

    await trx.commit();
    return inserted;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}
