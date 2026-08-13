import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import ExcelJS from 'exceljs';
import { Knex } from 'knex';
import db from '../config/database';
import { config } from '../config/env';
import { ScholarshipContentInput, scholarshipContentSchema } from '../validators/scholarship.validator';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors';
import { WorkflowActor } from './workflow.service';
import { writeAudit } from './audit.service';
import { removeStoredFile, resolveStorageKey } from './documentStorage.service';
import { scanDocument, validateFileSignature } from './documentScanner.service';

type Executor = Knex | Knex.Transaction;
interface UploadedFile { path: string; mimetype: string; originalname: string; size: number; }

interface ScholarshipContext {
  ScholarshipID: number;
  Name: string;
  Description?: string | null;
  PerStudentAmount: number;
  ApplicationOpenDate: Date | string;
  ApplicationCloseDate: Date | string;
  MaxApplicants?: number | null;
  SponsorID: number;
  SponsorName: string;
  SponsorEmail?: string | null;
  SponsorPhone?: string | null;
  rules: Array<Record<string, any>>;
}

const sourceExtensions: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'text/csv': '.csv', 'application/csv': '.csv', 'text/plain': '.txt',
};

function cleanName(value: string): string {
  return path.basename(value).replace(/[\x00-\x1f\x7f]/g, '').slice(0, 255) || 'scholarship-source';
}

function json(value: unknown): string { return JSON.stringify(value); }
function parseJson<T>(value: string | null | undefined): T | null {
  if (!value) return null;
  try { return JSON.parse(value) as T; } catch { return null; }
}

function amount(value: unknown): string {
  return `₹${Number(value ?? 0).toLocaleString('en-IN')}`;
}

