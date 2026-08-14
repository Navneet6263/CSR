import db from '../config/database';
import { AuthPayload } from '../types';
import { assertApplicationAccess } from './applicationAccess.service';
import { decryptPii, maskValue } from '../utils/piiCrypto';
import { numericSearchId, prefixSearchPattern } from '../utils/searchPattern';

function actionableApplications(officerId: number) {
  return db('Applications as a')
    .whereIn('a.Status', ['DocAuditComplete', 'BGCheckInProgress'])
    .where((query) => query.whereNull('a.AssignedBGOfficer').orWhere('a.AssignedBGOfficer', officerId))
    .whereRaw(`NOT EXISTS (SELECT 1 FROM BackgroundChecks failed
      WHERE failed.ApplicationID = a.ApplicationID AND failed.Result = 'Fail')`)
    .whereRaw(`(SELECT COUNT(DISTINCT passed.CheckType) FROM BackgroundChecks passed
      WHERE passed.ApplicationID = a.ApplicationID AND passed.Result = 'Pass'
      AND passed.CheckType IN ('Identity', 'Address', 'IncomeVerification')) < 3`);
}

export async function getPendingBGChecks(officerId: number, page = 1, limit = 20, search = '') {
  const query = actionableApplications(officerId)
    .join('Students as s', 's.StudentID', 'a.StudentID')
    .join('Users as u', 'u.UserID', 's.UserID')
    .join('Scholarships as sc', 'sc.ScholarshipID', 'a.ScholarshipID');
  if (search.trim()) {
    const needle = prefixSearchPattern(search);
    const searchId = numericSearchId(search);
    query.where((builder) => { builder.where('u.FullName', 'like', needle).orWhere('sc.Name', 'like', needle)
      .orWhere('s.City', 'like', needle).orWhere('s.State', 'like', needle);
      if (searchId) builder.orWhere('a.ApplicationID', searchId); });
  }
  const totalRow = await query.clone().clearSelect().clearOrder().countDistinct('a.ApplicationID as count').first();
  const applications = await query
    .select(
      'a.ApplicationID', 'a.Status as ApplicationStatus', 'a.ScholarshipID',
      'a.IsHeldByAdmin', 'a.AdminHoldReason', 'a.AssignedBGOfficer',
      'a.SubmissionDate', 'a.StageEnteredAt', 'u.FullName as StudentName',
      'u.Email as StudentEmail', 'sc.Name as ScholarshipName', 's.City', 's.State',
      db.raw(`(SELECT TOP 1 h.Reason FROM ApplicationStatusHistory h
        WHERE h.ApplicationID = a.ApplicationID AND h.ActorRole = 'ScreeningOfficer'
        AND h.ToStatus = 'BGCheckInProgress' ORDER BY h.CreatedAt DESC) AS ReturnReason`),
      db.raw(`(SELECT TOP 1 h.CreatedAt FROM ApplicationStatusHistory h
        WHERE h.ApplicationID = a.ApplicationID AND h.ActorRole = 'ScreeningOfficer'
        AND h.ToStatus = 'BGCheckInProgress' ORDER BY h.CreatedAt DESC) AS ReturnedAt`),
      db.raw(`(SELECT COUNT(DISTINCT completed.CheckType) FROM BackgroundChecks completed
        WHERE completed.ApplicationID = a.ApplicationID AND completed.Result = 'Pass') AS CompletedChecks`),
      db.raw(`(SELECT COUNT(*) FROM BackgroundChecks inconclusive
        WHERE inconclusive.ApplicationID = a.ApplicationID AND inconclusive.Result = 'Inconclusive') AS InconclusiveChecks`),
    )
    .orderBy([{ column: 'a.StageEnteredAt', order: 'asc' }, { column: 'a.ApplicationID', order: 'asc' }])
    .offset((page - 1) * limit).limit(limit);
  return { applications, pagination: { page, limit, total: Number(totalRow?.count ?? 0) } };
}

