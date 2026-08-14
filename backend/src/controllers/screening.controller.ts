import { NextFunction, Request, Response } from 'express';
import * as screening from '../services/screening.service';
import { ForbiddenError, ValidationError } from '../utils/errors';
import { parsePage } from '../utils/pagination';
import { requestActor } from '../utils/requestActor';
import { sendSuccess } from '../utils/response';
import { CsrDecisionInput, ScreeningDecisionInput } from '../validators/screening.validator';
import { getCsrApplication, getCsrHistory, getCsrStats } from '../services/csrPortal.service';

function id(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) throw new ValidationError('A valid application id is required.');
  return parsed;
}

export async function getScreeningHistoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = parsePage(req.query.page, req.query.limit, 20, 100);
    sendSuccess(res, await screening.getScreeningHistory(req.user!.userId, page, limit,
      String(req.query.search ?? ''), String(req.query.decision ?? '')));
  } catch (error) { next(error); }
}

export async function getScreenerStatsHandler(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await screening.getScreenerStats(req.user!.userId)); }
  catch (error) { next(error); }
}

export async function getConsolidatedHandler(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await screening.getConsolidatedApplication(id(req.params.id), req.user!)); }
  catch (error) { next(error); }
}

export async function getPendingScreeningHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = parsePage(req.query.page, req.query.limit, 20, 100);
    sendSuccess(res, await screening.getPendingScreening(req.user!.userId, page, limit, String(req.query.search ?? '')));
  } catch (error) { next(error); }
}

export async function submitScreeningDecisionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as ScreeningDecisionInput;
    const result = await screening.submitScreeningDecision(id(req.params.id), requestActor(req), input);
    sendSuccess(res, result, 'Screening decision recorded successfully');
  } catch (error) { next(error); }
}

export async function getPendingCSRHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user!.sponsorId) throw new ForbiddenError('CSR account is not linked to a sponsor.');
    const { page, limit } = parsePage(req.query.page, req.query.limit, 20, 100);
    sendSuccess(res, await screening.getPendingCSR(req.user!.sponsorId, page, limit, String(req.query.search ?? '')));
  } catch (error) { next(error); }
}

export async function submitCSRDecisionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user!.sponsorId) throw new ForbiddenError('CSR account is not linked to a sponsor.');
    const { decision, notes } = req.body as CsrDecisionInput;
    const result = await screening.submitCSRDecision(
      id(req.params.id), requestActor(req), req.user!.sponsorId, decision, notes,
    );
    sendSuccess(res, result, 'CSR decision recorded successfully');
  } catch (error) { next(error); }
}

export async function getCsrStatsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user!.sponsorId) throw new ForbiddenError('CSR account is not linked to a sponsor.');
    sendSuccess(res, await getCsrStats(req.user!.sponsorId));
  } catch (error) { next(error); }
}

export async function getCsrHistoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user!.sponsorId) throw new ForbiddenError('CSR account is not linked to a sponsor.');
    const { page, limit } = parsePage(req.query.page, req.query.limit, 20, 100);
    sendSuccess(res, await getCsrHistory(req.user!.sponsorId, page, limit,
      String(req.query.search ?? ''), String(req.query.status ?? '')));
  } catch (error) { next(error); }
}

export async function getCsrApplicationHandler(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await getCsrApplication(id(req.params.id), req.user!)); }
  catch (error) { next(error); }
}
