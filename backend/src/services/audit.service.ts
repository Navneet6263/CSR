import { Knex } from 'knex';

export interface AuditEntry {
  userId?: number;
  action: string;
  entityType: string;
  entityId: number;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
  requestId?: string;
}

function safeJson(value: unknown): string | null {
  if (value === undefined) return null;
  const json = JSON.stringify(value);
  return json.length <= 20_000 ? json : JSON.stringify({ truncated: true });
}

export async function writeAudit(trx: Knex.Transaction, entry: AuditEntry): Promise<void> {
  await trx('AuditLogs').insert({
    UserID: entry.userId ?? null,
    Action: entry.action,
    EntityType: entry.entityType,
    EntityID: entry.entityId,
    OldValue: safeJson(entry.oldValue),
    NewValue: safeJson(entry.newValue),
    IPAddress: entry.ipAddress?.slice(0, 64) ?? null,
    RequestID: entry.requestId?.slice(0, 100) ?? null,
  });
}
