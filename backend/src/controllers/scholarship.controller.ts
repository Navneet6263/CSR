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
  updateScholarshipContentSchema,
} from '../validators/scholarship.validator';
import { ValidationError } from '../utils/errors';
import { parsePage } from '../utils/pagination';
import { requestActor } from '../utils/requestActor';
import {
  generateScholarshipContent, getScholarshipContentForAdmin, publishScholarshipContent,
  saveSponsorLogo, scholarshipLogoDownload, scholarshipSourceDownload, updateScholarshipContent,
} from '../services/scholarshipContent.service';

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

function sendAsset(res: Response, asset: { path: string; mimeType: string; originalName: string }, cache = false) {
  const safeName = asset.originalName.replace(/["\r\n]/g, '_');
  res.setHeader('Content-Type', asset.mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${safeName}"`);
  res.setHeader('Cache-Control', cache ? 'private, max-age=3600' : 'private, no-store');
  res.sendFile(asset.path);
}

export async function getContent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { sendSuccess(res, await getScholarshipContentForAdmin(Number(req.params.id), requestActor(req)),
    'Scholarship content retrieved.'); }
  catch (error) { next(error); }
}

export async function generateContent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { sendSuccess(res, await generateScholarshipContent(Number(req.params.id), requestActor(req), req.file),
    req.file ? 'Source structured into a review draft.' : 'Professional review draft generated.'); }
  catch (error) { next(error); }
}

export async function saveContent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = parseOrThrow(updateScholarshipContentSchema, req.body);
    sendSuccess(res, await updateScholarshipContent(Number(req.params.id), data.content, data.changeNote, requestActor(req)),
      'Scholarship content saved for review.');
  } catch (error) { next(error); }
}

export async function publishContent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { sendSuccess(res, await publishScholarshipContent(Number(req.params.id), requestActor(req)),
    'Scholarship content approved and published.'); }
  catch (error) { next(error); }
}

export async function uploadSponsorLogo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) throw new ValidationError('Select a PNG or JPEG company logo.');
    sendSuccess(res, await saveSponsorLogo(Number(req.params.id), requestActor(req), req.file), 'Sponsor logo updated.');
  } catch (error) { next(error); }
}

export async function downloadSponsorLogo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { sendAsset(res, await scholarshipLogoDownload(Number(req.params.id)), true); }
  catch (error) { next(error); }
}

export async function downloadContentSource(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { sendAsset(res, await scholarshipSourceDownload(Number(req.params.id))); }
  catch (error) { next(error); }
}
