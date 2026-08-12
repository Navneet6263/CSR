import { NextFunction, Request, Response } from 'express';
import * as read from '../services/supportRead.service';
import * as tickets from '../services/supportTickets.service';
import { ValidationError } from '../utils/errors';
import { requestActor } from '../utils/requestActor';
import { sendSuccess } from '../utils/response';

function positive(value: string | string[] | undefined, label: string) {
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  if (!Number.isInteger(parsed) || parsed < 1) throw new ValidationError(`Invalid ${label}.`);
  return parsed;
}

export async function overview(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await read.getSupportOverview()); } catch (error) { next(error); }
}

export async function students(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1); const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));
    sendSuccess(res, await read.listSupportStudents(String(req.query.query ?? '').trim().slice(0, 100), page, limit));
  } catch (error) { next(error); }
}

export async function student(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await read.getSupportStudent(positive(req.params.id, 'student id'), requestActor(req))); }
  catch (error) { next(error); }
}

export async function activity(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await read.listRecentActivity()); } catch (error) { next(error); }
}

export async function recordActivity(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await read.recordActivity(req.user!.userId, req.body, res.locals.requestId), 'Recorded', 201); }
  catch (error) { next(error); }
}

export async function createTicket(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await tickets.createTicket(req.user!.userId, req.body, requestActor(req)), 'Ticket created', 201); }
  catch (error) { next(error); }
}

export async function listTickets(req: Request, res: Response, next: NextFunction) {
  try {
    const mine = req.query.mine === 'true' ? req.user!.userId : undefined;
    sendSuccess(res, await tickets.listTickets(String(req.query.status ?? ''), mine,
      String(req.query.query ?? '').trim().slice(0, 100)));
  } catch (error) { next(error); }
}

export async function ticket(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await tickets.getTicket(positive(req.params.id, 'ticket id'))); }
  catch (error) { next(error); }
}

export async function updateTicket(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await tickets.updateTicket(positive(req.params.id, 'ticket id'), req.body, requestActor(req))); }
  catch (error) { next(error); }
}

export async function addTicketEvent(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await tickets.addTicketEvent(positive(req.params.id, 'ticket id'), req.body, requestActor(req)), 'Event recorded', 201); }
  catch (error) { next(error); }
}
