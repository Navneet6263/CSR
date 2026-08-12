import { NextFunction, Request, Response } from 'express';
import * as finance from '../services/finance.service';
import { ValidationError } from '../utils/errors';
import { parsePage } from '../utils/pagination';
import { requestActor } from '../utils/requestActor';
import { sendSuccess } from '../utils/response';

function paymentId(value: unknown) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) throw new ValidationError('A valid payment id is required.');
  return parsed;
}

function idempotencyKey(req: Request) {
  const key = req.get('Idempotency-Key')?.trim();
  if (!key || key.length < 16 || key.length > 100 || !/^[A-Za-z0-9._:-]+$/.test(key)) {
    throw new ValidationError('A valid Idempotency-Key header (16-100 characters) is required.');
  }
  return key;
}

export async function getPendingInitiation(req: Request, res: Response, next: NextFunction) {
  try {
    const { limit } = parsePage(undefined, req.query.limit, 50, 100);
    sendSuccess(res, await finance.getPendingInitiation(limit));
  } catch (error) { next(error); }
}

export async function getFinanceOverview(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await finance.getFinanceOverview()); }
  catch (error) { next(error); }
}

export async function initiatePayment(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await finance.initiatePayment(req.body, requestActor(req), idempotencyKey(req));
    sendSuccess(res, data, 'Payment initiated successfully', 201);
  } catch (error) { next(error); }
}

export async function getPendingVerifications(req: Request, res: Response, next: NextFunction) {
  try {
    const { limit } = parsePage(undefined, req.query.limit, 50, 100);
    sendSuccess(res, await finance.getPendingVerifications(req.user!.userId, limit));
  } catch (error) { next(error); }
}

export async function verifyPayment(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await finance.verifyPayment(paymentId(req.params.id), requestActor(req), req.body);
    sendSuccess(res, data, 'Payment verified successfully');
  } catch (error) { next(error); }
}

export async function getPaymentHistory(req: Request, res: Response, next: NextFunction) {
  try {
    if (!['completed', 'failed'].includes(String(req.params.status))) {
      throw new ValidationError('Payment history status must be completed or failed.');
    }
    const status = req.params.status === 'failed' ? 'Failed' : 'Completed';
    const { limit } = parsePage(undefined, req.query.limit, 100, 100);
    sendSuccess(res, await finance.getPaymentHistory(status, limit));
  } catch (error) { next(error); }
}

export async function getFinanceAudit(req: Request, res: Response, next: NextFunction) {
  try {
    const { limit } = parsePage(undefined, req.query.limit, 100, 100);
    sendSuccess(res, await finance.getFinanceAudit(limit));
  } catch (error) { next(error); }
}
