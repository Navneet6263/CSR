import db from '../config/database';
import { numericSearchId, prefixSearchPattern } from '../utils/searchPattern';
import { ConflictError } from '../utils/errors';
import { writeAudit } from './audit.service';
import { WorkflowActor, lockApplication } from './workflow.service';

const docDone = ['DocAuditComplete', 'BGCheckInProgress', 'BGCheckComplete', 'ScreeningPending',
  'ScreeningApproved', 'ScreeningRejected', 'CSRPending', 'CSRApproved', 'CSRDeclined',
  'PaymentPending', 'PaymentInitiated', 'PaymentCompleted', 'PaymentFailed'];
const bgDone = ['BGCheckComplete', 'ScreeningPending', 'ScreeningApproved', 'ScreeningRejected',
  'CSRPending', 'CSRApproved', 'CSRDeclined', 'PaymentPending', 'PaymentInitiated', 'PaymentCompleted', 'PaymentFailed'];
const screeningDone = ['ScreeningApproved', 'ScreeningRejected', 'CSRPending', 'CSRApproved',
  'CSRDeclined', 'PaymentPending', 'PaymentInitiated', 'PaymentCompleted', 'PaymentFailed'];

function statusCount(rows: Array<{ Status: string; count: number | string }>, statuses: string[]) {
  const wanted = new Set(statuses);
  return rows.reduce((total, row) => total + (wanted.has(row.Status) ? Number(row.count) : 0), 0);
}

export async function getDashboardMetrics() {
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const [sponsorFunds, statusRows, pipelineFunds, held, stuck, paid, zones] = await Promise.all([
    db('Sponsors').sum('TotalFund as total').sum('FundAllocated as allocated').sum('FundUtilized as utilized').first(),
    db('Applications').select('Status').count('* as count').groupBy('Status'),
    db('Applications').whereIn('Status', ['CSRApproved', 'PaymentPending', 'PaymentInitiated'])
      .sum('ScholarshipAmount as total').first(),
    db('Applications').where({ IsHeldByAdmin: true }).count('* as count').first(),
    db('Applications').whereIn('Status', ['DocAuditComplete', 'BGCheckInProgress'])
      .where('StageEnteredAt', '<', fortyEightHoursAgo).count('* as count').first(),
    db('Payments').where({ Status: 'Completed' }).count('* as count').first(),
    db('Students as st').join('Applications as a', 'a.StudentID', 'st.StudentID')
      .select('st.State as state').countDistinct('a.ApplicationID as count')
      .whereNotNull('st.State').groupBy('st.State').orderBy('count', 'desc').limit(8),
  ]);
  const allStatuses = statusRows as Array<{ Status: string; count: number | string }>;
  const applied = statusCount(allStatuses, allStatuses.map((row) => row.Status));
  const workload = {
    docCheckers: statusCount(allStatuses, ['Submitted', 'AutoMatched', 'DocAuditInProgress']),
    bgCheckers: statusCount(allStatuses, ['DocAuditComplete', 'BGCheckInProgress']),
    screeners: statusCount(allStatuses, ['BGCheckComplete', 'ScreeningPending']),
    csrPartners: statusCount(allStatuses, ['ScreeningApproved', 'CSRPending']),
  };
  return {
    financials: {
      totalBudget: Number(sponsorFunds?.total ?? 0),
      fundAllocated: Number(sponsorFunds?.allocated ?? 0),
      fundDisbursed: Number(sponsorFunds?.utilized ?? 0),
      fundsInPipeline: Number(pipelineFunds?.total ?? 0),
    },
    funnel: {
      applied,
      docsVerified: statusCount(allStatuses, docDone),
      bgVerified: statusCount(allStatuses, bgDone),
      screened: statusCount(allStatuses, screeningDone),
      approved: statusCount(allStatuses, ['CSRApproved', 'PaymentPending', 'PaymentInitiated', 'PaymentCompleted']),
      rejected: statusCount(allStatuses, ['EligibilityFailed', 'ScreeningRejected', 'CSRDeclined', 'Cancelled']),
    },
    workload,
    operations: {
      paidStudents: Number(paid?.count ?? 0),
      pipelineCases: workload.docCheckers + workload.bgCheckers + workload.screeners + workload.csrPartners,
    },
    zones: zones.map((row) => ({ state: row.state, count: Number(row.count ?? 0) })),
    alerts: { heldApplications: Number(held?.count ?? 0), stuckAtBGCheck: Number(stuck?.count ?? 0) },
  };
}

export async function toggleApplicationHold(
  applicationId: number,
  hold: boolean,
  actor: WorkflowActor,
  reason?: string,
) {
  return db.transaction(async (trx) => {
    const application = await lockApplication(trx, applicationId);
    if (Boolean(application.IsHeldByAdmin) === hold) {
      return { applicationId, isHeld: hold, version: application.Version };
    }
    const version = Number(application.Version ?? 0) + 1;
    const updated = await trx('Applications').where({ ApplicationID: applicationId, Version: application.Version ?? 0 })
      .update({ IsHeldByAdmin: hold, AdminHoldReason: hold ? reason : null,
        Version: version, UpdatedAt: new Date() });
    if (updated !== 1) throw new ConflictError('Application changed; refresh and retry.');
    await writeAudit(trx, { userId: actor.userId, action: hold ? 'APPLICATION_HELD' : 'APPLICATION_RELEASED',
      entityType: 'Application', entityId: applicationId,
      oldValue: { held: Boolean(application.IsHeldByAdmin), reason: application.AdminHoldReason },
      newValue: { held: hold, reason }, requestId: actor.requestId, ipAddress: actor.ipAddress });
    return { applicationId, isHeld: hold, version };
  });
}

