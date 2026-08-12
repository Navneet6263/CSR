import { Request, Response, NextFunction } from 'express';
import { AuthError } from '../utils/errors';
import {
  checklistDocumentDownload, studentDocumentDownload,
} from '../services/documentDownload.service';

function sendDocument(res: Response, file: { path: string; mimeType: string; originalName: string }): void {
  const safeName = file.originalName.replace(/["\r\n]/g, '_');
  res.setHeader('Content-Type', file.mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${safeName}"`);
  res.setHeader('Cache-Control', 'private, no-store');
  res.sendFile(file.path);
}

export async function downloadStudentDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AuthError();
    sendDocument(res, await studentDocumentDownload(Number(req.params.id), req.user));
  } catch (error) { next(error); }
}

export async function downloadChecklistDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AuthError();
    sendDocument(res, await checklistDocumentDownload(Number(req.params.id), req.user));
  } catch (error) { next(error); }
}
