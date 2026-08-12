import db from '../config/database';
import { AuthPayload } from '../types';
import { ForbiddenError, NotFoundError } from '../utils/errors';

export async function assertApplicationAccess(applicationId: number, user: AuthPayload) {
  const application = await db('Applications as a')
    .join('Students as s', 's.StudentID', 'a.StudentID')
    .select('a.*', 's.UserID as StudentUserID')
    .where('a.ApplicationID', applicationId)
    .first();
  if (!application) throw new NotFoundError('Application not found.');
  if (user.role === 'Admin') return application;
  if (user.role === 'Student' && application.StudentUserID === user.userId) return application;
  if (user.role === 'CSRPartner' && user.sponsorId && application.SponsorID === user.sponsorId) return application;
  if (user.role === 'DocReviewer'
    && ['Submitted', 'AutoMatched', 'DocAuditInProgress', 'DocAuditComplete'].includes(application.Status)
    && (!application.AssignedDocReviewer || application.AssignedDocReviewer === user.userId)) {
    return application;
  }
  if (user.role === 'BGCheckOfficer') {
    if (application.AssignedBGOfficer === user.userId) return application;
    if (!application.AssignedBGOfficer
      && ['DocAuditComplete', 'BGCheckInProgress'].includes(application.Status)) return application;
  }
  if (user.role === 'ScreeningOfficer') {
    if (application.AssignedScreener === user.userId) return application;
    if (!application.AssignedScreener
      && ['BGCheckComplete', 'ScreeningPending'].includes(application.Status)) return application;
  }
  if (user.role === 'Finance' && ['CSRApproved', 'PaymentPending', 'PaymentInitiated', 'PaymentCompleted', 'PaymentFailed'].includes(application.Status)) {
    return application;
  }
  throw new ForbiddenError('You do not have access to this application.');
}
