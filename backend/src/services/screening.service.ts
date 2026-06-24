import db from '../config/database';
import { NotFoundError } from '../utils/errors';

// ─── Screening Officer Workflow ─────────────────────────────────────────────

export async function getPendingScreening() {
  return await db('Applications')
    .join('Students', 'Applications.StudentID', 'Students.StudentID')
    .join('Users', 'Students.UserID', 'Users.UserID')
    .join('Scholarships', 'Applications.ScholarshipID', 'Scholarships.ScholarshipID')
    .select(
      'Applications.ApplicationID',
      'Applications.Status',
      'Applications.SubmissionDate',
      'Applications.ScholarshipAmount',
      'Applications.Notes',
      'Scholarships.Name as ScholarshipName',
      'Students.StudentID',
      'Users.FullName as StudentName',
      'Users.Email as StudentEmail'
    )
    .where('Applications.Status', 'BGCheckComplete');
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
      'Applications.ApplicationID',
      'Applications.Status',
      'Applications.SubmissionDate',
      'Applications.ScholarshipAmount',
      'Applications.Notes',
      'Scholarships.Name as ScholarshipName',
      'Students.StudentID',
      'Users.FullName as StudentName',
      'Users.Email as StudentEmail'
    )
    .where('Applications.Status', 'ScreeningApproved');
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
