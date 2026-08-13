import db from '../config/database';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors';
import { CreateScholarshipInput, UpdateScholarshipInput } from '../validators/scholarship.validator';
import { writeAudit } from './audit.service';
import { WorkflowActor } from './workflow.service';
import { buildGeneratedScholarshipContent } from './scholarshipContent.service';

interface ScholarshipFilters { status?: string; page?: number; limit?: number; }

async function assertSponsor(sponsorId: number) {
  const sponsor = await db('Sponsors').where({ SponsorID: sponsorId, Status: 'Active' }).first();
  if (!sponsor) throw new ValidationError('An active sponsor is required.');
}

function validateScholarshipValues(values: Record<string, any>) {
  if (new Date(values.ApplicationCloseDate) <= new Date(values.ApplicationOpenDate)) {
    throw new ValidationError('Application close date must be after open date.');
  }
  if (Number(values.PerStudentAmount) > Number(values.TotalBudget)) {
    throw new ValidationError('Per-student amount cannot exceed the total budget.');
  }
}

export async function createScholarship(data: CreateScholarshipInput, actor: WorkflowActor) {
  await assertSponsor(data.sponsorId);
  return db.transaction(async (trx) => {
    const sponsor = await trx('Sponsors').where({ SponsorID: data.sponsorId }).first();
    const requestedReview = data.status === 'Active';
    const values = { Name: data.name, Description: data.description || null, SponsorID: data.sponsorId,
      TotalBudget: data.totalBudget, PerStudentAmount: data.perStudentAmount,
      ApplicationOpenDate: data.applicationOpenDate, ApplicationCloseDate: data.applicationCloseDate,
      MaxApplicants: data.maxApplicants || null, Status: 'Inactive' };
    const inserted = await trx('Scholarships').insert(values).returning('*');
    const scholarship = inserted[0];
    if (data.rules?.length) {
      await trx('EligibilityRules').insert(data.rules.map((rule) => ({
        ScholarshipID: scholarship.ScholarshipID, RuleType: rule.ruleType, Operator: rule.operator,
        ValueMin: rule.valueMin ?? null, ValueMax: rule.valueMax ?? null,
        ValueList: rule.valueList ?? null, IsRequired: rule.isRequired, RuleVersion: 1,
      })));
    }
    const rules = (data.rules ?? []).map((rule) => ({ RuleType: rule.ruleType, Operator: rule.operator,
      ValueMin: rule.valueMin ?? null, ValueMax: rule.valueMax ?? null, ValueList: rule.valueList ?? null,
      IsRequired: rule.isRequired }));
    const generated = buildGeneratedScholarshipContent({ ...values, ScholarshipID: scholarship.ScholarshipID,
      SponsorName: sponsor.SponsorName, SponsorEmail: sponsor.Email, SponsorPhone: sponsor.Phone, rules });
    const insertedContent = await trx('ScholarshipContents').insert({ ScholarshipID: scholarship.ScholarshipID,
      DraftJSON: JSON.stringify(generated), ReviewStatus: requestedReview ? 'Review' : 'Draft',
      DraftVersion: 1, SourceType: 'Generated' }).returning('*');
    await trx('ScholarshipContentVersions').insert({ ContentID: insertedContent[0].ContentID, VersionNumber: 1,
      ContentJSON: JSON.stringify(generated), SourceType: 'Generated', EditedBy: actor.userId,
      ChangeNote: 'Initial professional draft generated from scholarship data' });
    await writeAudit(trx, { userId: actor.userId, action: 'SCHOLARSHIP_CREATED', entityType: 'Scholarship',
      entityId: scholarship.ScholarshipID, newValue: values, requestId: actor.requestId, ipAddress: actor.ipAddress });
    return { ...scholarship, Status: 'Inactive', ContentStatus: requestedReview ? 'Review' : 'Draft' };
  });
}

