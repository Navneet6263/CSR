export type AuditTone = 'ok' | 'warn' | 'info' | 'danger';
export interface AuditEventView { id: number; actor: string; role: string; action: string; target: string; time: string; tone: AuditTone }

export function mapAuditEvent(row: Record<string, unknown>): AuditEventView {
  const action = String(row.Action ?? 'ACTIVITY');
  const tone: AuditTone = /REJECT|FAIL|DECLIN/i.test(action) ? 'danger'
    : /HOLD|REUPLOAD|DEACTIV/i.test(action) ? 'warn'
      : /APPROV|VERIF|COMPLETE|CREATED/i.test(action) ? 'ok' : 'info';
  return { id: Number(row.LogID), actor: String(row.ActorName ?? 'System'), role: String(row.ActorRole ?? 'System'),
    action: action.toLowerCase().replaceAll('_', ' '), target: `${String(row.EntityType)} #${String(row.EntityID)}`,
    time: row.CreatedAt ? new Date(String(row.CreatedAt)).toLocaleString('en-IN') : '—', tone };
}
