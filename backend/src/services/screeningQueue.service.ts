import db from '../config/database';
import { numericSearchId, prefixSearchPattern } from '../utils/searchPattern';

function queueBase() {
  return db('Applications as a')
    .join('Students as s', 'a.StudentID', 's.StudentID')
    .join('Users as u', 's.UserID', 'u.UserID')
    .join('Scholarships as sc', 'a.ScholarshipID', 'sc.ScholarshipID')
    .leftJoin('Sponsors as sp', 'a.SponsorID', 'sp.SponsorID')
    .leftJoin('Institutions as i', 's.InstitutionID', 'i.InstitutionID')
    .select(
      'a.ApplicationID as applicationId', 'a.Status as status', 'a.SubmissionDate as submissionDate',
      'a.StageEnteredAt as stageEnteredAt', 'a.UpdatedAt as updatedAt',
      'a.AssignedScreener as assignedScreenerId', 'a.ScholarshipAmount as scholarshipAmount', 'a.Notes as notes',
      'a.IsHeldByAdmin as isHeldByAdmin', 'a.AdminHoldReason as adminHoldReason',
      'sc.Name as scholarshipName', 'i.Name as institutionName', 'sp.SponsorName as sponsorName',
      's.StudentID as studentId', 'u.FullName as studentName', 'u.Email as studentEmail',
      's.City as studentCity', 's.State as studentState', 's.Course as course', 's.Category as category',
      's.PreviousYearMarks as previousYearMarks',
      db.raw(`(SELECT COUNT(*) FROM DocumentChecklist docs
        WHERE docs.ApplicationID = a.ApplicationID) AS requiredDocCount`),
      db.raw(`(SELECT COUNT(*) FROM DocumentChecklist docs
        WHERE docs.ApplicationID = a.ApplicationID AND docs.Status = 'Verified') AS verifiedDocCount`),
      db.raw(`(SELECT COUNT(*) FROM BackgroundChecks bg
        WHERE bg.ApplicationID = a.ApplicationID AND bg.Result = 'Pass') AS passedBGCount`),
      db.raw(`(SELECT COUNT(*) FROM BackgroundChecks bg
        WHERE bg.ApplicationID = a.ApplicationID AND bg.Result <> 'Pass') AS flaggedBGCount`),
    );
}

function applyQueueSearch(query: ReturnType<typeof queueBase>, search: string) {
  if (!search.trim()) return query;
  const needle = prefixSearchPattern(search);
  const searchId = numericSearchId(search);
  return query.where((builder) => { builder.where('u.FullName', 'like', needle).orWhere('sc.Name', 'like', needle)
    .orWhere('sp.SponsorName', 'like', needle).orWhere('s.City', 'like', needle).orWhere('s.State', 'like', needle)
    .orWhere('s.Course', 'like', needle); if (searchId) builder.orWhere('a.ApplicationID', searchId); });
}

export async function getPendingScreening(userId: number, page = 1, limit = 20, search = '') {
  const query = applyQueueSearch(queueBase()
    .whereIn('a.Status', ['BGCheckComplete', 'ScreeningPending'])
    .where((query) => query.whereNull('a.AssignedScreener').orWhere('a.AssignedScreener', userId))
    .whereNotExists(function excludeRecordedDecision() {
      this.select(db.raw('1')).from('ApplicationDecisions as recorded')
        .whereRaw('recorded.ApplicationID = a.ApplicationID').where('recorded.Stage', 'Screening')
        .whereIn('recorded.Decision', ['Approve', 'Reject']);
    }), search);
  const totalRow = await query.clone().clearSelect().clearOrder().countDistinct('a.ApplicationID as count').first();
  const applications = await query.orderBy([{ column: 'a.StageEnteredAt', order: 'asc' }, { column: 'a.ApplicationID', order: 'asc' }])
    .offset((page - 1) * limit).limit(limit);
  return { applications, pagination: { page, limit, total: Number(totalRow?.count ?? 0) } };
}

