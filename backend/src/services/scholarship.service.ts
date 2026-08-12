import db from '../config/database';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors';
import { CreateScholarshipInput, UpdateScholarshipInput } from '../validators/scholarship.validator';
import { writeAudit } from './audit.service';
import { WorkflowActor } from './workflow.service';

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
    const values = { Name: data.name, Description: data.description || null, SponsorID: data.sponsorId,
      TotalBudget: data.totalBudget, PerStudentAmount: data.perStudentAmount,
      ApplicationOpenDate: data.applicationOpenDate, ApplicationCloseDate: data.applicationCloseDate,
      MaxApplicants: data.maxApplicants || null, Status: data.status };
    const inserted = await trx('Scholarships').insert(values).returning('*');
    const scholarship = inserted[0];
    if (data.rules?.length) {
      await trx('EligibilityRules').insert(data.rules.map((rule) => ({
        ScholarshipID: scholarship.ScholarshipID, RuleType: rule.ruleType, Operator: rule.operator,
        ValueMin: rule.valueMin ?? null, ValueMax: rule.valueMax ?? null,
        ValueList: rule.valueList ?? null, IsRequired: rule.isRequired, RuleVersion: 1,
      })));
    }
    await writeAudit(trx, { userId: actor.userId, action: 'SCHOLARSHIP_CREATED', entityType: 'Scholarship',
      entityId: scholarship.ScholarshipID, newValue: values, requestId: actor.requestId, ipAddress: actor.ipAddress });
    return scholarship;
  });
}

export async function getAllScholarships(filters: ScholarshipFilters = {}) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const query = db('Scholarships as s').join('Sponsors as sp', 'sp.SponsorID', 's.SponsorID')
    .select('s.*', 'sp.SponsorName', db.raw(
      '(SELECT COUNT(1) FROM Applications a WHERE a.ScholarshipID = s.ScholarshipID AND a.Status <> ?) as ApplicantCount',
      ['Cancelled'],
    ));
  if (filters.status) query.where('s.Status', filters.status);
  const [total, scholarships] = await Promise.all([
    query.clone().clearSelect().count('* as count').first(),
    query.orderBy([{ column: 's.ApplicationCloseDate', order: 'asc' }, { column: 's.ScholarshipID', order: 'asc' }])
      .limit(limit).offset((page - 1) * limit),
  ]);
  return { scholarships, pagination: { page, limit, total: Number(total?.count ?? 0) } };
}

export async function getScholarshipById(id: number) {
  const scholarship = await db('Scholarships as s').join('Sponsors as sp', 'sp.SponsorID', 's.SponsorID')
    .select('s.*', 'sp.SponsorName').where('s.ScholarshipID', id).first();
  if (!scholarship) throw new NotFoundError('Scholarship not found.');
  const rules = await db('EligibilityRules').where({ ScholarshipID: id }).orderBy('RuleID');
  return { ...scholarship, eligibilityRules: rules };
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
    const map: Record<string, string> = { name: 'Name', description: 'Description', sponsorId: 'SponsorID',
      totalBudget: 'TotalBudget', perStudentAmount: 'PerStudentAmount', applicationOpenDate: 'ApplicationOpenDate',
      applicationCloseDate: 'ApplicationCloseDate', maxApplicants: 'MaxApplicants', status: 'Status' };
    const payload: Record<string, unknown> = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [map[key], value]),
    );
    validateScholarshipValues({ ...existing, ...payload });
    payload.UpdatedAt = new Date();
    await trx('Scholarships').where({ ScholarshipID: id }).update(payload);
    await writeAudit(trx, { userId: actor.userId, action: 'SCHOLARSHIP_UPDATED', entityType: 'Scholarship',
      entityId: id, oldValue: existing, newValue: payload, requestId: actor.requestId, ipAddress: actor.ipAddress });
    return getScholarshipById(id);
  });
}
