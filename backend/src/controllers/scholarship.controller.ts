import { Request, Response, NextFunction } from 'express';
import {
  createScholarship,
  getAllScholarships,
  getScholarshipById,
  updateScholarship,
} from '../services/scholarship.service';
import {
  addEligibilityRule,
  getEligibilityRules,
  updateEligibilityRule,
  deleteEligibilityRule,
} from '../services/eligibilityRule.service';
import { sendSuccess } from '../utils/response';
import {
  createScholarshipSchema,
  updateScholarshipSchema,
  eligibilityRuleSchema,
  updateEligibilityRuleSchema,
} from '../validators/scholarship.validator';
import { ValidationError } from '../utils/errors';
import { parsePage } from '../utils/pagination';
import { requestActor } from '../utils/requestActor';

// ─── Helper: parse Zod and throw on failure ─────────────────────────────────

function parseOrThrow<T>(schema: import('zod/v4').ZodSchema<T>, body: unknown): T {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new ValidationError(msg);
  }
  return parsed.data;
}

// ─── Scholarship CRUD ───────────────────────────────────────────────────────

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = parseOrThrow(createScholarshipSchema, req.body);
    const result = await createScholarship(data, requestActor(req));
    sendSuccess(res, result, 'Scholarship created', 201);
  } catch (error) { next(error); }
}

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit } = parsePage(req.query.page, req.query.limit, 20, 100);
    const filters = {
      status: req.query.status as string | undefined,
      page,
      limit,
    };
    const result = await getAllScholarships(filters);
    sendSuccess(res, result, 'Scholarships retrieved');
  } catch (error) { next(error); }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id);
    const result = await getScholarshipById(id);
    sendSuccess(res, result, 'Scholarship retrieved');
  } catch (error) { next(error); }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params.id);
    const data = parseOrThrow(updateScholarshipSchema, req.body);
    const result = await updateScholarship(id, data, requestActor(req));
    sendSuccess(res, result, 'Scholarship updated');
  } catch (error) { next(error); }
}

// ─── Eligibility Rules ──────────────────────────────────────────────────────

export async function addRule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const scholarshipId = Number(req.params.id);
    const data = parseOrThrow(eligibilityRuleSchema, { ...req.body, scholarshipId });
    const result = await addEligibilityRule(data, requestActor(req));
    sendSuccess(res, result, 'Eligibility rule added', 201);
  } catch (error) { next(error); }
}

export async function getRules(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const scholarshipId = Number(req.params.id);
    const result = await getEligibilityRules(scholarshipId);
    sendSuccess(res, result, 'Eligibility rules retrieved');
  } catch (error) { next(error); }
}

export async function deleteRule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ruleId = Number(req.params.ruleId);
    await deleteEligibilityRule(ruleId, requestActor(req));
    sendSuccess(res, null, 'Eligibility rule deleted');
  } catch (error) { next(error); }
}

export async function updateRule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ruleId = Number(req.params.ruleId);
    const data = parseOrThrow(updateEligibilityRuleSchema, req.body);
    sendSuccess(res, await updateEligibilityRule(ruleId, data, requestActor(req)), 'Eligibility rule updated');
  } catch (error) { next(error); }
}
