import db from '../config/database';
import { NotFoundError } from '../utils/errors';

export function listSponsors() {
  return db('Sponsors').select('SponsorID', 'SponsorName', 'TotalFund', 'FundAllocated', 'FundUtilized', 'Status')
    .where({ Status: 'Active' }).orderBy('SponsorName').limit(200);
}

export async function getScholarshipOverview(scholarshipId: number) {
  const scholarship = await db('Scholarships as sc').join('Sponsors as sp', 'sp.SponsorID', 'sc.SponsorID')
    .select('sc.*', 'sp.SponsorName').where('sc.ScholarshipID', scholarshipId).first();
  if (!scholarship) throw new NotFoundError('Scholarship not found.');
  const [statuses, rules, paid, reserved, recentAudit] = await Promise.all([
    db('Applications').select('Status').count('* as count').where({ ScholarshipID: scholarshipId }).groupBy('Status'),
    db('EligibilityRules').where({ ScholarshipID: scholarshipId }).orderBy('RuleID'),
    db('Payments as p').join('Applications as a', 'a.ApplicationID', 'p.ApplicationID')
      .where({ 'a.ScholarshipID': scholarshipId, 'p.Status': 'Completed' }).sum('p.Amount as total').first(),
    db('Applications').where({ ScholarshipID: scholarshipId })
      .whereIn('Status', ['CSRApproved', 'PaymentPending', 'PaymentInitiated'])
      .sum('ScholarshipAmount as total').first(),
    db('AuditLogs as al').leftJoin('Users as u', 'u.UserID', 'al.UserID')
      .select('al.Action', 'al.CreatedAt', 'u.FullName as ActorName')
      .where({ 'al.EntityType': 'Scholarship', 'al.EntityID': scholarshipId })
      .orderBy('al.CreatedAt', 'desc').limit(20),
  ]);
  const statusCounts = Object.fromEntries(statuses.map((row) => [String(row.Status), Number(row.count)]));
  const applicationCount = Object.values(statusCounts).reduce((sum, count) => sum + Number(count), 0);
  return { scholarship, rules, statusCounts, applicationCount,
    disbursed: Number(paid?.total ?? 0), reserved: Number(reserved?.total ?? 0), recentAudit };
}
