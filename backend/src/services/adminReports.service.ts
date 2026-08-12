import db from '../config/database';
import { ValidationError } from '../utils/errors';
import { WorkflowActor } from './workflow.service';
import { writeAudit } from './audit.service';
import { getSlaAnalytics } from './adminAnalytics.service';

export type AdminReport = 'sla' | 'funnel' | 'diversity' | 'disbursement' | 'audit';
export const adminReports: AdminReport[] = ['sla', 'funnel', 'diversity', 'disbursement', 'audit'];

function safeCell(value: unknown) {
  let text = value == null ? '' : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function csv(headers: string[], rows: unknown[][]) {
  return `\uFEFF${[headers, ...rows].map((row) => row.map(safeCell).join(',')).join('\r\n')}`;
}

async function reportData(type: AdminReport): Promise<{ headers: string[]; rows: unknown[][] }> {
  if (type === 'sla') {
    const rows = await getSlaAnalytics();
    return { headers: ['Stage', 'Threshold hours', 'Active', 'Average age hours', 'Worst age hours', 'On track', 'At risk', 'Breached'],
      rows: rows.map((row) => [row.stage, row.thresholdHours, row.total, row.averageHours.toFixed(1),
        row.worstHours.toFixed(1), row.onTrack, row.atRisk, row.breached]) };
  }
  if (type === 'funnel') {
    const rows = await db('Applications').select('Status').count('* as count').groupBy('Status').orderBy('Status');
    return { headers: ['Status', 'Applications'], rows: rows.map((row) => [row.Status, row.count]) };
  }
  if (type === 'diversity') {
    const rows = await db('Applications as a').join('Students as s', 's.StudentID', 'a.StudentID')
      .select('s.State', 's.Category').countDistinct('a.StudentID as Applicants')
      .groupBy('s.State', 's.Category').orderBy(['s.State', 's.Category']);
    return { headers: ['State', 'Category', 'Unique applicants'],
      rows: rows.map((row) => [row.State ?? 'Not provided', row.Category ?? 'Not provided', row.Applicants]) };
  }
  if (type === 'disbursement') {
    const rows = await db('Payments as p').join('Applications as a', 'a.ApplicationID', 'p.ApplicationID')
      .join('Students as s', 's.StudentID', 'a.StudentID').join('Users as u', 'u.UserID', 's.UserID')
      .join('Scholarships as sc', 'sc.ScholarshipID', 'a.ScholarshipID')
      .select('p.PaymentID', 'a.ApplicationID', 'u.FullName', 'sc.Name', 'p.Amount', 'p.Status',
        'p.ReferenceNo', 'p.UpdatedAt').orderBy('p.UpdatedAt', 'desc').limit(10_000);
    return { headers: ['Payment ID', 'Application ID', 'Student', 'Scholarship', 'Amount', 'Status', 'Reference', 'Updated at'],
      rows: rows.map((row) => [row.PaymentID, row.ApplicationID, row.FullName, row.Name, row.Amount,
        row.Status, row.ReferenceNo, row.UpdatedAt?.toISOString?.() ?? row.UpdatedAt]) };
  }
  const rows = await db('AuditLogs as a').leftJoin('Users as u', 'u.UserID', 'a.UserID')
    .select('a.LogID', 'a.Action', 'a.EntityType', 'a.EntityID', 'u.FullName', 'u.Role', 'a.RequestID', 'a.CreatedAt')
    .orderBy('a.CreatedAt', 'desc').limit(10_000);
  return { headers: ['Log ID', 'Action', 'Entity type', 'Entity ID', 'Actor', 'Role', 'Request ID', 'Created at'],
    rows: rows.map((row) => [row.LogID, row.Action, row.EntityType, row.EntityID, row.FullName, row.Role,
      row.RequestID, row.CreatedAt?.toISOString?.() ?? row.CreatedAt]) };
}

export async function exportAdminReport(value: string, actor: WorkflowActor) {
  if (!adminReports.includes(value as AdminReport)) throw new ValidationError('Unsupported report type.');
  const type = value as AdminReport;
  const result = await reportData(type);
  await db.transaction((trx) => writeAudit(trx, { userId: actor.userId, action: 'REPORT_EXPORTED',
    entityType: 'Report', entityId: 0, newValue: { type, rows: result.rows.length },
    requestId: actor.requestId, ipAddress: actor.ipAddress }));
  return { content: csv(result.headers, result.rows), filename: `${type}-report-${new Date().toISOString().slice(0, 10)}.csv` };
}
