import { Request, Response, NextFunction } from 'express';
import {
  createApplication,
  submitApplication,
  getApplicationById,
  getStudentApplications,
  getAllApplications,
} from '../services/application.service';
import { getStudentByUserId } from '../services/student.service';
import { sendSuccess } from '../utils/response';
import { createApplicationSchema } from '../validators/application.validator';
import { ValidationError, AuthError, NotFoundError } from '../utils/errors';

// ─── Helper ─────────────────────────────────────────────────────────────────

async function requireStudentId(userId: number): Promise<number> {
  const student = await getStudentByUserId(userId);
  if (!student) throw new NotFoundError('Student profile not found. Complete your profile first.');
  return student.StudentID;
}

// ─── Create Draft Application ───────────────────────────────────────────────

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AuthError();
    const studentId = await requireStudentId(req.user.userId);

    const parsed = createApplicationSchema.safeParse(req.body);
    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
      throw new ValidationError(msg);
    }

    const result = await createApplication(studentId, parsed.data.scholarshipId);
    sendSuccess(res, result, 'Application created as draft', 201);
  } catch (error) { next(error); }
}

// ─── Submit Application ─────────────────────────────────────────────────────

export async function submit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AuthError();
    const studentId = await requireStudentId(req.user.userId);
    const applicationId = Number(req.params.id);

    const result = await submitApplication(applicationId, studentId);
    sendSuccess(res, result, 'Application submitted');
  } catch (error) { next(error); }
}

// ─── Get Single Application ────────────────────────────────────────────────

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id);
    const result = await getApplicationById(id);
    sendSuccess(res, result, 'Application retrieved');
  } catch (error) { next(error); }
}

// ─── My Applications (Student) ──────────────────────────────────────────────

export async function getMyApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AuthError();
    const studentId = await requireStudentId(req.user.userId);
    const result = await getStudentApplications(studentId);
    sendSuccess(res, result, 'Your applications retrieved');
  } catch (error) { next(error); }
}

// ─── All Applications (Admin) ───────────────────────────────────────────────

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters = {
      status: req.query.status as string | undefined,
      scholarshipId: req.query.scholarshipId ? Number(req.query.scholarshipId) : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };
    const result = await getAllApplications(filters);
    sendSuccess(res, result, 'Applications retrieved');
  } catch (error) { next(error); }
}