export async function getBGCheckDetails(applicationId: number, user: AuthPayload) {
  await assertApplicationAccess(applicationId, user);
  const student = await db('Applications as a')
    .join('Students as s', 's.StudentID', 'a.StudentID')
    .join('Users as u', 'u.UserID', 's.UserID')
    .join('Scholarships as sc', 'sc.ScholarshipID', 'a.ScholarshipID')
    .select(
      'u.FullName as name', 'u.Email as email', 'u.Phone as phone',
      'a.ApplicationID as applicationId', 'a.Status as applicationStatus',
      'a.SubmissionDate as submissionDate', 'a.StageEnteredAt as stageEnteredAt',
      'a.IsHeldByAdmin as isHeld', 'a.AdminHoldReason as holdReason',
      'a.SubmittedSnapshot as submittedSnapshot', 'sc.Name as scholarship',
      's.AadharNumber', 's.AadharCiphertext', 's.AnnualFamilyIncome as income',
      's.Address as address', 's.City as city', 's.State as state', 's.Pincode as pincode',
      's.PermanentAddress as permanentAddress', 's.PermanentCity as permanentCity',
      's.PermanentState as permanentState', 's.PermanentPincode as permanentPincode',
      's.DOB as dob', 's.Gender as gender', 's.Category as category', 's.Course as course',
      's.AdmissionRegistrationNo as registrationNo', 's.FatherName as fatherName',
      's.MotherName as motherName', 's.FatherOccupation as fatherOccupation',
      's.MotherOccupation as motherOccupation', 'i.Name as institution',
    )
    .leftJoin('Institutions as i', 'i.InstitutionID', 's.InstitutionID')
    .where('a.ApplicationID', applicationId).first();
  const aadhaar = student.AadharNumber ?? decryptPii(student.AadharCiphertext);
  delete student.AadharNumber;
  delete student.AadharCiphertext;
  student.aadhar = maskValue(aadhaar);
  if (student.submittedSnapshot) {
    try { student.submittedSnapshot = JSON.parse(student.submittedSnapshot); } catch { student.submittedSnapshot = null; }
  }
  const [docs, checks, returnInstruction] = await Promise.all([
    db('DocumentChecklist').select('ChecklistID as id', 'DocumentType as type', 'Status as status',
      'RejectionReason as rejectionReason', 'ReviewedAt as reviewedAt')
      .where({ ApplicationID: applicationId }),
    db('BackgroundChecks').select(
      'CheckType as type', 'Result as result', 'Notes as notes',
      'EvidenceURL as evidenceUrl', 'CompletedAt as completedAt',
    ).where({ ApplicationID: applicationId }),
    db('ApplicationStatusHistory').select('Reason as notes', 'CreatedAt as returnedAt', 'ActorRole as returnedBy')
      .where({ ApplicationID: applicationId, ActorRole: 'ScreeningOfficer', ToStatus: 'BGCheckInProgress' })
      .orderBy('CreatedAt', 'desc').first(),
  ]);
  return {
    student,
    docs: docs.map((doc) => ({ ...doc, url: `/api/v1/documents/checklist/${doc.id}/download` })),
    checks, returnInstruction: returnInstruction ?? null,
  };
}

export async function getBGOfficerLogs(officerId: number, page = 1, limit = 20, search = '', status = '') {
  const query = db('BackgroundChecks as b')
    .join('Applications as a', 'a.ApplicationID', 'b.ApplicationID')
    .join('Students as s', 's.StudentID', 'a.StudentID')
    .join('Users as u', 'u.UserID', 's.UserID')
    .join('Scholarships as sc', 'sc.ScholarshipID', 'a.ScholarshipID');
  query.where('b.OfficerID', officerId);
  if (status && status !== 'All') query.where('b.Result', status);
  if (search.trim()) {
    const needle = prefixSearchPattern(search);
    const searchId = numericSearchId(search);
    query.where((builder) => { builder.where('u.FullName', 'like', needle).orWhere('sc.Name', 'like', needle)
      .orWhere('b.CheckType', 'like', needle); if (searchId) builder.orWhere('b.ApplicationID', searchId); });
  }
  const totalRow = await query.clone().clearSelect().clearOrder().countDistinct('b.CheckID as count').first();
  const logs = await query
    .select('b.CheckID as logId', 'b.ApplicationID as appId', 'u.FullName as studentName',
      'sc.Name as scholarshipName', 'b.CheckType as actionType', 'b.Result as status',
      'b.Notes as notes', 'b.EvidenceURL as evidenceUrl', 'b.CompletedAt as timestamp')
    .orderBy('b.CompletedAt', 'desc').offset((page - 1) * limit).limit(limit);
  return { logs, pagination: { page, limit, total: Number(totalRow?.count ?? 0) } };
}

export async function getBGOfficerStats(officerId: number) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const [pending, assigned, available, completed, today, overdue] = await Promise.all([
    actionableApplications(officerId).count('* as count').first(),
    actionableApplications(officerId).where('a.AssignedBGOfficer', officerId).count('* as count').first(),
    actionableApplications(officerId).whereNull('a.AssignedBGOfficer').count('* as count').first(),
    db('BackgroundChecks').where({ OfficerID: officerId }).countDistinct('ApplicationID as count').first(),
    db('BackgroundChecks').where({ OfficerID: officerId }).where('CompletedAt', '>=', startOfDay)
      .countDistinct('ApplicationID as count').first(),
    actionableApplications(officerId)
      .whereRaw(`COALESCE(a.StageEnteredAt, a.UpdatedAt, a.CreatedAt) < DATEADD(hour, -48, SYSUTCDATETIME())`)
      .count('* as count').first(),
  ]);
  return { pending: Number(pending?.count ?? 0), assigned: Number(assigned?.count ?? 0),
    available: Number(available?.count ?? 0), completed: Number(completed?.count ?? 0),
    today: Number(today?.count ?? 0), overdue: Number(overdue?.count ?? 0) };
}
