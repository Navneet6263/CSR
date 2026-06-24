import { Request, Response, NextFunction } from 'express';
import { getStudentProfile, updateStudentProfile } from '../services/student.service';
import { sendSuccess } from '../utils/response';
import { updateStudentProfileSchema } from '../validators/student.validator';
import { ValidationError, AuthError } from '../utils/errors';

// ─── Get Profile ────────────────────────────────────────────────────────────

export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AuthError();
    const profile = await getStudentProfile(req.user.userId);
    sendSuccess(res, profile, 'Student profile retrieved');
  } catch (error) {
    next(error);
  }
}

// ─── Update Profile ─────────────────────────────────────────────────────────

export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AuthError();

    const parsed = updateStudentProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      const messages = parsed.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ');
      throw new ValidationError(messages);
    }

    const updated = await updateStudentProfile(req.user.userId, parsed.data);
    sendSuccess(res, updated, 'Student profile updated');
  } catch (error) {
    next(error);
  }
}
