import db from '../config/database';
import { AuthPayload } from '../types';
import { assertApplicationAccess } from './applicationAccess.service';

export async function getApplicationById(id: number, user: AuthPayload) {
  await assertApplicationAccess(id, user);
  const application = await db('Applications as a')
    .join('Students as st', 'st.StudentID', 'a.StudentID')
    .join('Users as u', 'u.UserID', 'st.UserID')
    .join('Scholarships as sc', 'sc.ScholarshipID', 'a.ScholarshipID')
    .join('Sponsors as sp', 'sp.SponsorID', 'sc.SponsorID')
    .select(
      'a.*', 'u.FullName as StudentName', 'u.Email as StudentEmail',
      'sc.Name as ScholarshipName', 'sc.PerStudentAmount', 'sp.SponsorName',
    )
    .where('a.ApplicationID', id)
    .first();

  const [documents, statusHistory] = await Promise.all([
    db('DocumentChecklist').where({ ApplicationID: id }).orderBy('ChecklistID'),
    db('ApplicationStatusHistory as h').leftJoin('Users as actor', 'actor.UserID', 'h.ActorUserID')
      .select('h.FromStatus', 'h.ToStatus', 'h.ActorUserID', 'h.ActorRole', 'h.Reason', 'h.CreatedAt',
        'actor.FullName as ActorName')
      .where('h.ApplicationID', id).orderBy('h.CreatedAt', 'asc'),
  ]);
  const documentChecklist = documents.map((doc) => ({
    ...doc,
    FileURL: `/api/v1/documents/checklist/${doc.ChecklistID}/download`,
  }));
  const parseJson = (value?: string | null) => {
    if (!value) return null;
    try { return JSON.parse(value); } catch { return null; }
  };
  const rawSnapshot = parseJson(application.SubmittedSnapshot);
  const deniedByRole: Record<string, RegExp> = {
    Admin: /hash|sha256|ciphertext|fileurl/i,
    Student: /hash|sha256|ciphertext|fileurl/i,
    DocReviewer: /hash|sha256|bank|account|ifsc|phone|email/i,
    BGCheckOfficer: /hash|sha256|bank|account|ifsc|email/i,
    ScreeningOfficer: /hash|sha256|bank|account|ifsc|aadhaar|aadhar|phone|email|address|pincode/i,
    Finance: /./,
    CSRPartner: /./,
  };
  const omit = deniedByRole[user.role] ?? /./;
  const sanitize = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(sanitize);
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !omit.test(key)).map(([key, nested]) => [key, sanitize(nested)]));
  };
  const submittedSnapshot = /./.source === omit.source ? null : sanitize(rawSnapshot);
  return { ...application, SubmittedSnapshot: submittedSnapshot,
    EligibilitySnapshot: parseJson(application.EligibilitySnapshot), documentChecklist, statusHistory };
}

export async function getStudentApplications(studentId: number) {
  return db('Applications as a')
    .join('Scholarships as sc', 'sc.ScholarshipID', 'a.ScholarshipID')
    .select('a.*', 'sc.Name as ScholarshipName')
    .where('a.StudentID', studentId)
    .orderBy('a.CreatedAt', 'desc')
    .limit(100);
}

interface ApplicationFilters {
  status?: string;
  scholarshipId?: number;
  page?: number;
  limit?: number;
}

export async function getAllApplications(filters: ApplicationFilters = {}) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 25;
  const query = db('Applications as a')
    .join('Students as st', 'st.StudentID', 'a.StudentID')
    .join('Users as u', 'u.UserID', 'st.UserID')
    .join('Scholarships as sc', 'sc.ScholarshipID', 'a.ScholarshipID')
    .select('a.*', 'u.FullName as StudentName', 'sc.Name as ScholarshipName');
  if (filters.status) query.where('a.Status', filters.status);
  if (filters.scholarshipId) query.where('a.ScholarshipID', filters.scholarshipId);

  const total = await query.clone().clearSelect().count('* as count').first();
  const applications = await query
    .orderBy([{ column: 'a.CreatedAt', order: 'desc' }, { column: 'a.ApplicationID', order: 'desc' }])
    .limit(limit)
    .offset((page - 1) * limit);
  return { applications, pagination: { page, limit, total: Number(total?.count ?? 0) } };
}
