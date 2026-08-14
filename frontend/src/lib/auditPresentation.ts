export type AuditTone = 'ok' | 'warn' | 'info' | 'danger';
export interface AuditEventView {
  id: number; actor: string; role: string; action: string; target: string; entityType: string;
  time: string; tone: AuditTone; summary: string; requestId?: string; ipAddress?: string;
}

function json(value: unknown): Record<string, unknown> | null {
  if (!value) return null;
  try { return typeof value === 'string' ? JSON.parse(value) : value as Record<string, unknown>; }
  catch { return null; }
}

function date(value: unknown) {
  return value ? new Date(String(value)).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '';
}

function detail(action: string, oldValue: Record<string, unknown> | null, next: Record<string, unknown> | null) {
  const reason = String(next?.reason ?? oldValue?.reason ?? '').trim();
  const parts: string[] = [];
  if (reason) parts.push(reason);
  if (next?.resumeAt) parts.push(`Scheduled for ${date(next.resumeAt)}`);
  if (next?.publicNotice === true) parts.push('Public notice enabled');
  if (next?.recipientCount != null) parts.push(`${String(next.recipientCount)} recipients`);
  if (!parts.length && next?.status) parts.push(`Status → ${String(next.status)}`);
  if (!parts.length && /UPDATED/.test(action)) parts.push('Record details were updated');
  return parts.join(' · ') || 'Change recorded with immutable before/after values';
}

export function mapAuditEvent(row: Record<string, unknown>): AuditEventView {
  const action = String(row.Action ?? 'ACTIVITY');
  const tone: AuditTone = /REJECT|FAIL|DECLIN|DELETE/i.test(action) ? 'danger'
    : /HOLD|PAUS|REUPLOAD|DEACTIV/i.test(action) ? 'warn'
      : /APPROV|VERIF|COMPLETE|CREATED|RESUM|PUBLISH/i.test(action) ? 'ok' : 'info';
  const oldValue = json(row.OldValue); const next = json(row.NewValue);
  const entityType = String(row.EntityType ?? 'Record');
  return {
    id: Number(row.LogID), actor: String(row.ActorName ?? 'System automation'), role: String(row.ActorRole ?? 'System'),
    action: action.toLowerCase().replaceAll('_', ' '), entityType,
    target: `${entityType} #${String(row.EntityID)}`, summary: detail(action, oldValue, next),
    time: row.CreatedAt ? date(row.CreatedAt) : '—', tone,
    requestId: row.RequestID ? String(row.RequestID) : undefined,
    ipAddress: row.IPAddress ? String(row.IPAddress) : undefined,
  };
}
