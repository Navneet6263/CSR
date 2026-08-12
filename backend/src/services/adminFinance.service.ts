import db from '../config/database';

export function getAdminPaymentQueue(limit = 100) {
  return db('Applications as a').join('Students as s', 's.StudentID', 'a.StudentID')
    .join('Users as u', 'u.UserID', 's.UserID').join('Scholarships as sc', 'sc.ScholarshipID', 'a.ScholarshipID')
    .select('a.ApplicationID', 'a.Status', 'a.ScholarshipAmount', 'a.StageEnteredAt',
      'u.FullName as StudentName', 'sc.Name as ScholarshipName', 's.BankName')
    .whereIn('a.Status', ['CSRApproved', 'PaymentPending', 'PaymentInitiated', 'PaymentFailed'])
    .orderBy('a.StageEnteredAt', 'asc').limit(limit);
}