export async function bulkToggleApplicationHold(
  applicationIds: number[], hold: boolean, reason: string, actor: WorkflowActor,
) {
  return db.transaction(async (trx) => {
    const applications = await trx('Applications').select('ApplicationID', 'IsHeldByAdmin', 'AdminHoldReason', 'Version')
      .whereIn('ApplicationID', applicationIds).orderBy('ApplicationID').forUpdate();
    if (applications.length !== applicationIds.length) {
      const found = new Set(applications.map((row) => Number(row.ApplicationID)));
      throw new ConflictError(`Applications not found: ${applicationIds.filter((value) => !found.has(value)).join(', ')}`);
    }
    const changed = applications.filter((row) => Boolean(row.IsHeldByAdmin) !== hold);
    if (changed.length) {
      await trx('Applications').whereIn('ApplicationID', changed.map((row) => row.ApplicationID))
        .update({ IsHeldByAdmin: hold, AdminHoldReason: hold ? reason : null,
          Version: trx.raw('Version + 1'), UpdatedAt: new Date() });
      for (const row of changed) {
        await writeAudit(trx, { userId: actor.userId, action: hold ? 'APPLICATION_HELD' : 'APPLICATION_RELEASED',
          entityType: 'Application', entityId: row.ApplicationID,
          oldValue: { held: Boolean(row.IsHeldByAdmin), reason: row.AdminHoldReason },
          newValue: { held: hold, reason }, requestId: actor.requestId, ipAddress: actor.ipAddress });
      }
    }
    return { requested: applicationIds.length, changed: changed.length, unchanged: applicationIds.length - changed.length };
  });
}

export type PipelineRole = 'reviewer' | 'bgchecker' | 'screener' | 'csr';
const pipelineStatuses: Record<PipelineRole, string[]> = {
  reviewer: ['Submitted', 'AutoMatched', 'DocAuditInProgress'],
  bgchecker: ['DocAuditComplete', 'BGCheckInProgress'],
  screener: ['BGCheckComplete', 'ScreeningPending'],
  csr: ['ScreeningApproved', 'CSRPending'],
};

export async function getPipelineByRole(role: PipelineRole, page = 1, limit = 25, searchTerm = '') {
  const assignmentByRole: Record<PipelineRole, string | null> = {
    reviewer: 'a.AssignedDocReviewer', bgchecker: 'a.AssignedBGOfficer',
    screener: 'a.AssignedScreener', csr: null,
  };
  const base = db('Applications as a').join('Students as s', 'a.StudentID', 's.StudentID')
    .join('Users as u', 's.UserID', 'u.UserID').join('Scholarships as sc', 'a.ScholarshipID', 'sc.ScholarshipID')
    .whereIn('a.Status', pipelineStatuses[role]);
  const filtered = base.clone();
  if (searchTerm) {
    const search = prefixSearchPattern(searchTerm);
    const searchId = numericSearchId(searchTerm);
    filtered.where((query) => { query.where('u.FullName', 'like', search).orWhere('sc.Name', 'like', search)
      .orWhere('a.Status', 'like', search); if (searchId) query.orWhere('a.ApplicationID', searchId); });
  }
  const assignment = assignmentByRole[role];
  const workloadQuery = assignment
    ? base.clone().select(db.raw(`${assignment} as userId`)).count('* as count')
      .whereNotNull(assignment).groupBy(assignment)
    : base.clone().select('a.SponsorID as sponsorId').count('* as count')
      .whereNotNull('a.SponsorID').groupBy('a.SponsorID');
  const [count, data, workload] = await Promise.all([
    filtered.clone().count('* as count').first(),
    filtered.clone().select('a.ApplicationID as applicationId', 'a.Status as status',
      'a.SubmissionDate as submissionDate', 'a.StageEnteredAt as stageEnteredAt',
      'a.ScholarshipAmount as scholarshipAmount',
      'a.IsHeldByAdmin as isHeldByAdmin', 'a.AdminHoldReason as adminHoldReason',
      'a.AssignedDocReviewer as assignedDocReviewer', 'a.AssignedBGOfficer as assignedBGOfficer',
      'a.AssignedScreener as assignedScreener', 's.State as studentState',
      's.PreviousYearMarks as previousYearMarks',
      'sc.Name as scholarshipName', 'u.FullName as studentName', 'u.Email as studentEmail')
      .orderBy([{ column: 'a.StageEnteredAt', order: 'asc' }, { column: 'a.ApplicationID', order: 'asc' }])
      .limit(limit).offset((page - 1) * limit),
    workloadQuery,
  ]);
  return { data: data.map((row) => ({ ...row, isHeldByAdmin: Boolean(row.isHeldByAdmin) })),
    total: Number(count?.count ?? 0),
    workload: workload.map((row) => ({ userId: row.userId == null ? undefined : Number(row.userId),
      sponsorId: row.sponsorId == null ? undefined : Number(row.sponsorId), count: Number(row.count) })) };
}
