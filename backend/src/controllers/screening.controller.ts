import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import {
  getPendingScreening,
  submitScreeningDecision,
  getPendingCSR,
  submitCSRDecision,
} from '../services/screening.service';
import { ScreeningDecisionInput, CsrDecisionInput } from '../validators/screening.validator';

export async function getPendingScreeningHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const applications = await getPendingScreening();
    sendSuccess(res, applications, 'Pending screening applications retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function submitScreeningDecisionHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const appId = parseInt(req.params.id as string, 10);
    const userId = req.user!.userId;
    const { decision, notes } = req.body as ScreeningDecisionInput;

    const result = await submitScreeningDecision(appId, userId, decision, notes);
    sendSuccess(res, result, result.message);
  } catch (error) {
    next(error);
  }
}

export async function getPendingCSRHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const applications = await getPendingCSR();
    sendSuccess(res, applications, 'Pending CSR applications retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function submitCSRDecisionHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const appId = parseInt(req.params.id as string, 10);
    const userId = req.user!.userId;
    const { decision, notes } = req.body as CsrDecisionInput;

    const result = await submitCSRDecision(appId, userId, decision, notes);
    sendSuccess(res, result, result.message);
  } catch (error) {
    next(error);
  }
}
