import db from '../config/database';
import { AuthPayload } from '../types';
import { assertApplicationAccess } from './applicationAccess.service';
import { numericSearchId, prefixSearchPattern } from '../utils/searchPattern';

export async function getCsrStats(sponsorId: number) {
  const [sponsor, statuses, states, genders] = await Promise.all([
    db('Sponsors').where({ SponsorID: sponsorId }).select('SponsorName', 'TotalFund', 'FundAllocated', 'FundUtilized').first(),
    db('Applications').where({ SponsorID: sponsorId }).select('Status').count('* as count').groupBy('Status'),
    db('Applications as a').join('Students as s', 's.StudentID', 'a.StudentID')
      .where('a.SponsorID', sponsorId).whereIn('a.Status', ['CSRApproved', 'PaymentInitiated', 'PaymentCompleted'])
      .select('s.State as label').sum('a.ScholarshipAmount as amount').count('* as count').groupBy('s.State'),
    db('Applications as a').join('Students as s', 's.StudentID', 'a.StudentID')
      .where('a.SponsorID', sponsorId).whereIn('a.Status', ['CSRApproved', 'PaymentInitiated', 'PaymentCompleted'])
      .select('s.Gender as label').count('* as count').groupBy('s.Gender'),
  ]);
  const count = (wanted: string[]) => statuses.reduce((sum, row) => sum + (wanted.includes(String(row.Status)) ? Number(row.count) : 0), 0);
  return { sponsorName: sponsor?.SponsorName, totalFund: Number(sponsor?.TotalFund ?? 0),
    allocated: Number(sponsor?.FundAllocated ?? 0), utilized: Number(sponsor?.FundUtilized ?? 0),
    pending: count(['ScreeningApproved']), approved: count(['CSRApproved', 'PaymentInitiated', 'PaymentCompleted']),
    declined: count(['CSRDeclined']), beneficiaries: count(['CSRApproved', 'PaymentInitiated', 'PaymentCompleted']),
    stateDistribution: states.map((row) => ({ label: row.label || 'Unknown', amount: Number(row.amount ?? 0), count: Number(row.count) })),
    genderDistribution: genders.map((row) => ({ label: row.label || 'Unspecified', count: Number(row.count) })),
  };
}

export async function getCsrHistory(sponsorId: number, page = 1, limit = 20, search = '', status = '') {
  const query = db('Applications as a').join('Students as s', 's.StudentID', 'a.StudentID')
    .join('Users as u', 'u.UserID', 's.UserID').join('Scholarships as sc', 'sc.ScholarshipID', 'a.ScholarshipID')
    .where('a.SponsorID', sponsorId).whereIn('a.Status', ['CSRApproved', 'CSRDeclined', 'PaymentInitiated', 'PaymentCompleted', 'PaymentFailed']);
  if (status && status !== 'All') query.where('a.Status', status);
  if (search.trim()) {
    const needle = prefixSearchPattern(search);
    const searchId = numericSearchId(search);
    query.where((builder) => { builder.where('u.FullName', 'like', needle).orWhere('sc.Name', 'like', needle);
      if (searchId) builder.orWhere('a.ApplicationID', searchId); });
  }
  const totalRow = await query.clone().clearSelect().clearOrder().countDistinct('a.ApplicationID as count').first();
  const applications = await query.select('a.ApplicationID', 'a.Status', 'a.ScholarshipAmount', 'a.UpdatedAt',
    'u.FullName as StudentName', 'sc.Name as ScholarshipName')
    .orderBy('a.UpdatedAt', 'desc').offset((page - 1) * limit).limit(limit);
  return { applications, pagination: { page, limit, total: Number(totalRow?.count ?? 0) } };
}

export async function getCsrApplication(applicationId: number, user: AuthPayload) {
  await assertApplicationAccess(applicationId, user);
  const application = await db('Applications as a').join('Students as s', 's.StudentID', 'a.StudentID')
    .join('Users as u', 'u.UserID', 's.UserID').join('Scholarships as sc', 'sc.ScholarshipID', 'a.ScholarshipID')
    .leftJoin('Institutions as i', 'i.InstitutionID', 's.InstitutionID')
    .select('a.ApplicationID', 'a.Status', 'a.SubmissionDate', 'a.ScholarshipAmount',
      'sc.Name as ScholarshipName', 'u.FullName', 's.Category', 's.State', 's.Course',
      's.AnnualFamilyIncome', 's.PreviousYearMarks', 's.TenthMarks', 's.TwelfthMarks',
      's.EnrollmentYear', 's.CurrentSemesterOrYear', 's.TuitionFee', 'i.Name as InstitutionName')
    .where('a.ApplicationID', applicationId).first();
  const [documents, checks, decisions] = await Promise.all([
    db('DocumentChecklist').select('DocumentType', 'Status', 'ReviewedAt').where({ ApplicationID: applicationId }),
    db('BackgroundChecks').select('CheckType', 'Result', 'CompletedAt').where({ ApplicationID: applicationId }),
    db('ApplicationDecisions').select('Stage', 'Decision', 'Reason', 'CreatedAt')
      .where({ ApplicationID: applicationId }).whereIn('Stage', ['Screening', 'CSR']).orderBy('CreatedAt', 'asc'),
  ]);
  return { application, documents, backgroundChecks: checks, decisions };
}
