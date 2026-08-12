import db from '../config/database';

export function getRecentAuditEvents(limit = 100) {
  return db('AuditLogs as a').leftJoin('Users as u', 'u.UserID', 'a.UserID')
    .select('a.LogID', 'a.Action', 'a.EntityType', 'a.EntityID', 'a.CreatedAt', 'a.RequestID',
      'u.FullName as ActorName', 'u.Role as ActorRole')
    .orderBy('a.CreatedAt', 'desc').limit(limit);
}
