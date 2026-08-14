import { Request, Response, NextFunction } from 'express';
import {
  createApplication, submitApplication, getApplicationById,
  getStudentApplications, getAllApplications,
} from '../services/application.service';
import { getStudentByUserId } from '../services/student.service';
import { sendSuccess } from '../utils/response';
import { createApplicationSchema } from '../validators/application.validator';
import { AuthError, NotFoundError, ValidationError } from '../utils/errors';
import { parsePage } from '../utils/pagination';
import { requestActor } from '../utils/requestActor';

async function requireStudentId(userId: number): Promise<number> {
  const student = await getStudentByUserId(userId);
  if (!student) throw new NotFoundError('Student profile not found.');
  return student.StudentID;
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AuthError();
    const parsed = createApplicationSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues.map((item) => item.message).join('; '));
    const studentId = await requireStudentId(req.user.userId);
    const result = await createApplication(studentId, parsed.data.scholarshipId, requestActor(req));
    sendSuccess(res, result, 'Application draft ready.', 201);
  } catch (error) { next(error); }
}

export async function submit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AuthError();
    const studentId = await requireStudentId(req.user.userId);
    const applicationId = Number(req.params.id);
    await submitApplication(applicationId, studentId, requestActor(req));
    const result = await getApplicationById(applicationId, req.user);
    sendSuccess(res, result, 'Application submitted.');
  } catch (error) { next(error); }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AuthError();
    sendSuccess(res, await getApplicationById(Number(req.params.id), req.user), 'Application retrieved.');
  } catch (error) { next(error); }
}

export async function getMyApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AuthError();
    const studentId = await requireStudentId(req.user.userId);
    const { page, limit } = parsePage(req.query.page, req.query.limit, 10, 50);
    sendSuccess(res, await getStudentApplications(studentId, { page, limit,
      search: String(req.query.search ?? '').trim().slice(0, 100) || undefined,
      bucket: String(req.query.bucket ?? '') || undefined }), 'Applications retrieved.');
  } catch (error) { next(error); }
}

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit } = parsePage(req.query.page, req.query.limit);
    const result = await getAllApplications({
      status: req.query.status as string | undefined,
      scholarshipId: req.query.scholarshipId ? Number(req.query.scholarshipId) : undefined,
      page,
      limit,
    });
    sendSuccess(res, result, 'Applications retrieved.');
  } catch (error) { next(error); }
}
