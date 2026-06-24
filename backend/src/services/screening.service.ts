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
