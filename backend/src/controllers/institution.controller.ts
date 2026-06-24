import { Request, Response, NextFunction } from 'express';
import { getAllInstitutions, getInstitutionById } from '../services/institution.service';
import { sendSuccess } from '../utils/response';
import { NotFoundError } from '../utils/errors';

// ─── Get All Institutions ───────────────────────────────────────────────────

export async function getAll(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const filters = {
      type: req.query.type as string | undefined,
      state: req.query.state as string | undefined,
    };
    const result = await getAllInstitutions(filters);
    sendSuccess(res, result, 'Institutions retrieved');
  } catch (error) {
    next(error);
  }
}

// ─── Get Institution By ID ──────────────────────────────────────────────────

export async function getById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = Number(req.params.id);
    const result = await getInstitutionById(id);

    if (!result) {
      throw new NotFoundError('Institution not found.');
    }

    sendSuccess(res, result, 'Institution retrieved');
  } catch (error) {
    next(error);
  }
}