export async function getScreeningHistory(userId: number, page = 1, limit = 20, search = '', decision = '') {
  const query = applyQueueSearch(queueBase().join('ApplicationDecisions as decision', function joinDecision() {
    this.on('decision.ApplicationID', '=', 'a.ApplicationID').andOnVal('decision.Stage', '=', 'Screening');
  }).select('decision.Decision as decision', 'decision.Reason as decisionNotes', 'decision.CreatedAt as decisionAt')
    .where('decision.ActorUserID', userId), search);
  if (decision === 'Returned') query.whereIn('decision.Decision', ['ReturnDocument', 'ReturnBackground']);
  else if (decision && decision !== 'All') query.where('decision.Decision', decision);
  const totalRow = await query.clone().clearSelect().clearOrder().countDistinct('decision.DecisionID as count').first();
  const applications = await query.orderBy('decision.CreatedAt', 'desc').offset((page - 1) * limit).limit(limit);
  return { applications, pagination: { page, limit, total: Number(totalRow?.count ?? 0) } };
}

export async function getScreenerStats(userId: number) {
  const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0);
  const base = () => db('Applications as a').whereIn('a.Status', ['BGCheckComplete', 'ScreeningPending'])
    .where((q) => q.whereNull('a.AssignedScreener').orWhere('a.AssignedScreener', userId))
    .whereNotExists(function excludeRecordedDecision() { this.select(db.raw('1')).from('ApplicationDecisions as recorded')
      .whereRaw('recorded.ApplicationID = a.ApplicationID').where('recorded.Stage', 'Screening')
      .whereIn('recorded.Decision', ['Approve', 'Reject']); });
  const decisions = () => db('ApplicationDecisions').where({ Stage: 'Screening', ActorUserID: userId });
  const [pending, assigned, available, approved, rejected, returned, today, overdue] = await Promise.all([
    base().count('* as count').first(), base().where('a.AssignedScreener', userId).count('* as count').first(),
    base().whereNull('a.AssignedScreener').count('* as count').first(),
    decisions().where('Decision', 'Approve').count('* as count').first(),
    decisions().where('Decision', 'Reject').count('* as count').first(),
    decisions().whereIn('Decision', ['ReturnDocument', 'ReturnBackground']).count('* as count').first(),
    decisions().where('CreatedAt', '>=', dayStart).count('* as count').first(),
    base().whereRaw(`COALESCE(a.StageEnteredAt, a.UpdatedAt, a.CreatedAt)
      < DATEADD(hour, -24, SYSUTCDATETIME())`).count('* as count').first(),
  ]);
  const approvedCount = Number(approved?.count ?? 0);
  const rejectedCount = Number(rejected?.count ?? 0);
  const returnedCount = Number(returned?.count ?? 0);
  const totalReviewed = approvedCount + rejectedCount + returnedCount;
  return { pending: Number(pending?.count ?? 0), assigned: Number(assigned?.count ?? 0),
    available: Number(available?.count ?? 0), approved: approvedCount, rejected: rejectedCount,
    returned: returnedCount,
    totalReviewed, today: Number(today?.count ?? 0), overdue: Number(overdue?.count ?? 0),
    approvalRate: approvedCount + rejectedCount ? Math.round(approvedCount / (approvedCount + rejectedCount) * 100) : 0 };
}

export async function getPendingCSR(sponsorId: number, page = 1, limit = 20, search = '') {
  const query = applyQueueSearch(queueBase().where('a.Status', 'ScreeningApproved').where('a.SponsorID', sponsorId), search);
  const totalRow = await query.clone().clearSelect().clearOrder().countDistinct('a.ApplicationID as count').first();
  const applications = await query.orderBy([{ column: 'a.StageEnteredAt', order: 'asc' }, { column: 'a.ApplicationID', order: 'asc' }])
    .offset((page - 1) * limit).limit(limit);
  return { applications, pagination: { page, limit, total: Number(totalRow?.count ?? 0) } };
}
