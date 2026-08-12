import db from '../config/database';
import { ConflictError, NotFoundError } from '../utils/errors';
import { writeAudit } from './audit.service';
import { WorkflowActor } from './workflow.service';
import type { CreateSupportTicketInput, SupportEventInput, UpdateSupportTicketInput } from '../validators/support.validator';

const dueHours = { Low: 48, Normal: 24, High: 8, Urgent: 4 } as const;

export async function createTicket(userId: number, input: CreateSupportTicketInput, actor: WorkflowActor) {
  const dueAt = new Date(Date.now() + dueHours[input.priority] * 3_600_000);
  return db.transaction(async (trx) => {
    const inserted = await trx('SupportTickets').insert({ UserID: userId, Subject: input.subject,
      Message: input.message, Category: input.category, Priority: input.priority, Status: 'Open',
      Source: 'Portal', DueAt: dueAt, LastActivityAt: new Date() }).returning('*');
    const ticket = inserted[0];
    await trx('SupportTicketEvents').insert({ TicketID: ticket.TicketID, ActorUserID: userId,
      EventType: 'Created', Message: input.message });
    await writeAudit(trx, { userId, action: 'SUPPORT_TICKET_CREATED', entityType: 'SupportTicket',
      entityId: ticket.TicketID, newValue: { category: input.category, priority: input.priority },
      requestId: actor.requestId, ipAddress: actor.ipAddress });
    return ticket;
  });
}

export function listTickets(status?: string, assignedTo?: number, query?: string, limit = 100) {
  const statement = db('SupportTickets as t').join('Users as u', 'u.UserID', 't.UserID')
    .leftJoin('Students as st', 'st.UserID', 'u.UserID')
    .leftJoin('Users as assignee', 'assignee.UserID', 't.AssignedTo')
    .select('t.*', 'u.FullName as RequesterName', 'u.Email as RequesterEmail',
      'st.State', 'assignee.FullName as AssigneeName');
  if (status && status !== 'All') statement.where('t.Status', status);
  if (assignedTo) statement.where('t.AssignedTo', assignedTo);
  if (query) statement.where((builder) => builder.where('t.Subject', 'like', `%${query}%`)
    .orWhere('u.FullName', 'like', `%${query}%`).orWhere('u.Email', 'like', `%${query}%`));
  return statement.orderByRaw(`CASE t.Priority WHEN 'Urgent' THEN 1 WHEN 'High' THEN 2 WHEN 'Normal' THEN 3 ELSE 4 END`)
    .orderBy([{ column: 't.DueAt', order: 'asc' }, { column: 't.TicketID', order: 'asc' }]).limit(limit);
}

export async function getTicket(ticketId: number) {
  const record = await db('SupportTickets as t').join('Users as u', 'u.UserID', 't.UserID')
    .leftJoin('Users as assignee', 'assignee.UserID', 't.AssignedTo')
    .select('t.*', 'u.FullName as RequesterName', 'u.Email as RequesterEmail',
      'assignee.FullName as AssigneeName').where('t.TicketID', ticketId).first();
  if (!record) throw new NotFoundError('Support ticket not found.');
  const [events, contacts] = await Promise.all([
    db('SupportTicketEvents as e').join('Users as actor', 'actor.UserID', 'e.ActorUserID')
      .select('e.*', 'actor.FullName as ActorName').where('e.TicketID', ticketId).orderBy('e.CreatedAt', 'desc'),
    db('SupportContactAttempts as c').join('Users as actor', 'actor.UserID', 'c.ActorUserID')
      .select('c.*', 'actor.FullName as ActorName').where('c.TicketID', ticketId).orderBy('c.CreatedAt', 'desc'),
  ]);
  return { ticket: record, events, contacts };
}

export async function updateTicket(ticketId: number, input: UpdateSupportTicketInput, actor: WorkflowActor) {
  return db.transaction(async (trx) => {
    const current = await trx('SupportTickets').where({ TicketID: ticketId }).first();
    if (!current) throw new NotFoundError('Support ticket not found.');
    const next = { Status: input.status ?? current.Status, Priority: input.priority ?? current.Priority,
      AssignedTo: input.assignToMe ? actor.userId : current.AssignedTo,
      ResolutionCode: input.status === 'Resolved' ? input.resolutionCode ?? 'Resolved' : current.ResolutionCode,
      ResolvedAt: input.status === 'Resolved' ? new Date() : null, LastActivityAt: new Date(),
      UpdatedAt: new Date(), Version: input.version + 1 };
    const updated = await trx('SupportTickets').where({ TicketID: ticketId, Version: input.version }).update(next);
    if (updated !== 1) throw new ConflictError('Ticket changed; refresh and retry.');
    await trx('SupportTicketEvents').insert({ TicketID: ticketId, ActorUserID: actor.userId,
      EventType: 'StatusChange', FromValue: current.Status, ToValue: next.Status });
    await writeAudit(trx, { userId: actor.userId, action: 'SUPPORT_TICKET_UPDATED', entityType: 'SupportTicket',
      entityId: ticketId, oldValue: { status: current.Status, priority: current.Priority, assignedTo: current.AssignedTo },
      newValue: { status: next.Status, priority: next.Priority, assignedTo: next.AssignedTo },
      requestId: actor.requestId, ipAddress: actor.ipAddress });
    return { ticketId, status: next.Status, priority: next.Priority, version: next.Version };
  });
}

export async function addTicketEvent(ticketId: number, input: SupportEventInput, actor: WorkflowActor) {
  return db.transaction(async (trx) => {
    const ticket = await trx('SupportTickets').where({ TicketID: ticketId }).first();
    if (!ticket) throw new NotFoundError('Support ticket not found.');
    const inserted = await trx('SupportTicketEvents').insert({ TicketID: ticketId,
      ActorUserID: actor.userId, EventType: input.type, Message: input.message }).returning('*');
    if (input.type === 'Contact') await trx('SupportContactAttempts').insert({ TicketID: ticketId,
      ActorUserID: actor.userId, Channel: input.channel, Outcome: input.outcome, Notes: input.message,
      FollowUpAt: input.followUpAt ? new Date(input.followUpAt) : null });
    await trx('SupportTickets').where({ TicketID: ticketId }).update({ LastActivityAt: new Date(),
      UpdatedAt: new Date(), Version: trx.raw('Version + 1') });
    await writeAudit(trx, { userId: actor.userId, action: `SUPPORT_${input.type.toUpperCase()}`,
      entityType: 'SupportTicket', entityId: ticketId, newValue: { channel: input.channel, outcome: input.outcome },
      requestId: actor.requestId, ipAddress: actor.ipAddress });
    return inserted[0];
  });
}
