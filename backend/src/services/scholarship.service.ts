import db from '../config/database';
import { NotFoundError } from '../utils/errors';
import {
  CreateScholarshipInput,
  UpdateScholarshipInput,
} from '../validators/scholarship.validator';

// ─── Create Scholarship ─────────────────────────────────────────────────────

export async function createScholarship(data: CreateScholarshipInput) {
  const [inserted] = await db('Scholarships')
    .insert({
      Name: data.name,
      Description: data.description || null,
      SponsorID: data.sponsorId,
      TotalBudget: data.totalBudget,
      PerStudentAmount: data.perStudentAmount,
      ApplicationOpenDate: data.applicationOpenDate,
      ApplicationCloseDate: data.applicationCloseDate,
      MaxApplicants: data.maxApplicants || null,
      Status: data.status,
    })
    .returning('*');

  return inserted;
}

// ─── Get All Scholarships ───────────────────────────────────────────────────

interface ScholarshipFilters {
  status?: string;
  page?: number;
  limit?: number;
}

export async function getAllScholarships(filters: ScholarshipFilters = {}) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  const query = db('Scholarships as s')
    .join('Sponsors as sp', 'sp.SponsorID', 's.SponsorID')
    .select(
      's.*',
      'sp.SponsorName'
    );

  if (filters.status) {
    query.where('s.Status', filters.status);
  }

  const total = await query.clone().clearSelect().count('* as count').first();
  const scholarships = await query
    .orderBy('s.CreatedAt', 'desc')
    .limit(limit)
    .offset(offset);

  return {
    scholarships,
    pagination: {
      page,
      limit,
      total: Number((total as any)?.count ?? 0),
    },
  };
}

// ─── Get Scholarship By ID ──────────────────────────────────────────────────

export async function getScholarshipById(id: number) {
  const scholarship = await db('Scholarships as s')
    .join('Sponsors as sp', 'sp.SponsorID', 's.SponsorID')
    .select('s.*', 'sp.SponsorName')
    .where('s.ScholarshipID', id)
    .first();

  if (!scholarship) {
    throw new NotFoundError('Scholarship not found.');
  }

  const rules = await db('EligibilityRules')
    .where({ ScholarshipID: id })
    .orderBy('RuleID');

  return { ...scholarship, eligibilityRules: rules };
}

// ─── Update Scholarship ─────────────────────────────────────────────────────

export async function updateScholarship(id: number, data: UpdateScholarshipInput) {
  const existing = await db('Scholarships').where({ ScholarshipID: id }).first();
  if (!existing) {
    throw new NotFoundError('Scholarship not found.');
  }

  const payload: Record<string, unknown> = {};
  if (data.name !== undefined) payload.Name = data.name;
  if (data.description !== undefined) payload.Description = data.description;
  if (data.sponsorId !== undefined) payload.SponsorID = data.sponsorId;
  if (data.totalBudget !== undefined) payload.TotalBudget = data.totalBudget;
  if (data.perStudentAmount !== undefined) payload.PerStudentAmount = data.perStudentAmount;
  if (data.applicationOpenDate !== undefined) payload.ApplicationOpenDate = data.applicationOpenDate;
  if (data.applicationCloseDate !== undefined) payload.ApplicationCloseDate = data.applicationCloseDate;
  if (data.maxApplicants !== undefined) payload.MaxApplicants = data.maxApplicants;
  if (data.status !== undefined) payload.Status = data.status;
  payload.UpdatedAt = db.fn.now();

  await db('Scholarships').where({ ScholarshipID: id }).update(payload);

  return getScholarshipById(id);
}
