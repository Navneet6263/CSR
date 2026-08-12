import { NextFunction, Request, Response } from 'express';
import { checkPublicEligibility, getPublicPortal } from '../services/publicPortal.service';
import { sendSuccess } from '../utils/response';

export async function portal(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await getPublicPortal(), 'Public scholarship data retrieved.'); }
  catch (error) { next(error); }
}

export async function eligibility(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await checkPublicEligibility(req.body), 'Eligibility evaluated.'); }
  catch (error) { next(error); }
}
