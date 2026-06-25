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

export async function getBGCheckDetails(applicationId: number) {
  const student = await db('Applications as a')
    .join('Students as s', 's.StudentID', 'a.StudentID')
    .join('Users as u', 'u.UserID', 's.UserID')
    .join('Scholarships as sc', 'sc.ScholarshipID', 'a.ScholarshipID')
    .select(
      'u.FullName as name',
      'u.Email as email',
      'a.ApplicationID as applicationId',
      'a.Status as applicationStatus',
      'sc.Name as scholarship',
      's.AadharNumber as aadhar',
      's.AnnualFamilyIncome as income',
      'u.Phone as phone',
      's.Address as address'
    )
    .where('a.ApplicationID', applicationId)
    .first();

  if (!student) throw new NotFoundError('Application not found');

  const docs = await db('DocumentChecklist')
    .select('DocumentType as type', 'FileURL as url', 'Status as status')
    .where({ ApplicationID: applicationId });

  const checks = await db('BackgroundChecks')
    .select('CheckType as type', 'Result as result', 'Notes as notes', 'EvidenceURL as evidenceUrl', 'CompletedAt as completedAt')
    .where({ ApplicationID: applicationId });

  return { student, docs, checks };
}

export async function getBGOfficerLogs(officerId: number) {
  return db('BackgroundChecks as b')
    .join('Applications as a', 'a.ApplicationID', 'b.ApplicationID')
    .join('Students as s', 's.StudentID', 'a.StudentID')
    .join('Users as u', 'u.UserID', 's.UserID')
    .select(
      'b.CheckID as logId',
      'b.ApplicationID as appId',
      'u.FullName as studentName',
      'b.CheckType as actionType',
      'b.Result as status',
      'b.CompletedAt as timestamp'
    )
    .where('b.OfficerID', officerId)
    .orderBy('b.CompletedAt', 'desc')
    .limit(50);
}

export async function getBGOfficerStats(officerId: number) {
  const pendingCount = await db('Applications').where({ Status: 'DocAuditComplete' }).count('* as count').first();
  const completedCount = await db('BackgroundChecks').where({ OfficerID: officerId }).countDistinct('ApplicationID as count').first();
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = await db('BackgroundChecks')
    .where({ OfficerID: officerId })
    .andWhere('CompletedAt', '>=', todayStr)
    .countDistinct('ApplicationID as count').first();

  return {
    pending: parseInt(String(pendingCount?.count || 0), 10),
    completed: parseInt(String(completedCount?.count || 0), 10),
    today: parseInt(String(todayCount?.count || 0), 10),
  };
}
