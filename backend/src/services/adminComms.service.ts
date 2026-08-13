import { Knex } from 'knex';
import db from '../config/database';
import { NotFoundError } from '../utils/errors';
import { AnnouncementInput, BroadcastInput } from '../validators/adminComms.validator';
import { WorkflowActor } from './workflow.service';
import { writeAudit } from './audit.service';

const broadcastWhere: Record<BroadcastInput['audience'], string> = {
  AllStudents: "u.Role = 'Student'",
  PendingDocuments: "u.Role = 'Student' AND EXISTS (SELECT 1 FROM Students st JOIN Applications a ON a.StudentID=st.StudentID WHERE st.UserID=u.UserID AND a.Status IN ('Submitted','AutoMatched','DocAuditInProgress'))",
  Approved: "u.Role = 'Student' AND EXISTS (SELECT 1 FROM Students st JOIN Applications a ON a.StudentID=st.StudentID WHERE st.UserID=u.UserID AND a.Status IN ('CSRApproved','PaymentPending','PaymentInitiated'))",
  Funded: "u.Role = 'Student' AND EXISTS (SELECT 1 FROM Students st JOIN Applications a ON a.StudentID=st.StudentID WHERE st.UserID=u.UserID AND a.Status='PaymentCompleted')",
};

async function insertNotifications(trx: Knex.Transaction, where: string, type: string, title: string, message: string) {
  const payload = JSON.stringify({ title });
  await trx.raw(`INSERT INTO Notifications (UserID, Type, Channel, Message, Payload, IsSent, RetryCount, NextAttemptAt)
    SELECT DISTINCT u.UserID, ?, 'InApp', ?, ?, 0, 0, SYSUTCDATETIME() FROM Users u
    WHERE u.IsActive = 1 AND ${where}`, [type, message, payload]);
  const count = await trx.raw(`SELECT COUNT(DISTINCT u.UserID) AS count FROM Users u WHERE u.IsActive = 1 AND ${where}`);
  return Number(Array.isArray(count) ? count[0]?.count ?? 0 : 0);
}

export function listAnnouncements() {
  return db('AdminAnnouncements as a').leftJoin('Users as u', 'u.UserID', 'a.CreatedBy')
    .select('a.*', 'u.FullName as CreatedByName').whereNot('a.Status', 'Archived').orderBy('a.CreatedAt', 'desc').limit(100);
}

export async function createAnnouncement(input: AnnouncementInput, actor: WorkflowActor) {
  return db.transaction(async (trx) => {
    const values = { Title: input.title, Message: input.message, Audience: input.audience, Status: input.status,
      CreatedBy: actor.userId, PublishedAt: input.status === 'Published' ? new Date() : null,
      ExpiresAt: input.expiresAt ? new Date(input.expiresAt) : null };
    const inserted = await trx('AdminAnnouncements').insert(values).returning('*'); const announcement = inserted[0];
    if (input.status === 'Published') {
      const where = input.audience === 'Students' ? "u.Role = 'Student'" : input.audience === 'Staff' ? "u.Role <> 'Student'" : '1=1';
      await insertNotifications(trx, where, 'ADMIN_ANNOUNCEMENT', input.title, input.message);
    }
    await writeAudit(trx, { userId: actor.userId, action: 'ANNOUNCEMENT_CREATED', entityType: 'Announcement',
      entityId: announcement.AnnouncementID, newValue: { audience: input.audience, status: input.status },
      requestId: actor.requestId, ipAddress: actor.ipAddress });
    return announcement;
  });
}

