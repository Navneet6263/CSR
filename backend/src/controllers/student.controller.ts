import { Request, Response, NextFunction } from 'express';
import { getStudentProfile, updateStudentProfile } from '../services/student.service';
import { matchStudentToScholarships } from '../services/autoMatcher.service';
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
    
    // Trigger auto-matching engine after profile update
    const matchResults = await matchStudentToScholarships(updated.StudentID);
    
    sendSuccess(res, { ...updated, matchResults }, 'Student profile updated and matched');
  } catch (error) {
    next(error);
  }
}

// ─── Documents ──────────────────────────────────────────────────────────────

export async function uploadDocument(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AuthError();
    const docType = req.body.docType;
    if (!docType || !req.file) throw new ValidationError('Document type and file are required');

    const { getStudentByUserId } = await import('../services/student.service');
    const db = (await import('../config/database')).default;

    const student = await getStudentByUserId(req.user.userId);
    if (!student) throw new ValidationError('Complete profile before uploading docs');

    const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/students/${req.user.userId}/${req.file.filename}`;

    const existing = await db('StudentDocuments')
      .where({ StudentID: student.StudentID, DocumentType: docType })
      .first();

    if (existing) {
      await db('StudentDocuments')
        .where({ DocumentID: existing.DocumentID })
        .update({ FileURL: fileUrl, UploadedAt: db.fn.now() });
    } else {
      await db('StudentDocuments').insert({
        StudentID: student.StudentID,
        DocumentType: docType,
        FileURL: fileUrl
      });
    }

    sendSuccess(res, { fileUrl }, 'Document uploaded successfully');
  } catch (error) {
    next(error);
  }
}

export async function getDocuments(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AuthError();
    const { getStudentByUserId } = await import('../services/student.service');
    const db = (await import('../config/database')).default;

    const student = await getStudentByUserId(req.user.userId);
    if (!student) {
      sendSuccess(res, [], 'No documents');
      return;
    }

    const docs = await db('StudentDocuments').where({ StudentID: student.StudentID });
    sendSuccess(res, docs, 'Documents retrieved');
  } catch (error) {
    next(error);
  }
}
