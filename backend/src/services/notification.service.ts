import { Knex } from 'knex';
import db from '../config/database';
import { NotFoundError } from '../utils/errors';

export async function queueNotification(
  trx: Knex.Transaction,
  userId: number,
  type: string,
  message: string,
  payload?: unknown,
  channel: 'Email' | 'SMS' | 'InApp' = 'InApp',
): Promise<void> {
  const recipient = await trx('Users').select('Role').where({ UserID: userId }).first();
  const applicationId = payload && typeof payload === 'object'
    ? Number((payload as Record<string, unknown>).applicationId ?? 0) : 0;
  const paths: Record<string, string> = {
    Student: `/student/applications/${applicationId}`, DocReviewer: `/reviewer/audit/${applicationId}`,
    BGCheckOfficer: `/officer/applications/${applicationId}`, ScreeningOfficer: `/screener/evaluate/${applicationId}`,
    CSRPartner: `/csr/applications/${applicationId}`, Finance: '/finance', SupportAgent: '/support/tickets',
  };
  const payloadStatus = payload && typeof payload === 'object'
    ? String((payload as Record<string, unknown>).status ?? '') : '';
  const urgent = /REUPLOAD|CORRECTION|FAILED|REJECT|DECLIN/i.test(`${type} ${payloadStatus}`);
  await trx('Notifications').insert({
    UserID: userId,
    Type: type,
    Channel: channel,
    Message: message.slice(0, 4000),
    Payload: payload === undefined ? null : JSON.stringify(payload),
    IsSent: false,
    RetryCount: 0,
    NextAttemptAt: new Date(),
    Priority: urgent ? 'High' : 'Normal',
    RequiresAction: urgent,
    ActionURL: applicationId ? paths[recipient?.Role] ?? null : null,
    GroupKey: applicationId ? `application:${applicationId}` : null,
  });
}

export function getUserNotifications(userId: number, limit = 50) {
  return db('Notifications').select('NotificationID', 'Type', 'Channel', 'Message', 'Payload', 'Priority',
    'RequiresAction', 'ActionURL', 'GroupKey', 'ExpiresAt', 'IsRead', 'ReadAt', 'AcknowledgedAt', 'CreatedAt')
    .where({ UserID: userId }).where((query) => query.whereNull('ExpiresAt').orWhere('ExpiresAt', '>', new Date()))
    .orderBy('CreatedAt', 'desc').limit(limit);
}

export async function markAllNotificationsRead(userId: number) {
  const updated = await db('Notifications').where({ UserID: userId, IsRead: false })
    .update({ IsRead: true, ReadAt: new Date() });
  return { updated };
}

export async function markNotificationRead(notificationId: number, userId: number) {
  const updated = await db('Notifications').where({ NotificationID: notificationId, UserID: userId })
    .update({ IsRead: true, ReadAt: new Date() });
  if (!updated) throw new NotFoundError('Notification not found.');
  return { notificationId, isRead: true };
}

export async function applicationStudentUserId(
  trx: Knex.Transaction,
  applicationId: number,
): Promise<number | undefined> {
  const row = await trx('Applications as a')
    .join('Students as s', 's.StudentID', 'a.StudentID')
    .select('s.UserID')
    .where('a.ApplicationID', applicationId)
    .first();
  return row?.UserID;
}
