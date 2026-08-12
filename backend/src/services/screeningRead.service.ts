import db from '../config/database';
import { AuthPayload } from '../types';
import { assertApplicationAccess } from './applicationAccess.service';

function parseSnapshot(value?: string | null) {
  if (!value) return null;
  try { return JSON.parse(value); } catch { return null; }
}

function screeningSnapshot(value?: string | null) {
  const parsed = parseSnapshot(value) as Record<string, any> | null;
  const profile = parsed?.profile ?? parsed;
  if (!profile || typeof profile !== 'object') return null;
  const allowed = ['fullName', 'dob', 'gender', 'category', 'city', 'state', 'annualFamilyIncome',
    'familySize', 'course', 'institutionId', 'enrollmentYear'];
  return Object.fromEntries(allowed.filter((key) => profile[key] !== undefined).map((key) => [key, profile[key]]));
}

export async function getConsolidatedApplication(applicationId: number, user: AuthPayload) {
  await assertApplicationAccess(applicationId, user);
  const application = await db('Applications as a')
    .join('Students as s', 'a.StudentID', 's.StudentID')
    .join('Users as u', 's.UserID', 'u.UserID')
    .join('Scholarships as sc', 'a.ScholarshipID', 'sc.ScholarshipID')
    .leftJoin('Sponsors as sp', 'a.SponsorID', 'sp.SponsorID')
    .leftJoin('Institutions as i', 's.InstitutionID', 'i.InstitutionID')
    .select(
      'a.ApplicationID', 'a.ScholarshipID', 'a.Status', 'a.SubmissionDate', 'a.StageEnteredAt',
      'a.ScholarshipAmount', 'a.AssignedScreener',
      'a.SubmittedSnapshot', 'a.EligibilitySnapshot', 'a.IsHeldByAdmin', 'a.AdminHoldReason',
      'sc.Name as ScholarshipName', 'sc.Description as ScholarshipDescription',
      'sc.PerStudentAmount', 'sp.SponsorName', 'i.Name as InstitutionName',
      'u.FullName', 's.DOB', 's.Gender', 's.Category', 's.City', 's.State',
      's.Course', 's.CurrentSemesterOrYear', 's.EnrollmentYear', 's.PreviousYearMarks',
      's.TenthMarks', 's.TwelfthMarks', 's.AnnualFamilyIncome', 's.FamilySize',
      's.TuitionFee', 's.IsDisabled', 's.DisabilityPercentage', 's.HasGapYear',
      's.GapYearExplanation', 's.StatementOfPurpose', 's.ExtracurricularActivities',
      's.ReceivedPreviousScholarship', 's.PreviousScholarshipName', 's.PreviousScholarshipAmount',
    ).where('a.ApplicationID', applicationId).first();
  const latestRule = await db('EligibilityRules').where({ ScholarshipID: application.ScholarshipID })
    .max('RuleVersion as version').first();
  const [documents, bgChecks, decisions, rules, evaluation, statusHistory] = await Promise.all([
    db('DocumentChecklist').select('ChecklistID', 'DocumentType', 'Status', 'RejectionReason', 'ReviewedAt')
      .where({ ApplicationID: applicationId }),
    db('BackgroundChecks').select('CheckType', 'Result', 'Notes', 'EvidenceURL', 'CompletedAt')
      .where({ ApplicationID: applicationId }),
    db('ApplicationDecisions').select('Stage', 'Decision', 'Reason', 'ActorRole', 'CreatedAt')
      .where({ ApplicationID: applicationId }).orderBy('CreatedAt', 'asc'),
    db('EligibilityRules').select('RuleID', 'RuleType', 'Operator', 'ValueMin', 'ValueMax', 'ValueList', 'IsRequired')
      .where({ ScholarshipID: application.ScholarshipID, RuleVersion: Number(latestRule?.version ?? 1) }).orderBy('RuleID'),
    db('EligibilityEvaluations').select('IsEligible', 'ResultJSON', 'EvaluatedAt', 'RulesVersion')
      .where({ ApplicationID: applicationId }).orderBy('EvaluatedAt', 'desc').first(),
    db('ApplicationStatusHistory').select('FromStatus', 'ToStatus', 'ActorRole', 'Reason', 'CreatedAt')
      .where({ ApplicationID: applicationId }).orderBy('CreatedAt', 'asc'),
  ]);
  return {
    application: {
      ...application,
      SubmittedSnapshot: screeningSnapshot(application.SubmittedSnapshot),
      EligibilitySnapshot: parseSnapshot(application.EligibilitySnapshot)
        ?? parseSnapshot(evaluation?.ResultJSON),
    },
    documents: documents.map((doc) => ({
      ...doc, FileURL: `/api/v1/documents/checklist/${doc.ChecklistID}/download`,
    })),
    bgChecks,
    decisions, eligibilityRules: rules, statusHistory,
    evaluation: evaluation ? { isEligible: Boolean(evaluation.IsEligible),
      evaluatedAt: evaluation.EvaluatedAt, rulesVersion: evaluation.RulesVersion } : null,
  };
}
