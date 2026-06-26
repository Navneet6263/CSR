import db from '../config/database';
import { NotFoundError } from '../utils/errors';

// ─── Screening Officer Workflow ─────────────────────────────────────────────

export async function getPendingScreening() {
  return await db('Applications')
    .join('Students', 'Applications.StudentID', 'Students.StudentID')
    .join('Users', 'Students.UserID', 'Users.UserID')
    .join('Scholarships', 'Applications.ScholarshipID', 'Scholarships.ScholarshipID')
    .select(
      'Applications.ApplicationID as applicationId',
      'Applications.Status as status',
      'Applications.SubmissionDate as submissionDate',
      'Applications.ScholarshipAmount as scholarshipAmount',
      'Applications.Notes as notes',
      'Scholarships.Name as scholarshipName',
      'Students.StudentID as studentId',
      'Users.FullName as studentName',
      'Users.Email as studentEmail'
    )
    .where('Applications.Status', 'BGCheckComplete')
    .then(rows => rows.map(row => ({
      ...row,
      urgency: 'medium', // Mock value since DB lacks this
      bgCheckResult: 'Pass' // Mock value for UI
    })));
}

export async function getScreeningHistory(userId: number) {
  return await db('Applications')
    .join('Students', 'Applications.StudentID', 'Students.StudentID')
    .join('Users', 'Students.UserID', 'Users.UserID')
    .join('Scholarships', 'Applications.ScholarshipID', 'Scholarships.ScholarshipID')
    .select(
      'Applications.ApplicationID as applicationId',
      'Applications.Status as status',
      'Applications.SubmissionDate as submissionDate',
      'Applications.ScholarshipAmount as scholarshipAmount',
      'Applications.Notes as notes',
      'Scholarships.Name as scholarshipName',
      'Students.StudentID as studentId',
      'Users.FullName as studentName',
      'Users.Email as studentEmail'
    )
    .where('Applications.AssignedScreener', userId)
    .orderBy('Applications.ApplicationID', 'desc')
    .then(rows => rows.map(row => ({
      ...row,
      urgency: 'medium',
      bgCheckResult: 'Pass'
    })));
}
export async function getScreenerStats(userId: number) {
  const pendingCount = await db('Applications').where({ Status: 'BGCheckComplete' }).count('* as count').first();
  const approvedCount = await db('Applications').where({ AssignedScreener: userId, Status: 'ScreeningApproved' }).count('* as count').first();
  const rejectedCount = await db('Applications').where({ AssignedScreener: userId, Status: 'ScreeningRejected' }).count('* as count').first();

  return {
    pending: parseInt(pendingCount?.count as string) || 0,
    approved: parseInt(approvedCount?.count as string) || 0,
    rejected: parseInt(rejectedCount?.count as string) || 0,
    totalReviewed: (parseInt(approvedCount?.count as string) || 0) + (parseInt(rejectedCount?.count as string) || 0)
  };
}

export async function submitScreeningDecision(
  appId: number,
  userId: number,
  decision: 'Approve' | 'Reject',
  notes?: string
) {
  const app = await db('Applications').where({ ApplicationID: appId }).first();
  if (!app) throw new NotFoundError('Application not found');

  const status = decision === 'Approve' ? 'ScreeningApproved' : 'ScreeningRejected';
  let updatedNotes = app.Notes || '';
  if (notes) {
    updatedNotes = updatedNotes ? `${updatedNotes}\nScreening Notes: ${notes}` : `Screening Notes: ${notes}`;
  }

  await db('Applications')
    .where({ ApplicationID: appId })
    .update({
      Status: status,
      AssignedScreener: userId,
      Notes: updatedNotes,
    });

  return { message: `Screening decision '${status}' recorded successfully` };
}

// ─── CSR Partner Workflow ───────────────────────────────────────────────────

export async function getPendingCSR() {
  return await db('Applications')
    .join('Students', 'Applications.StudentID', 'Students.StudentID')
    .join('Users', 'Students.UserID', 'Users.UserID')
    .join('Scholarships', 'Applications.ScholarshipID', 'Scholarships.ScholarshipID')
    .select(
      'Applications.ApplicationID as applicationId',
      'Applications.Status as status',
      'Applications.SubmissionDate as submissionDate',
      'Applications.ScholarshipAmount as scholarshipAmount',
      'Applications.Notes as notes',
      'Scholarships.Name as scholarshipName',
      'Students.StudentID as studentId',
      'Users.FullName as studentName',
      'Users.Email as studentEmail'
    )
    .where('Applications.Status', 'ScreeningApproved')
    .then(rows => rows.map(row => ({
      ...row,
      urgency: 'medium',
      bgCheckResult: 'Pass'
    })));
}

export async function submitCSRDecision(
  appId: number,
  userId: number,
  decision: 'Approve' | 'Decline',
  notes?: string
) {
  const app = await db('Applications').where({ ApplicationID: appId }).first();
  if (!app) throw new NotFoundError('Application not found');

  const status = decision === 'Approve' ? 'CSRApproved' : 'CSRDeclined';
  let updatedNotes = app.Notes || '';
  if (notes) {
    updatedNotes = updatedNotes ? `${updatedNotes}\nCSR Notes: ${notes}` : `CSR Notes: ${notes}`;
  }

  await db('Applications')
    .where({ ApplicationID: appId })
    .update({
      Status: status,
      AdminApprovedBy: userId,
      AdminApprovedAt: new Date(),
      Notes: updatedNotes,
    });

  return { message: `CSR decision '${status}' recorded successfully` };
}

// ─── Consolidated View ──────────────────────────────────────────────────────

export async function getConsolidatedApplication(appId: number) {
  const application = await db('Applications')
    .join('Students', 'Applications.StudentID', 'Students.StudentID')
    .join('Users', 'Students.UserID', 'Users.UserID')
    .join('Scholarships', 'Applications.ScholarshipID', 'Scholarships.ScholarshipID')
    .select(
      'Applications.*',
      'Scholarships.Name as ScholarshipName',
      'Scholarships.PerStudentAmount as ScholarshipAmount',
      'Students.*',
      'Users.FullName',
      'Users.Email',
      'Users.Phone'
    )
    .where('Applications.ApplicationID', appId)
    .first();

  if (!application) throw new NotFoundError('Application not found');

  const documents = await db('DocumentChecklist').where('ApplicationID', appId);
  const bgChecks = await db('BackgroundChecks').where('ApplicationID', appId);

  return {
    application,
    documents,
    bgChecks
  };
}
