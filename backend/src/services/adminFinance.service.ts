import db from '../config/database';
import { numericSearchId, prefixSearchPattern } from '../utils/searchPattern';

export async function getAdminPaymentQueue(page = 1, limit = 20, search = '') {
  const query = db('Applications as a').join('Students as s', 's.StudentID', 'a.StudentID')
    .join('Users as u', 'u.UserID', 's.UserID').join('Scholarships as sc', 'sc.ScholarshipID', 'a.ScholarshipID')
    .whereIn('a.Status', ['CSRApproved', 'PaymentPending', 'PaymentInitiated', 'PaymentFailed']);
  if (search.trim()) { const needle = prefixSearchPattern(search); const searchId = numericSearchId(search);
    query.where((builder) => { builder.where('u.FullName', 'like', needle).orWhere('sc.Name', 'like', needle);
      if (searchId) builder.orWhere('a.ApplicationID', searchId); }); }
  const [totalRow, amountRow, rows] = await Promise.all([
    query.clone().countDistinct('a.ApplicationID as count').first(),
    query.clone().sum('a.ScholarshipAmount as amount').first(),
    query.clone().select('a.ApplicationID', 'a.Status', 'a.ScholarshipAmount', 'a.StageEnteredAt',
      'u.FullName as StudentName', 'sc.Name as ScholarshipName', 's.BankName')
      .orderBy('a.StageEnteredAt', 'asc').offset((page - 1) * limit).limit(limit),
  ]);
  return { applications: rows, pagination: { page, limit, total: Number(totalRow?.count ?? 0) },
    summary: { amount: Number(amountRow?.amount ?? 0) } };
}