export async function getAllScholarships(filters: ScholarshipFilters = {}) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const query = db('Scholarships as s').join('Sponsors as sp', 'sp.SponsorID', 's.SponsorID')
    .leftJoin('ScholarshipContents as content', 'content.ScholarshipID', 's.ScholarshipID')
    .select('s.*', 'sp.SponsorName', 'content.ReviewStatus as ContentStatus',
      db.raw('CASE WHEN sp.LogoStorageKey IS NULL THEN 0 ELSE 1 END as HasSponsorLogo'), db.raw(
      '(SELECT COUNT(1) FROM Applications a WHERE a.ScholarshipID = s.ScholarshipID AND a.Status <> ?) as ApplicantCount',
      ['Cancelled'],
    ));
  if (filters.status) query.where('s.Status', filters.status);
  const [total, scholarships] = await Promise.all([
    query.clone().clearSelect().count('* as count').first(),
    query.orderBy([{ column: 's.ApplicationCloseDate', order: 'asc' }, { column: 's.ScholarshipID', order: 'asc' }])
      .limit(limit).offset((page - 1) * limit),
  ]);
  return { scholarships: scholarships.map((row) => ({ ...row,
    SponsorLogoURL: row.HasSponsorLogo ? `/api/v1/scholarships/${row.ScholarshipID}/logo` : null })),
    pagination: { page, limit, total: Number(total?.count ?? 0) } };
}

export async function getScholarshipById(id: number) {
  const scholarship = await db('Scholarships as s').join('Sponsors as sp', 'sp.SponsorID', 's.SponsorID')
    .leftJoin('ScholarshipContents as content', 'content.ScholarshipID', 's.ScholarshipID')
    .select('s.*', 'sp.SponsorName', 'content.ReviewStatus as ContentStatus', 'content.PublishedJSON',
      db.raw('CASE WHEN sp.LogoStorageKey IS NULL THEN 0 ELSE 1 END as HasSponsorLogo'))
    .where('s.ScholarshipID', id).first();
  if (!scholarship) throw new NotFoundError('Scholarship not found.');
  const rules = await db('EligibilityRules').where({ ScholarshipID: id }).orderBy('RuleID');
  let publishedContent = null;
  try { publishedContent = scholarship.PublishedJSON ? JSON.parse(scholarship.PublishedJSON) : null; } catch { /* invalid legacy JSON */ }
  const { PublishedJSON: _publishedJson, ...safe } = scholarship;
  return { ...safe, SponsorLogoURL: scholarship.HasSponsorLogo ? `/api/v1/scholarships/${id}/logo` : null,
    publishedContent, eligibilityRules: rules };
}

export async function updateScholarship(id: number, data: UpdateScholarshipInput, actor: WorkflowActor) {
  return db.transaction(async (trx) => {
    const existing = await trx('Scholarships').where({ ScholarshipID: id }).first();
    if (!existing) throw new NotFoundError('Scholarship not found.');
    const hasApplications = await trx('Applications').where({ ScholarshipID: id }).whereNot('Status', 'Draft').first();
    if (hasApplications && ['sponsorId', 'perStudentAmount', 'totalBudget'].some((field) => field in data)) {
      throw new ConflictError('Financial scholarship fields cannot change after applications are submitted.');
    }
    if (data.sponsorId !== undefined) await assertSponsor(data.sponsorId);
    if (data.status === 'Active') {
      const content = await trx('ScholarshipContents').where({ ScholarshipID: id }).first();
      if (content && content.ReviewStatus !== 'Published') {
        throw new ConflictError('Review and publish the scholarship content before activating the program.');
      }
    }
    const map: Record<string, string> = { name: 'Name', description: 'Description', sponsorId: 'SponsorID',
      totalBudget: 'TotalBudget', perStudentAmount: 'PerStudentAmount', applicationOpenDate: 'ApplicationOpenDate',
      applicationCloseDate: 'ApplicationCloseDate', maxApplicants: 'MaxApplicants', status: 'Status' };
    const payload: Record<string, unknown> = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [map[key], value]),
    );
    validateScholarshipValues({ ...existing, ...payload });
    payload.UpdatedAt = new Date();
    await trx('Scholarships').where({ ScholarshipID: id }).update(payload);
    if (await trx('ScholarshipContents').where({ ScholarshipID: id }).first()) {
      const contentRelevant = ['name', 'description', 'sponsorId', 'perStudentAmount', 'applicationOpenDate',
        'applicationCloseDate', 'maxApplicants'].some((field) => field in data);
      if (contentRelevant) await trx('ScholarshipContents').where({ ScholarshipID: id })
        .update({ ReviewStatus: 'Review', UpdatedAt: new Date() });
    }
    await writeAudit(trx, { userId: actor.userId, action: 'SCHOLARSHIP_UPDATED', entityType: 'Scholarship',
      entityId: id, oldValue: existing, newValue: payload, requestId: actor.requestId, ipAddress: actor.ipAddress });
    return getScholarshipById(id);
  });
}