export async function updateAnnouncement(id: number, input: AnnouncementInput, actor: WorkflowActor) {
  return db.transaction(async (trx) => {
    const existing = await trx('AdminAnnouncements').where({ AnnouncementID: id }).whereNot({ Status: 'Archived' }).first();
    if (!existing) throw new NotFoundError('Announcement not found.');
    const firstPublish = existing.Status !== 'Published' && input.status === 'Published';
    const values = {
      Title: input.title, Message: input.message, Audience: input.audience, Status: input.status,
      PublishedAt: firstPublish ? new Date() : existing.PublishedAt,
      ExpiresAt: input.expiresAt ? new Date(input.expiresAt) : null, UpdatedAt: new Date(),
    };
    await trx('AdminAnnouncements').where({ AnnouncementID: id }).update(values);
    if (firstPublish) {
      const where = input.audience === 'Students' ? "u.Role = 'Student'" : input.audience === 'Staff' ? "u.Role <> 'Student'" : '1=1';
      await insertNotifications(trx, where, 'ADMIN_ANNOUNCEMENT', input.title, input.message);
    }
    await writeAudit(trx, { userId: actor.userId, action: 'ANNOUNCEMENT_UPDATED', entityType: 'Announcement', entityId: id,
      oldValue: { title: existing.Title, message: existing.Message, audience: existing.Audience, status: existing.Status,
        expiresAt: existing.ExpiresAt }, newValue: { audience: input.audience, status: input.status, expiresAt: values.ExpiresAt },
      requestId: actor.requestId, ipAddress: actor.ipAddress });
    return { ...existing, ...values, AnnouncementID: id };
  });
}

export async function archiveAnnouncement(id: number, actor: WorkflowActor) {
  return db.transaction(async (trx) => {
    const updated = await trx('AdminAnnouncements').where({ AnnouncementID: id }).whereNot({ Status: 'Archived' })
      .update({ Status: 'Archived', UpdatedAt: new Date() });
    if (!updated) throw new NotFoundError('Announcement not found.');
    await writeAudit(trx, { userId: actor.userId, action: 'ANNOUNCEMENT_ARCHIVED', entityType: 'Announcement', entityId: id,
      requestId: actor.requestId, ipAddress: actor.ipAddress });
  });
}

export function listBroadcasts() {
  return db('AdminBroadcasts as b').leftJoin('Users as u', 'u.UserID', 'b.CreatedBy')
    .select('b.*', 'u.FullName as CreatedByName').orderBy('b.CreatedAt', 'desc').limit(50);
}

export async function sendBroadcast(input: BroadcastInput, actor: WorkflowActor) {
  return db.transaction(async (trx) => {
    const recipientCount = await insertNotifications(trx, broadcastWhere[input.audience], 'ADMIN_BROADCAST', input.title, input.message);
    const inserted = await trx('AdminBroadcasts').insert({ Title: input.title, Message: input.message,
      Audience: input.audience, RecipientCount: recipientCount, CreatedBy: actor.userId }).returning('*');
    await writeAudit(trx, { userId: actor.userId, action: 'BROADCAST_SENT', entityType: 'Broadcast',
      entityId: inserted[0].BroadcastID, newValue: { audience: input.audience, recipientCount },
      requestId: actor.requestId, ipAddress: actor.ipAddress });
    return inserted[0];
  });
}

export function listSupportTickets() {
  return db('SupportTickets as t').join('Users as u', 'u.UserID', 't.UserID')
    .leftJoin('Students as st', 'st.UserID', 'u.UserID').leftJoin('Users as assignee', 'assignee.UserID', 't.AssignedTo')
    .select('t.*', 'u.FullName as RequesterName', 'u.Email as RequesterEmail', 'st.State', 'assignee.FullName as AssigneeName')
    .orderBy([{ column: 't.Status', order: 'asc' }, { column: 't.CreatedAt', order: 'asc' }]).limit(200);
}

export async function updateTicket(id: number, status: string, actor: WorkflowActor) {
  return db.transaction(async (trx) => {
    const ticket = await trx('SupportTickets').where({ TicketID: id }).first();
    if (!ticket) throw new NotFoundError('Support ticket not found.');
    await trx('SupportTickets').where({ TicketID: id }).update({ Status: status,
      AssignedTo: actor.userId, ResolvedAt: status === 'Resolved' ? new Date() : null,
      LastActivityAt: new Date(), UpdatedAt: new Date(), Version: trx.raw('Version + 1') });
    await trx('SupportTicketEvents').insert({ TicketID: id, ActorUserID: actor.userId,
      EventType: 'AdminStatusChange', FromValue: ticket.Status, ToValue: status });
    await writeAudit(trx, { userId: actor.userId, action: 'SUPPORT_ADMIN_UPDATE', entityType: 'SupportTicket',
      entityId: id, oldValue: { status: ticket.Status }, newValue: { status },
      requestId: actor.requestId, ipAddress: actor.ipAddress });
    return { ticketId: id, status };
  });
}
