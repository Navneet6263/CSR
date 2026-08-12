import db from '../config/database';
import { AuthPayload } from '../types';
import { decryptPii, maskValue } from '../utils/piiCrypto';
import { assertApplicationAccess } from './applicationAccess.service';

export async function getPendingReviewApplications(reviewerId: number, limit = 50) {
  return db('Applications as a')
    .join('Students as s', 's.StudentID', 'a.StudentID')
    .join('Users as u', 'u.UserID', 's.UserID')
    .join('Scholarships as sc', 'sc.ScholarshipID', 'a.ScholarshipID')
    .select(
      'a.ApplicationID', 'a.Status', 'a.SubmissionDate', 'a.StageEnteredAt', 'a.IsHeldByAdmin',
      'a.AdminHoldReason', 'a.AssignedDocReviewer', 'u.FullName as StudentName',
      'u.Email as StudentEmail', 'sc.Name as ScholarshipName',
      db.raw(`(SELECT TOP 1 h.Reason FROM ApplicationStatusHistory h
        WHERE h.ApplicationID = a.ApplicationID AND h.ActorRole = 'ScreeningOfficer'
        AND h.ToStatus = 'DocAuditInProgress' ORDER BY h.CreatedAt DESC) AS ReturnReason`),
      db.raw(`(SELECT TOP 1 h.CreatedAt FROM ApplicationStatusHistory h
        WHERE h.ApplicationID = a.ApplicationID AND h.ActorRole = 'ScreeningOfficer'
        AND h.ToStatus = 'DocAuditInProgress' ORDER BY h.CreatedAt DESC) AS ReturnedAt`),
    )
    .whereIn('a.Status', ['Submitted', 'AutoMatched', 'DocAuditInProgress'])
    .where((query) => query.whereNull('a.AssignedDocReviewer').orWhere('a.AssignedDocReviewer', reviewerId))
    .orderBy([{ column: 'a.SubmissionDate', order: 'asc' }, { column: 'a.ApplicationID', order: 'asc' }])
    .limit(limit);
}

export async function getStudentReUploads(studentId: number) {
  return db('DocumentChecklist as dc')
    .join('Applications as a', 'a.ApplicationID', 'dc.ApplicationID')
    .select('dc.*', 'a.ScholarshipID')
    .where('a.StudentID', studentId)
    .where('dc.Status', 'ReUploadRequested')
    .orderBy('dc.ReviewedAt', 'desc')
    .limit(50);
}

export async function getApplicationDocs(applicationId: number) {
  const rows = await db('DocumentChecklist')
    .where({ ApplicationID: applicationId })
    .orderBy('CreatedAt', 'asc');
  return rows.map((row) => ({
    ...row,
    FileURL: `/api/v1/documents/checklist/${row.ChecklistID}/download`,
  }));
}

export async function getApplicationDocumentDetails(applicationId: number, user: AuthPayload) {
  await assertApplicationAccess(applicationId, user);
  const student = await db('Applications as a')
    .join('Students as s', 's.StudentID', 'a.StudentID')
    .join('Users as u', 'u.UserID', 's.UserID')
    .join('Scholarships as sc', 'sc.ScholarshipID', 'a.ScholarshipID')
    .select(
      'u.FullName as name', 'u.Email as email', 'u.Phone as phone',
      'a.ApplicationID as applicationId', 'a.Status as applicationStatus',
      'sc.Name as scholarship', 's.AadharNumber', 's.AadharCiphertext',
      's.AnnualFamilyIncome as income', 's.Category as category', 's.State as state',
      's.Course as course', 's.PreviousYearMarks as previousYearMarks',
    )
    .where('a.ApplicationID', applicationId).first();
  const aadhaar = student.AadharNumber ?? decryptPii(student.AadharCiphertext);
  delete student.AadharNumber;
  delete student.AadharCiphertext;
  const instruction = await db('ApplicationStatusHistory')
    .select('Reason as notes', 'CreatedAt as returnedAt', 'ActorRole as returnedBy')
    .where({ ApplicationID: applicationId, ActorRole: 'ScreeningOfficer', ToStatus: 'DocAuditInProgress' })
    .orderBy('CreatedAt', 'desc').first();
  return { student: { ...student, aadhar: maskValue(aadhaar) },
    docs: await getApplicationDocs(applicationId), returnInstruction: instruction ?? null };
}

export async function getReviewerLogs(reviewerId: number) {
  return db('DocumentChecklist as dc')
    .join('Applications as a', 'a.ApplicationID', 'dc.ApplicationID')
    .join('Students as s', 's.StudentID', 'a.StudentID')
    .join('Users as u', 'u.UserID', 's.UserID')
    .select(
      'dc.ChecklistID as id', 'dc.Status as action', 'dc.DocumentType as docType',
      'u.FullName as studentName', 'a.ApplicationID as appId',
      'dc.RejectionReason as reason', 'dc.ReviewedAt as timestamp',
    )
    .where('dc.ReviewedBy', reviewerId)
    .orderBy('dc.ReviewedAt', 'desc')
    .limit(100);
}

export async function getReviewerStats(reviewerId: number) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const [pending, approved, rejected, overdue] = await Promise.all([
    db('Applications').whereIn('Status', ['Submitted', 'AutoMatched', 'DocAuditInProgress'])
      .where((query) => query.whereNull('AssignedDocReviewer').orWhere('AssignedDocReviewer', reviewerId))
      .count('* as count').first(),
    db('DocumentChecklist').where({ ReviewedBy: reviewerId, Status: 'Verified' })
      .where('ReviewedAt', '>=', startOfDay).count('* as count').first(),
    db('DocumentChecklist').where({ ReviewedBy: reviewerId, Status: 'ReUploadRequested' })
      .where('ReviewedAt', '>=', startOfDay).count('* as count').first(),
    db('Applications').whereIn('Status', ['Submitted', 'AutoMatched', 'DocAuditInProgress'])
      .where((query) => query.whereNull('AssignedDocReviewer').orWhere('AssignedDocReviewer', reviewerId))
      .whereRaw('COALESCE(StageEnteredAt, SubmissionDate, CreatedAt) < DATEADD(hour, -48, SYSUTCDATETIME())')
      .count('* as count').first(),
  ]);
  return {
    pendingReview: Number(pending?.count ?? 0),
    approvedToday: Number(approved?.count ?? 0),
    rejectedToday: Number(rejected?.count ?? 0),
    overdue: Number(overdue?.count ?? 0),
  };
}
