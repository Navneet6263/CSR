import db from '../config/database';
import { NotFoundError } from '../utils/errors';
import type { ActivityEventInput } from '../validators/support.validator';
import { writeAudit } from './audit.service';
import { WorkflowActor } from './workflow.service';
import { profileReadiness } from './profileReadiness.service';
import { numericSearchId, prefixSearchPattern } from '../utils/searchPattern';

const activeStatuses = ['Draft', 'Submitted', 'AutoMatched', 'DocAuditInProgress', 'DocAuditComplete',
  'BGCheckInProgress', 'BGCheckComplete', 'ScreeningPending', 'ScreeningApproved', 'CSRPending',
  'CSRApproved', 'PaymentPending', 'PaymentInitiated'];

function maskEmail(value?: string) {
  if (!value) return '—';
  const [name, domain] = value.split('@');
  return `${name.slice(0, 2)}${'*'.repeat(Math.max(2, name.length - 2))}@${domain}`;
}

function maskPhone(value?: string) {
  if (!value) return '—';
  const digits = value.replace(/\D/g, '');
  return digits.length >= 4 ? `******${digits.slice(-4)}` : '******';
}

export async function getSupportOverview() {
  const since = new Date(Date.now() - 24 * 3_600_000);
  const [active, pending, incomplete, resolved, tickets, recent] = await Promise.all([
    db('AuthSessions').whereRaw('COALESCE(LastUsedAt, CreatedAt) >= ?', [since]).countDistinct('UserID as count').first(),
    db('Applications').whereIn('Status', activeStatuses.filter((status) => status !== 'Draft')).count('* as count').first(),
    db('Students').where((query) => query.whereNull('DOB').orWhereNull('Course').orWhereNull('AnnualFamilyIncome')
      .orWhereNull('BankName')).count('* as count').first(),
    db('SupportTickets').where({ Status: 'Resolved' }).where('ResolvedAt', '>=', since).count('* as count').first(),
    db('SupportTickets').select('Status', 'Priority').count('* as count').groupBy('Status', 'Priority'),
    db('AuthSessions as s').join('Users as u', 'u.UserID', 's.UserID')
      .select('u.UserID', 'u.FullName', 'u.Email', 'u.Role').max('s.LastUsedAt as LastUsedAt')
      .whereNull('s.RevokedAt').groupBy('u.UserID', 'u.FullName', 'u.Email', 'u.Role')
      .orderBy('LastUsedAt', 'desc').limit(10),
  ]);
  return {
    metrics: { activeToday: Number(active?.count ?? 0), pendingApplications: Number(pending?.count ?? 0),
      incompleteProfiles: Number(incomplete?.count ?? 0), resolvedToday: Number(resolved?.count ?? 0) },
    ticketSummary: tickets.map((row) => ({ status: row.Status, priority: row.Priority, count: Number(row.count) })),
    recentLogins: recent.map((row) => ({ userId: row.UserID, name: row.FullName,
      email: maskEmail(row.Email), role: row.Role, lastUsedAt: row.LastUsedAt })),
  };
}

export async function listSupportStudents(query = '', page = 1, limit = 25) {
  const base = db('Students as st').join('Users as u', 'u.UserID', 'st.UserID').where('u.Role', 'Student');
  if (query) { const search = prefixSearchPattern(query); const searchId = numericSearchId(query);
    base.where((builder) => { builder.where('u.FullName', 'like', search).orWhere('u.Email', 'like', search);
      if (searchId) builder.orWhere('st.StudentID', searchId); }); }
  const [total, rows] = await Promise.all([
    base.clone().count('* as count').first(),
    base.clone().select('st.*', 'u.FullName', 'u.Email', 'u.Phone', 'u.CreatedAt as RegisteredAt')
      .orderBy('u.CreatedAt', 'desc').limit(limit).offset((page - 1) * limit),
  ]);
  const ids = rows.map((row) => row.StudentID);
  const [apps, docs] = ids.length ? await Promise.all([
    db('Applications').select('StudentID', 'ApplicationID', 'Status', 'StageEnteredAt', 'UpdatedAt')
      .whereIn('StudentID', ids).orderBy('CreatedAt', 'desc'),
    db('StudentDocuments').select('StudentID').count('* as count').whereIn('StudentID', ids).groupBy('StudentID'),
  ]) : [[], []];
  return { data: rows.map((row) => {
    const latest = apps.find((app) => app.StudentID === row.StudentID);
    const count = Number(docs.find((doc) => doc.StudentID === row.StudentID)?.count ?? 0);
    const readiness = profileReadiness(row, count);
    return { studentId: row.StudentID, userId: row.UserID, name: row.FullName, email: maskEmail(row.Email),
      phone: maskPhone(row.Phone), state: row.State, course: row.Course, registeredAt: row.RegisteredAt,
      applicationId: latest?.ApplicationID ?? null, status: latest?.Status ?? 'NotStarted',
      stageEnteredAt: latest?.StageEnteredAt ?? latest?.UpdatedAt ?? null,
      completion: readiness.completion, missing: readiness.missing };
  }), pagination: { page, limit, total: Number(total?.count ?? 0) } };
}