function date(value: Date | string): string {
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function listValues(rule: Record<string, any>): string[] {
  if (!rule.ValueList) return [];
  try {
    const parsed = JSON.parse(rule.ValueList);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch { /* legacy comma-separated values */ }
  return String(rule.ValueList).split(',').map((item) => item.trim()).filter(Boolean);
}

function ruleSentence(rule: Record<string, any>): string {
  const field: Record<string, string> = {
    Income: 'Annual family income', MaxAnnualIncome: 'Annual family income', Age: 'Applicant age',
    Gender: 'Gender', Category: 'Category', State: 'State', Course: 'Course', Institution: 'Institution',
    Enrollment: 'Enrollment year', FamilySize: 'Family size', Marks: 'Previous-year marks',
  };
  const operators: Record<string, string> = {
    LT: 'must be less than', LTE: 'must be at most', GT: 'must be greater than', GTE: 'must be at least',
    EQ: 'must equal', NEQ: 'must not equal', IN: 'must be one of', NOT_IN: 'must not be one of',
  };
  const label = field[rule.RuleType] ?? String(rule.RuleType);
  if (rule.Operator === 'BETWEEN') return `${label} must be between ${rule.ValueMin} and ${rule.ValueMax}, inclusive.`;
  const value = ['IN', 'NOT_IN'].includes(rule.Operator) ? listValues(rule).join(', ') : rule.ValueMin;
  return `${label} ${operators[rule.Operator] ?? rule.Operator} ${value}.`;
}

export function buildGeneratedScholarshipContent(context: ScholarshipContext): ScholarshipContentInput {
  const eligibility = context.rules.length
    ? context.rules.map(ruleSentence)
    : ['Applicants must have a complete and verifiable student profile.'];
  const description = context.Description?.trim() ?? '';
  return {
    overview: description.length >= 20 ? description : `${context.Name} is funded by ${context.SponsorName} to support eligible students with verified academic and financial need.`,
    highlights: [
      `${amount(context.PerStudentAmount)} financial support per selected student.`,
      `Applications are open from ${date(context.ApplicationOpenDate)} to ${date(context.ApplicationCloseDate)}.`,
      context.MaxApplicants ? `Up to ${context.MaxApplicants} applications can be accepted.` : 'Applications are subject to available program capacity.',
    ],
    eligibility,
    benefits: [
      `${amount(context.PerStudentAmount)} scholarship award for approved beneficiaries.`,
      'Direct, auditable disbursement after verification and final approval.',
    ],
    requiredDocuments: [
      'Aadhaar card or approved identity proof', 'Recent passport-size photograph', 'Income certificate',
      'Previous academic marksheet', 'Bank passbook or verified bank-account proof',
    ],
    applicationSteps: [
      'Complete every required section of your student profile.',
      'Upload clear and valid copies of all required documents.',
      'Review the scholarship criteria and accept the consent declaration.',
      'Submit the application before the closing date and track its status from your dashboard.',
    ],
    termsAndConditions: [
      'All information and documents submitted by the applicant must be complete, authentic, and verifiable.',
      'Eligibility at application time does not guarantee selection or an award.',
      'The application may be rejected or an award cancelled if any information is false, incomplete, or misleading.',
      'The applicant consents to identity, academic, financial, and bank-detail verification for scholarship processing.',
      'The scholarship must be used only for legitimate education-related expenses.',
      'The sponsor and authorized review teams may request additional evidence before making a final decision.',
    ],
    contact: { email: context.SponsorEmail ?? '', phone: context.SponsorPhone ?? '', website: '' },
    faqs: [
      { question: 'Does meeting the rules guarantee selection?', answer: 'No. Every application remains subject to document verification, screening, sponsor approval, and available funds.' },
      { question: 'Can I edit my application after submission?', answer: 'Protected eligibility and identity details may be locked while verification is in progress. Contact support if a correction is required.' },
    ],
  };
}

const headings: Record<keyof Pick<ScholarshipContentInput, 'overview' | 'highlights' | 'eligibility' | 'benefits' | 'requiredDocuments' | 'applicationSteps' | 'termsAndConditions'>, string[]> = {
  overview: ['overview', 'about', 'description', 'objective', 'purpose'],
  highlights: ['highlights', 'key features', 'program highlights'],
  eligibility: ['eligibility', 'who can apply', 'eligibility criteria'],
  benefits: ['benefits', 'award', 'scholarship amount', 'financial assistance'],
  requiredDocuments: ['required documents', 'documents required', 'document checklist', 'documents'],
  applicationSteps: ['application process', 'how to apply', 'application steps', 'process'],
  termsAndConditions: ['terms and conditions', 'terms & conditions', 'conditions', 'important instructions'],
};

function normalizedHeading(value: string): string {
  return value.toLowerCase().replace(/[:\-–—]+$/g, '').replace(/\s+/g, ' ').trim();
}

function isHeading(line: string): keyof typeof headings | undefined {
  const normalized = normalizedHeading(line);
  return (Object.keys(headings) as Array<keyof typeof headings>)
    .find((key) => headings[key].some((heading) => normalized === heading || normalized.startsWith(`${heading}:`)));
}

function items(lines: string[]): string[] {
  return lines.flatMap((line) => line.split(/\s*[•●▪;]\s*/))
    .map((line) => line.replace(/^[-*\d.)\s]+/, '').trim())
    .filter((line) => line.length >= 3).slice(0, 30);
}

export function buildContentFromText(context: ScholarshipContext, rawText: string): ScholarshipContentInput {
  const fallback = buildGeneratedScholarshipContent(context);
  const lines = rawText.replace(/\r/g, '').split('\n').map((line) => line.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const buckets = new Map<keyof typeof headings, string[]>();
  let active: keyof typeof headings | undefined;
  const intro: string[] = [];
  for (const line of lines) {
    const heading = isHeading(line);
    if (heading) {
      active = heading;
      const afterColon = line.includes(':') ? line.slice(line.indexOf(':') + 1).trim() : '';
      if (afterColon) buckets.set(heading, [...(buckets.get(heading) ?? []), afterColon]);
      continue;
    }
    if (active) buckets.set(active, [...(buckets.get(active) ?? []), line]);
    else if (intro.join(' ').length < 1500) intro.push(line);
  }
  const overviewText = (buckets.get('overview') ?? intro).join(' ').slice(0, 5000).trim();
  const pick = (key: Exclude<keyof typeof headings, 'overview'>, fallbackItems: string[]) => {
    const parsed = items(buckets.get(key) ?? []);
    return parsed.length ? parsed : fallbackItems;
  };
  return scholarshipContentSchema.parse({
    ...fallback,
    overview: overviewText.length >= 20 ? overviewText : fallback.overview,
    highlights: pick('highlights', fallback.highlights),
    eligibility: pick('eligibility', fallback.eligibility),
    benefits: pick('benefits', fallback.benefits),
    requiredDocuments: pick('requiredDocuments', fallback.requiredDocuments),
    applicationSteps: pick('applicationSteps', fallback.applicationSteps),
    termsAndConditions: pick('termsAndConditions', fallback.termsAndConditions),
  });
}

async function contextFor(scholarshipId: number, executor: Executor = db): Promise<ScholarshipContext> {
  const scholarship = await executor('Scholarships as sc').join('Sponsors as sp', 'sp.SponsorID', 'sc.SponsorID')
    .select('sc.*', 'sp.SponsorName', 'sp.Email as SponsorEmail', 'sp.Phone as SponsorPhone')
    .where('sc.ScholarshipID', scholarshipId).first();
  if (!scholarship) throw new NotFoundError('Scholarship not found.');
  const rules = await executor('EligibilityRules').where({ ScholarshipID: scholarshipId }).orderBy('RuleID');
  return { ...scholarship, rules } as ScholarshipContext;
}

async function validateSourceSignature(file: UploadedFile): Promise<void> {
  if (file.mimetype === 'application/pdf') return validateFileSignature(file.path, file.mimetype);
  if (file.mimetype.includes('openxmlformats')) {
    const handle = await fs.promises.open(file.path, 'r');
    try {
      const signature = Buffer.alloc(4); await handle.read(signature, 0, 4, 0);
      if (signature[0] !== 0x50 || signature[1] !== 0x4b) throw new ValidationError('Office file is not a valid DOCX or XLSX archive.');
    } finally { await handle.close(); }
    return;
  }
  const sample = await fs.promises.readFile(file.path);
  if (sample.includes(0)) throw new ValidationError('Text or CSV source contains invalid binary content.');
}

async function storeSource(file: UploadedFile, scholarshipId: number) {
  await validateSourceSignature(file);
  await scanDocument(file.path);
  const extension = sourceExtensions[file.mimetype];
  if (!extension) throw new ValidationError('Unsupported scholarship source format.');
  const storageKey = path.join('scholarships', String(scholarshipId), 'sources', `${crypto.randomUUID()}${extension}`);
  const destination = path.resolve(config.privateUploadRoot, storageKey);
  if (!destination.startsWith(`${config.privateUploadRoot}${path.sep}`)) throw new ValidationError('Invalid storage path.');
  await fs.promises.mkdir(path.dirname(destination), { recursive: true });
  await fs.promises.rename(file.path, destination);
  return { storageKey, destination, originalName: cleanName(file.originalname), mimeType: file.mimetype };
}

async function extractText(filePath: string, mimeType: string): Promise<string> {
  let text = '';
  if (mimeType === 'application/pdf') {
    text = (await pdfParse(await fs.promises.readFile(filePath))).text;
  } else if (mimeType.includes('wordprocessingml')) {
    text = (await mammoth.extractRawText({ path: filePath })).value;
  } else if (mimeType.includes('spreadsheetml')) {
    const workbook = new ExcelJS.Workbook(); await workbook.xlsx.readFile(filePath);
    const rows: string[] = [];
    workbook.eachSheet((sheet) => sheet.eachRow((row) => {
      const values = Array.isArray(row.values) ? row.values.slice(1) : [row.values];
      rows.push(values.map(String).join(' | '));
    }));
    text = rows.join('\n');
  } else {
    text = await fs.promises.readFile(filePath, 'utf8');
  }
  const normalized = text.replace(/\u0000/g, '').replace(/[ \t]+/g, ' ').trim();
  if (normalized.length < 20) throw new ValidationError('The uploaded source does not contain enough readable text. Use a text-based PDF, DOCX, XLSX, CSV, or TXT file.');
  return normalized.slice(0, 100_000);
}

function sourceType(mimeType?: string): string {
  if (!mimeType) return 'Generated';
  if (mimeType === 'application/pdf') return 'PDF';
  if (mimeType.includes('wordprocessingml')) return 'DOCX';
  if (mimeType.includes('spreadsheetml')) return 'XLSX';
  if (mimeType.includes('csv')) return 'CSV';
  return 'TXT';
}

async function saveVersion(trx: Knex.Transaction, row: Record<string, any>, contentJson: string, actor: WorkflowActor, note: string) {
  await trx('ScholarshipContentVersions').insert({
    ContentID: row.ContentID, VersionNumber: row.DraftVersion, ContentJSON: contentJson,
    SourceType: row.SourceType, SourceStorageKey: row.SourceStorageKey ?? null,
    SourceOriginalName: row.SourceOriginalName ?? null, EditedBy: actor.userId, ChangeNote: note,
  });
}

export async function ensureScholarshipContent(scholarshipId: number, actor?: WorkflowActor) {
  const existing = await db('ScholarshipContents').where({ ScholarshipID: scholarshipId }).first();
  if (existing) return existing;
  const context = await contextFor(scholarshipId);
  const contentJson = json(buildGeneratedScholarshipContent(context));
  return db.transaction(async (trx) => {
    const inserted = await trx('ScholarshipContents').insert({ ScholarshipID: scholarshipId, DraftJSON: contentJson,
      ReviewStatus: 'Draft', DraftVersion: 1, SourceType: 'Generated' }).returning('*');
    const row = inserted[0];
    if (actor) await saveVersion(trx, row, contentJson, actor, 'Initial professional draft generated');
    return row;
  });
}

export async function getScholarshipContentForAdmin(scholarshipId: number, actor: WorkflowActor) {
  const row = await ensureScholarshipContent(scholarshipId, actor);
  const history = await db('ScholarshipContentVersions').select('VersionID', 'VersionNumber', 'SourceType',
    'SourceOriginalName', 'EditedBy', 'ChangeNote', 'CreatedAt').where({ ContentID: row.ContentID })
    .orderBy('VersionNumber', 'desc').limit(30);
  return { contentId: row.ContentID, scholarshipId, status: row.ReviewStatus,
    draftVersion: row.DraftVersion, publishedVersion: row.PublishedVersion,
    sourceType: row.SourceType, sourceOriginalName: row.SourceOriginalName,
    sourceAvailable: Boolean(row.SourceStorageKey), updatedAt: row.UpdatedAt, publishedAt: row.PublishedAt,
    draft: parseJson<ScholarshipContentInput>(row.DraftJSON),
    published: parseJson<ScholarshipContentInput>(row.PublishedJSON),
    history: history.map((item) => ({ versionId: Number(item.VersionID), versionNumber: Number(item.VersionNumber),
      sourceType: String(item.SourceType), sourceOriginalName: item.SourceOriginalName ?? undefined,
      editedBy: item.EditedBy ? Number(item.EditedBy) : undefined, changeNote: item.ChangeNote ?? undefined,
      createdAt: item.CreatedAt })) };
}

export async function generateScholarshipContent(scholarshipId: number, actor: WorkflowActor, file?: UploadedFile) {
  let stored: Awaited<ReturnType<typeof storeSource>> | undefined;
  try {
    const context = await contextFor(scholarshipId);
    let extracted: string | null = null;
    if (file) {
      stored = await storeSource(file, scholarshipId);
      extracted = await extractText(stored.destination, stored.mimeType);
    }
    const content = extracted ? buildContentFromText(context, extracted) : buildGeneratedScholarshipContent(context);
    await db.transaction(async (trx) => {
      const existing = await trx('ScholarshipContents').where({ ScholarshipID: scholarshipId }).first();
      const version = Number(existing?.DraftVersion ?? 0) + 1;
      const payload = { DraftJSON: json(content), ReviewStatus: 'Review', DraftVersion: version,
        SourceType: sourceType(stored?.mimeType), SourceStorageKey: stored?.storageKey ?? null,
        SourceOriginalName: stored?.originalName ?? null, SourceMimeType: stored?.mimeType ?? null,
        ExtractedText: extracted, ReviewedBy: null, ReviewedAt: null, UpdatedAt: new Date() };
      let row: Record<string, any>;
      if (existing) {
        await trx('ScholarshipContents').where({ ContentID: existing.ContentID }).update(payload);
        row = { ...existing, ...payload, DraftVersion: version };
      } else {
        const inserted = await trx('ScholarshipContents').insert({ ScholarshipID: scholarshipId, ...payload }).returning('*');
        row = inserted[0];
      }
      await saveVersion(trx, row, json(content), actor, file ? `Structured from ${stored!.originalName}` : 'Professional draft regenerated from scholarship data');
      await writeAudit(trx, { userId: actor.userId, action: 'SCHOLARSHIP_CONTENT_GENERATED', entityType: 'Scholarship',
        entityId: scholarshipId, newValue: { version, sourceType: payload.SourceType, sourceName: payload.SourceOriginalName },
        requestId: actor.requestId, ipAddress: actor.ipAddress });
    });
    return getScholarshipContentForAdmin(scholarshipId, actor);
  } catch (error) {
    await removeStoredFile(stored?.destination ?? file?.path ?? '').catch(() => undefined);
    throw error;
  }
}

export async function updateScholarshipContent(scholarshipId: number, content: ScholarshipContentInput,
  changeNote: string | undefined, actor: WorkflowActor) {
  const validated = scholarshipContentSchema.parse(content);
  await db.transaction(async (trx) => {
    const existing = await trx('ScholarshipContents').where({ ScholarshipID: scholarshipId }).first();
    if (!existing) throw new NotFoundError('Generate scholarship content before editing it.');
    const version = Number(existing.DraftVersion) + 1;
    const contentJson = json(validated);
    const row = { ...existing, DraftVersion: version, SourceType: 'Manual' };
    await trx('ScholarshipContents').where({ ContentID: existing.ContentID }).update({ DraftJSON: contentJson,
      DraftVersion: version, ReviewStatus: 'Review', SourceType: 'Manual', ReviewedBy: null, ReviewedAt: null,
      UpdatedAt: new Date() });
    await saveVersion(trx, row, contentJson, actor, changeNote ?? 'Admin edited structured content');
    await writeAudit(trx, { userId: actor.userId, action: 'SCHOLARSHIP_CONTENT_UPDATED', entityType: 'Scholarship',
      entityId: scholarshipId, newValue: { version, changeNote }, requestId: actor.requestId, ipAddress: actor.ipAddress });
  });
  return getScholarshipContentForAdmin(scholarshipId, actor);
}

export async function publishScholarshipContent(scholarshipId: number, actor: WorkflowActor) {
  await db.transaction(async (trx) => {
    const content = await trx('ScholarshipContents').where({ ScholarshipID: scholarshipId }).first();
    if (!content) throw new NotFoundError('Scholarship content has not been generated.');
    scholarshipContentSchema.parse(parseJson(content.DraftJSON));
    const scholarship = await trx('Scholarships').where({ ScholarshipID: scholarshipId }).first();
    if (!scholarship) throw new NotFoundError('Scholarship not found.');
    if (new Date(scholarship.ApplicationCloseDate) <= new Date()) throw new ValidationError('The application closing date must be in the future before publishing.');
    const rule = await trx('EligibilityRules').where({ ScholarshipID: scholarshipId }).first();
    if (!rule) throw new ConflictError('Add at least one eligibility rule before publishing.');
    const now = new Date();
    await trx('ScholarshipContents').where({ ContentID: content.ContentID }).update({
      PublishedJSON: content.DraftJSON, PublishedVersion: content.DraftVersion, ReviewStatus: 'Published',
      ReviewedBy: actor.userId, ReviewedAt: now, PublishedAt: now, UpdatedAt: now,
    });
    await trx('Scholarships').where({ ScholarshipID: scholarshipId }).update({ Status: 'Active', UpdatedAt: now });
    await writeAudit(trx, { userId: actor.userId, action: 'SCHOLARSHIP_CONTENT_PUBLISHED', entityType: 'Scholarship',
      entityId: scholarshipId, newValue: { version: content.DraftVersion, status: 'Active' },
      requestId: actor.requestId, ipAddress: actor.ipAddress });
  });
  return getScholarshipContentForAdmin(scholarshipId, actor);
}

export async function publishedScholarshipContent(scholarshipId: number) {
  const row = await db('ScholarshipContents').where({ ScholarshipID: scholarshipId, ReviewStatus: 'Published' }).first();
  return row ? parseJson<ScholarshipContentInput>(row.PublishedJSON) : null;
}

export async function scholarshipSourceDownload(scholarshipId: number) {
  const row = await db('ScholarshipContents').where({ ScholarshipID: scholarshipId }).first();
  if (!row?.SourceStorageKey) throw new NotFoundError('No source document is attached to this draft.');
  return { path: resolveStorageKey(row.SourceStorageKey), mimeType: row.SourceMimeType,
    originalName: row.SourceOriginalName ?? 'scholarship-source' };
}

export async function saveSponsorLogo(scholarshipId: number, actor: WorkflowActor, file: UploadedFile) {
  let destination = file.path;
  try {
    await validateFileSignature(file.path, file.mimetype); await scanDocument(file.path);
    const context = await contextFor(scholarshipId);
    const extension = file.mimetype === 'image/png' ? '.png' : '.jpg';
    const storageKey = path.join('sponsors', String(context.SponsorID), 'logo', `${crypto.randomUUID()}${extension}`);
    destination = path.resolve(config.privateUploadRoot, storageKey);
    if (!destination.startsWith(`${config.privateUploadRoot}${path.sep}`)) throw new ValidationError('Invalid storage path.');
    await fs.promises.mkdir(path.dirname(destination), { recursive: true });
    await fs.promises.rename(file.path, destination);
    await db.transaction(async (trx) => {
      await trx('Sponsors').where({ SponsorID: context.SponsorID }).update({ LogoStorageKey: storageKey,
        LogoOriginalName: cleanName(file.originalname), LogoMimeType: file.mimetype, LogoUpdatedAt: new Date(), UpdatedAt: new Date() });
      await writeAudit(trx, { userId: actor.userId, action: 'SPONSOR_LOGO_UPDATED', entityType: 'Sponsor',
        entityId: context.SponsorID, newValue: { scholarshipId, mimeType: file.mimetype },
        requestId: actor.requestId, ipAddress: actor.ipAddress });
    });
    return { scholarshipId, sponsorId: context.SponsorID, logoUrl: `/api/v1/scholarships/${scholarshipId}/logo` };
  } catch (error) {
    await removeStoredFile(destination).catch(() => undefined);
    throw error;
  }
}

export async function scholarshipLogoDownload(scholarshipId: number) {
  const sponsor = await db('Scholarships as sc').join('Sponsors as sp', 'sp.SponsorID', 'sc.SponsorID')
    .select('sp.LogoStorageKey', 'sp.LogoMimeType', 'sp.LogoOriginalName').where('sc.ScholarshipID', scholarshipId).first();
  if (!sponsor?.LogoStorageKey) throw new NotFoundError('Sponsor logo is not available.');
  return { path: resolveStorageKey(sponsor.LogoStorageKey), mimeType: sponsor.LogoMimeType,
    originalName: sponsor.LogoOriginalName ?? 'sponsor-logo' };
}
