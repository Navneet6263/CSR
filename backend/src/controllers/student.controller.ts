import { Request, Response, NextFunction } from 'express';
import { getStudentProfile, updateStudentProfile } from '../services/student.service';
import { matchStudentToScholarships } from '../services/autoMatcher.service';
import { listStudentDocuments, saveStudentDocument } from '../services/studentDocument.service';
import { removeStoredFile } from '../services/documentStorage.service';
import { sendSuccess } from '../utils/response';
import { updateStudentProfileSchema } from '../validators/student.validator';
import { AuthError, ValidationError } from '../utils/errors';

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AuthError();
    sendSuccess(res, await getStudentProfile(req.user.userId), 'Student profile retrieved.');
  } catch (error) { next(error); }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AuthError();
    const parsed = updateStudentProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; '));
    }
    const updated = await updateStudentProfile(req.user.userId, parsed.data);
    const matchResults = await matchStudentToScholarships(updated.StudentID);
    sendSuccess(res, { ...updated, matchResults }, 'Profile updated.');
  } catch (error) { next(error); }
}

export async function uploadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AuthError();
    if (!req.body.docType || !req.file) {
      if (req.file) await removeStoredFile(req.file.path);
      throw new ValidationError('Document type and file are required.');
    }
    const result = await saveStudentDocument(req.user.userId, req.body.docType, req.file);
    sendSuccess(res, result, 'Document uploaded securely.', 201);
  } catch (error) { next(error); }
}

export async function getDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AuthError();
    sendSuccess(res, await listStudentDocuments(req.user.userId), 'Documents retrieved.');
  } catch (error) { next(error); }
}

export async function getMatches(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AuthError();
    const student = await getStudentProfile(req.user.userId);
    const rawIds = String(req.query.scholarshipIds ?? '').split(',').filter(Boolean);
    const scholarshipIds = rawIds.length ? rawIds.map(Number)
      .filter((value) => Number.isInteger(value) && value > 0).slice(0, 50) : undefined;
    sendSuccess(res, await matchStudentToScholarships(student.StudentID, scholarshipIds), 'Scholarship matches retrieved.');
  } catch (error) { next(error); }
}