export async function getSupportStudent(studentId: number, actor: WorkflowActor) {
  return db.transaction(async (trx) => {
    const student = await trx('Students as st').join('Users as u', 'u.UserID', 'st.UserID')
      .select('st.*', 'u.FullName', 'u.Email', 'u.Phone', 'u.CreatedAt as RegisteredAt')
      .where('st.StudentID', studentId).first();
    if (!student) throw new NotFoundError('Student not found.');
    const [applications, documents, tickets, activity] = await Promise.all([
      trx('Applications as a').join('Scholarships as sc', 'sc.ScholarshipID', 'a.ScholarshipID')
        .select('a.ApplicationID', 'a.Status', 'a.StageEnteredAt', 'a.UpdatedAt', 'a.ScholarshipAmount',
          'sc.Name as ScholarshipName').where('a.StudentID', studentId).orderBy('a.CreatedAt', 'desc'),
      trx('StudentDocuments').select('DocumentType', 'ScanStatus', 'CurrentVersion', 'UploadedAt as CreatedAt')
        .where('StudentID', studentId).orderBy('UploadedAt', 'desc'),
      trx('SupportTickets').select('TicketID', 'Subject', 'Category', 'Priority', 'Status', 'CreatedAt', 'UpdatedAt')
        .where('UserID', student.UserID).orderBy('CreatedAt', 'desc').limit(20),
      trx('UserActivityEvents').select('ActivityID', 'PageCode', 'StepCode', 'EventType', 'ErrorCode', 'OccurredAt')
        .where('UserID', student.UserID).orderBy('OccurredAt', 'desc').limit(30),
    ]);
    const readiness = profileReadiness(student, documents.length);
    await writeAudit(trx, { userId: actor.userId, action: 'SUPPORT_STUDENT_VIEWED', entityType: 'Student',
      entityId: studentId, requestId: actor.requestId, ipAddress: actor.ipAddress });
    return { student: { studentId, name: student.FullName, email: maskEmail(student.Email),
      phone: maskPhone(student.Phone), state: student.State, city: student.City, course: student.Course,
      registeredAt: student.RegisteredAt, completion: readiness.completion,
      sections: readiness.sections }, applications, documents, tickets, activity };
  });
}

export async function listRecentActivity(page = 1, limit = 20, blockersOnly = false) {
  const query = db('UserActivityEvents as e').join('Users as u', 'u.UserID', 'e.UserID').where('u.Role', 'Student');
  if (blockersOnly) query.whereNot('e.EventType', 'PageView');
  const since = new Date(Date.now() - 15 * 60_000);
  const [totalRow, facets, rows] = await Promise.all([
    query.clone().countDistinct('e.ActivityID as count').first(),
    db('UserActivityEvents as e').join('Users as u', 'u.UserID', 'e.UserID').where('u.Role', 'Student').select(
      db.raw("SUM(CASE WHEN e.EventType IN ('UploadError','ValidationError') THEN 1 ELSE 0 END) AS blocked"),
      db.raw("SUM(CASE WHEN e.EventType='HelpRequested' THEN 1 ELSE 0 END) AS help"),
      db.raw('COUNT(DISTINCT CASE WHEN e.OccurredAt >= ? THEN e.UserID END) AS active', [since]),
    ).first(),
    query.clone().select('e.ActivityID', 'e.UserID', 'u.FullName', 'e.PageCode', 'e.StepCode', 'e.EventType',
      'e.ErrorCode', 'e.OccurredAt').orderBy('e.OccurredAt', 'desc').offset((page - 1) * limit).limit(limit),
  ]);
  return { activities: rows, pagination: { page, limit, total: Number(totalRow?.count ?? 0) },
    facets: { blocked: Number(facets?.blocked ?? 0), help: Number(facets?.help ?? 0), active: Number(facets?.active ?? 0) } };
}

export async function recordActivity(userId: number, input: ActivityEventInput, requestId?: string) {
  await db('UserActivityEvents').insert({ UserID: userId, PageCode: input.pageCode,
    StepCode: input.stepCode ?? null, EventType: input.eventType, ErrorCode: input.errorCode ?? null,
    RequestID: requestId?.slice(0, 100) ?? null });
  return { recorded: true };
}
