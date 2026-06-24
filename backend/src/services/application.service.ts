import db from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';

// ─── Create Application (Draft) ─────────────────────────────────────────────

export async function createApplication(studentId: number, scholarshipId: number) {
  // Verify scholarship exists and is active
  const scholarship = await db('Scholarships')
    .where({ ScholarshipID: scholarshipId, Status: 'Active' })
    .first();

  if (!scholarship) {
    throw new NotFoundError('Scholarship not found or is not active.');
  }

  // Check for duplicate application
  const existing = await db('Applications')
    .where({ StudentID: studentId, ScholarshipID: scholarshipId })
    .whereNot({ Status: 'Cancelled' })
    .first();

  if (existing) {
    throw new ValidationError('You already have an application for this scholarship.');
  }

  const [inserted] = await db('Applications')
    .insert({
      StudentID: studentId,
      ScholarshipID: scholarshipId,
      Status: 'Draft',
      ScholarshipAmount: scholarship.PerStudentAmount,
      SponsorID: scholarship.SponsorID,
    })
    .returning('*');

  return inserted;
}

// ─── Submit Application ─────────────────────────────────────────────────────

export async function submitApplication(applicationId: number, studentId: number) {
  const application = await db('Applications')
    .where({ ApplicationID: applicationId, StudentID: studentId })
    .first();

  if (!application) {
    throw new NotFoundError('Application not found.');
  }

  if (application.Status !== 'Draft') {
    throw new ValidationError(`Cannot submit application with status "${application.Status}".`);
  }

  await db('Applications')
    .where({ ApplicationID: applicationId })
    .update({
      Status: 'Submitted',
      SubmissionDate: db.fn.now(),
    });

  return getApplicationById(applicationId);
}

// ─── Get Application By ID ──────────────────────────────────────────────────

export async function getApplicationById(id: number) {
  const application = await db('Applications as a')
    .join('Students as st', 'st.StudentID', 'a.StudentID')
    .join('Users as u', 'u.UserID', 'st.UserID')
    .join('Scholarships as sc', 'sc.ScholarshipID', 'a.ScholarshipID')
    .select(
      'a.*',
      'u.FullName as StudentName', 'u.Email as StudentEmail',
      'sc.Name as ScholarshipName', 'sc.PerStudentAmount'
    )
    .where('a.ApplicationID', id)
    .first();

  if (!application) {
    throw new NotFoundError('Application not found.');
  }

  const documentChecklist = await db('DocumentChecklist')
    .where({ ApplicationID: id })
    .orderBy('ChecklistID');

  return { ...application, documentChecklist };
}

// ─── Get Student's Applications ─────────────────────────────────────────────

export async function getStudentApplications(studentId: number) {
  return db('Applications as a')
    .join('Scholarships as sc', 'sc.ScholarshipID', 'a.ScholarshipID')
    .select('a.*', 'sc.Name as ScholarshipName')
    .where('a.StudentID', studentId)
    .orderBy('a.CreatedAt', 'desc');
}

// ─── Get All Applications (Admin) ───────────────────────────────────────────

interface ApplicationFilters {
  status?: string;
  scholarshipId?: number;
  page?: number;
  limit?: number;
}

export async function getAllApplications(filters: ApplicationFilters = {}) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  const query = db('Applications as a')
    .join('Students as st', 'st.StudentID', 'a.StudentID')
    .join('Users as u', 'u.UserID', 'st.UserID')
    .join('Scholarships as sc', 'sc.ScholarshipID', 'a.ScholarshipID')
    .select(
      'a.*',
      'u.FullName as StudentName',
      'sc.Name as ScholarshipName'
    );

  if (filters.status) {
    query.where('a.Status', filters.status);
  }
  if (filters.scholarshipId) {
    query.where('a.ScholarshipID', filters.scholarshipId);
  }

  const total = await query.clone().clearSelect().count('* as count').first();
  const applications = await query
    .orderBy('a.CreatedAt', 'desc')
    .limit(limit)
    .offset(offset);

  return {
    applications,
    pagination: {
      page,
      limit,
      total: Number((total as any)?.count ?? 0),
    },
  };
}
