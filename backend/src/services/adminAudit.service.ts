import db from '../config/database';
import { numericSearchId, prefixSearchPattern } from '../utils/searchPattern';

const toneCase = `CASE
  WHEN a.Action LIKE '%REJECT%' OR a.Action LIKE '%FAIL%' OR a.Action LIKE '%DECLIN%' OR a.Action LIKE '%DELETE%' THEN 'danger'
  WHEN a.Action LIKE '%HOLD%' OR a.Action LIKE '%PAUS%' OR a.Action LIKE '%REUPLOAD%' OR a.Action LIKE '%DEACTIV%' THEN 'warn'
  WHEN a.Action LIKE '%APPROV%' OR a.Action LIKE '%VERIF%' OR a.Action LIKE '%COMPLETE%' OR a.Action LIKE '%CREATED%' OR a.Action LIKE '%RESUM%' OR a.Action LIKE '%PUBLISH%' THEN 'ok'
  ELSE 'info' END`;

interface Filters { page?: number; limit?: number; search?: string; tone?: string }

export async function getRecentAuditEvents(filters: Filters = {}) {
  const page = filters.page ?? 1; const limit = filters.limit ?? 25;
  const base = db('AuditLogs as a').leftJoin('Users as u', 'u.UserID', 'a.UserID');
  if (filters.search) {
    const search = prefixSearchPattern(filters.search);
    const searchId = numericSearchId(filters.search);
    base.where((query) => { query.where('a.Action', 'like', search).orWhere('a.EntityType', 'like', search)
      .orWhere('a.RequestID', 'like', search).orWhere('u.FullName', 'like', search);
      if (searchId) query.orWhere('a.EntityID', searchId); });
  }
  const facetsQuery = base.clone().select(
    db.raw(`SUM(CASE WHEN (${toneCase}) = 'ok' THEN 1 ELSE 0 END) as ok`),
    db.raw(`SUM(CASE WHEN (${toneCase}) = 'warn' THEN 1 ELSE 0 END) as warn`),
    db.raw(`SUM(CASE WHEN (${toneCase}) = 'info' THEN 1 ELSE 0 END) as info`),
    db.raw(`SUM(CASE WHEN (${toneCase}) = 'danger' THEN 1 ELSE 0 END) as danger`),
  ).first();
  if (filters.tone && ['ok', 'warn', 'info', 'danger'].includes(filters.tone)) {
    base.whereRaw(`(${toneCase}) = ?`, [filters.tone]);
  }
  const [total, events, facets] = await Promise.all([
    base.clone().clearSelect().count('* as count').first(),
    base.clone().select('a.LogID', 'a.Action', 'a.EntityType', 'a.EntityID', 'a.CreatedAt', 'a.RequestID',
      'a.IPAddress', 'a.OldValue', 'a.NewValue', 'u.FullName as ActorName', 'u.Role as ActorRole')
      .orderBy([{ column: 'a.CreatedAt', order: 'desc' }, { column: 'a.LogID', order: 'desc' }])
      .limit(limit).offset((page - 1) * limit),
    facetsQuery,
  ]);
  return { events, pagination: { page, limit, total: Number(total?.count ?? 0) }, facets: {
    ok: Number(facets?.ok ?? 0), warn: Number(facets?.warn ?? 0), info: Number(facets?.info ?? 0), danger: Number(facets?.danger ?? 0),
  } };
}
