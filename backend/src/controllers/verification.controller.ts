import { NextFunction, Request, Response } from 'express';
import db from '../config/database';
import * as background from '../services/backgroundCheck.service';
import * as documents from '../services/documentAudit.service';
import { NotFoundError, ValidationError } from '../utils/errors';
import { parsePage } from '../utils/pagination';
import { requestActor } from '../utils/requestActor';
import { sendSuccess } from '../utils/response';
import { BgCheckInput, DocReviewInput } from '../validators/verification.validator';

function id(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) throw new ValidationError('A valid id is required.');
  return parsed;
}

export async function getDocsPending(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = parsePage(req.query.page, req.query.limit, 20, 100);
    sendSuccess(res, await documents.getPendingReviewApplications(req.user!.userId, page, limit, String(req.query.search ?? '')));
  } catch (error) { next(error); }
}

export async function reviewDoc(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, rejectionReason } = req.body as DocReviewInput;
    const result = await documents.reviewDocument(id(req.params.id), requestActor(req), status, rejectionReason);
    sendSuccess(res, result, 'Document reviewed successfully');
  } catch (error) { next(error); }
}

export async function getReUploads(req: Request, res: Response, next: NextFunction) {
  try {
    const student = await db('Students').where({ UserID: req.user!.userId }).first();
    if (!student) throw new NotFoundError('Student profile not found.');
    sendSuccess(res, await documents.getStudentReUploads(student.StudentID));
  } catch (error) { next(error); }
}

export async function uploadDoc(req: Request, res: Response, next: NextFunction) {
  try {
    const student = await db('Students').where({ UserID: req.user!.userId }).first();
    if (!student) throw new NotFoundError('Student profile not found.');
    const { applicationId, documentType } = req.body;
    const result = await documents.linkReuploadedDocument(applicationId, student.StudentID, documentType, requestActor(req));
    sendSuccess(res, result, 'Replacement document linked successfully', 201);
  } catch (error) { next(error); }
}

export async function getBGChecksPending(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = parsePage(req.query.page, req.query.limit, 20, 100);
    sendSuccess(res, await background.getPendingBGChecks(req.user!.userId, page, limit, String(req.query.search ?? '')));
  } catch (error) { next(error); }
}

export async function submitBGCheck(req: Request, res: Response, next: NextFunction) {
  try {
    const input = req.body as BgCheckInput;
    const result = await background.submitBGCheck(id(req.params.applicationId), requestActor(req),
      input.checkType, input.result, input.notes, input.evidenceUrl);
    sendSuccess(res, result, 'Background check recorded successfully', 201);
  } catch (error) { next(error); }
}

export async function getAppDocs(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await documents.getApplicationDocumentDetails(id(req.params.id), req.user!));
  } catch (error) { next(error); }
}

export async function getReviewerLogsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = parsePage(req.query.page, req.query.limit, 20, 100);
    sendSuccess(res, await documents.getReviewerLogs(req.user!.userId, page, limit,
      String(req.query.search ?? ''), String(req.query.action ?? '')));
  } catch (error) { next(error); }
}

export async function getStatsHandler(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await documents.getReviewerStats(req.user!.userId)); } catch (error) { next(error); }
}

export async function getBGCheckDetailsHandler(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await background.getBGCheckDetails(id(req.params.applicationId), req.user!)); }
  catch (error) { next(error); }
}

export async function getBGOfficerLogsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = parsePage(req.query.page, req.query.limit, 20, 100);
    sendSuccess(res, await background.getBGOfficerLogs(req.user!.userId, page, limit,
      String(req.query.search ?? ''), String(req.query.status ?? '')));
  } catch (error) { next(error); }
}

export async function getBGOfficerStatsHandler(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await background.getBGOfficerStats(req.user!.userId)); } catch (error) { next(error); }
}
