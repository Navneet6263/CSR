/* Maps SQL Server PascalCase API rows to frontend camelCase models */

import type {
  DocumentChecklistItem, ReviewApplicationRow, ScreeningApplicationRow,
  CSRApplicationRow, BGCheckApplicationRow, PaymentQueueRow, PendingPaymentRow,
} from '@/types/domain';
import type { Scholarship } from '@/types';
import type { EligibilityRule } from '@/types';

export { mapStudentProfile, mapInstitution } from './studentProfile.mapper';

type Raw = Record<string, unknown>;

export function mapDocument(raw: Raw): DocumentChecklistItem {
  return {
    checklistId: Number(raw.ChecklistID ?? raw.checklistId),
    applicationId: Number(raw.ApplicationID ?? raw.applicationId),
    documentType: String(raw.DocumentType ?? raw.documentType ?? ''),
    fileUrl: (raw.FileURL ?? raw.fileUrl) as string | undefined,
    status: String(raw.Status ?? raw.status ?? 'Pending') as DocumentChecklistItem['status'],
    rejectionReason: (raw.RejectionReason ?? raw.rejectionReason) as string | undefined,
    reUploadCount: Number(raw.ReUploadCount ?? raw.reUploadCount ?? 0),
    uploadedAt: (raw.UploadedAt ?? raw.uploadedAt) as string | undefined,
  };
}

export function mapReviewApp(raw: Raw): ReviewApplicationRow {
  return {
    applicationId: Number(raw.ApplicationID ?? raw.applicationId ?? raw.id),
    status: String(raw.Status ?? raw.status ?? ''),
    submissionDate: (raw.SubmissionDate ?? raw.submissionDate) as string | undefined,
    stageEnteredAt: (raw.StageEnteredAt ?? raw.stageEnteredAt) as string | undefined,
    studentName: String(raw.StudentName ?? raw.studentName ?? 'N/A'),
    studentEmail: (raw.StudentEmail ?? raw.studentEmail) as string | undefined,
    scholarshipName: String(raw.ScholarshipName ?? raw.scholarshipName ?? 'N/A'),
    pendingDocCount: Number(raw.PendingDocCount ?? raw.pendingDocCount ?? 0) || undefined,
    returnReason: (raw.ReturnReason ?? raw.returnReason) as string | undefined,
    returnedAt: (raw.ReturnedAt ?? raw.returnedAt) as string | undefined,
  };
}

export function mapScreeningApp(raw: Raw): ScreeningApplicationRow {
  return {
    applicationId: Number(raw.ApplicationID ?? raw.applicationId ?? raw.id),
    status: String(raw.Status ?? raw.status ?? ''),
    submissionDate: (raw.SubmissionDate ?? raw.submissionDate) as string | undefined,
    scholarshipAmount: Number(raw.ScholarshipAmount ?? raw.scholarshipAmount ?? 0) || undefined,
    scholarshipName: String(raw.ScholarshipName ?? raw.scholarshipName ?? 'N/A'),
    studentName: String(raw.StudentName ?? raw.studentName ?? 'Unknown'),
    studentEmail: (raw.StudentEmail ?? raw.studentEmail) as string | undefined,
    notes: (raw.Notes ?? raw.notes) as string | undefined,
    stageEnteredAt: (raw.StageEnteredAt ?? raw.stageEnteredAt) as string | undefined,
    updatedAt: (raw.UpdatedAt ?? raw.updatedAt) as string | undefined,
    sponsorName: (raw.SponsorName ?? raw.sponsorName) as string | undefined,
    institutionName: (raw.InstitutionName ?? raw.institutionName) as string | undefined,
    studentCity: (raw.StudentCity ?? raw.studentCity) as string | undefined,
    studentState: (raw.StudentState ?? raw.studentState) as string | undefined,
    course: (raw.Course ?? raw.course) as string | undefined,
    category: (raw.Category ?? raw.category) as string | undefined,
    previousYearMarks: Number(raw.PreviousYearMarks ?? raw.previousYearMarks ?? 0) || undefined,
    assignedScreenerId: Number(raw.AssignedScreenerId ?? raw.assignedScreenerId ?? 0) || undefined,
    isHeld: Boolean(raw.IsHeldByAdmin ?? raw.isHeldByAdmin),
    holdReason: (raw.AdminHoldReason ?? raw.adminHoldReason) as string | undefined,
    requiredDocCount: Number(raw.RequiredDocCount ?? raw.requiredDocCount ?? 0),
    verifiedDocCount: Number(raw.VerifiedDocCount ?? raw.verifiedDocCount ?? 0),
    passedBGCount: Number(raw.PassedBGCount ?? raw.passedBGCount ?? 0),
    flaggedBGCount: Number(raw.FlaggedBGCount ?? raw.flaggedBGCount ?? 0),
    decision: (raw.Decision ?? raw.decision) as ScreeningApplicationRow['decision'],
    decisionNotes: (raw.DecisionNotes ?? raw.decisionNotes) as string | undefined,
    decisionAt: (raw.DecisionAt ?? raw.decisionAt) as string | undefined,
  };
}

export function mapCSRApp(raw: Raw): CSRApplicationRow {
  return { ...mapScreeningApp(raw), institutionName: (raw.institutionName ?? raw.InstitutionName) as string | undefined,
    studentState: (raw.studentState ?? raw.StudentState) as string | undefined,
    course: raw.course as string | undefined, category: raw.category as string | undefined,
    previousYearMarks: Number(raw.previousYearMarks ?? 0) || undefined };
}

export function mapBGApp(raw: Raw): BGCheckApplicationRow {
  return {
    applicationId: Number(raw.ApplicationID ?? raw.applicationId ?? raw.id),
    status: String(raw.ApplicationStatus ?? raw.Status ?? raw.status ?? ''),
    studentName: String(raw.StudentName ?? raw.studentName ?? 'N/A'),
    studentEmail: (raw.StudentEmail ?? raw.studentEmail) as string | undefined,
    submissionDate: (raw.SubmissionDate ?? raw.submissionDate) as string | undefined,
    stageEnteredAt: (raw.StageEnteredAt ?? raw.stageEnteredAt) as string | undefined,
    scholarshipName: (raw.ScholarshipName ?? raw.scholarshipName) as string | undefined,
    city: (raw.City ?? raw.city) as string | undefined,
    state: (raw.State ?? raw.state) as string | undefined,
    assignedOfficerId: Number(raw.AssignedBGOfficer ?? raw.assignedOfficerId ?? 0) || undefined,
    completedChecks: Number(raw.CompletedChecks ?? raw.completedChecks ?? 0),
    inconclusiveChecks: Number(raw.InconclusiveChecks ?? raw.inconclusiveChecks ?? 0),
    isHeld: Boolean(raw.IsHeldByAdmin ?? raw.isHeld),
    holdReason: (raw.AdminHoldReason ?? raw.holdReason) as string | undefined,
    returnReason: (raw.ReturnReason ?? raw.returnReason) as string | undefined,
    returnedAt: (raw.ReturnedAt ?? raw.returnedAt) as string | undefined,
  };
}

export function mapPaymentQueue(raw: Raw): PaymentQueueRow {
  return {
    applicationId: Number(raw.ApplicationID ?? raw.applicationId),
    status: String(raw.Status ?? raw.status ?? ''),
    scholarshipAmount: Number(raw.ScholarshipAmount ?? raw.scholarshipAmount ?? 0) || undefined,
    scholarshipName: (raw.ScholarshipName ?? raw.scholarshipName) as string | undefined,
    sponsorName: (raw.SponsorName ?? raw.sponsorName) as string | undefined,
    bankAccountNo: (raw.BankAccountNo ?? raw.bankAccountNo) as string | undefined,
    bankIFSC: (raw.BankIFSC ?? raw.bankIFSC) as string | undefined,
    bankName: (raw.BankName ?? raw.bankName) as string | undefined,
    studentName: (raw.StudentName ?? raw.studentName) as string | undefined,
    aadhaarLinked: Boolean(raw.IsAadhaarLinkedToBank ?? raw.aadhaarLinked),
    approvedAt: (raw.ApprovedAt ?? raw.approvedAt) as string | undefined,
  };
}

export function mapPendingPayment(raw: Raw): PendingPaymentRow {
  return {
    paymentId: Number(raw.PaymentID ?? raw.paymentId ?? raw.id),
    applicationId: Number(raw.ApplicationID ?? raw.applicationId),
    amount: Number(raw.Amount ?? raw.amount ?? 0),
    paymentType: String(raw.PaymentType ?? raw.paymentType ?? ''),
    paymentStatus: String(raw.PaymentStatus ?? raw.paymentStatus ?? raw.status ?? ''),
    bankAccountNo: (raw.BankAccountNo ?? raw.bankAccountNo) as string | undefined,
    bankIFSC: (raw.BankIFSC ?? raw.bankIFSC) as string | undefined,
    bankName: (raw.BankName ?? raw.bankName) as string | undefined,
    studentName: (raw.StudentName ?? raw.studentName) as string | undefined,
    sponsorName: (raw.SponsorName ?? raw.sponsorName) as string | undefined,
    makerId: Number(raw.MakerID ?? raw.makerId ?? 0) || undefined,
    createdAt: (raw.CreatedAt ?? raw.createdAt) as string | undefined,
  };
}

export function mapScholarship(raw: Raw): Scholarship {
  let publishedContent = raw.PublishedContent ?? raw.publishedContent;
  if (typeof publishedContent === 'string') {
    try { publishedContent = JSON.parse(publishedContent); } catch { publishedContent = null; }
  }
  return {
    scholarshipId: Number(raw.ScholarshipID ?? raw.scholarshipId),
    name: String(raw.Name ?? raw.name ?? ''),
    description: (raw.Description ?? raw.description) as string | undefined,
    sponsorName: String(raw.SponsorName ?? raw.sponsorName ?? ''),
    totalBudget: Number(raw.TotalBudget ?? raw.totalBudget ?? 0),
    perStudentAmount: Number(raw.PerStudentAmount ?? raw.perStudentAmount ?? 0),
    applicationOpenDate: String(raw.ApplicationOpenDate ?? raw.applicationOpenDate ?? ''),
    applicationCloseDate: String(raw.ApplicationCloseDate ?? raw.applicationCloseDate ?? ''),
    maxApplicants: Number(raw.MaxApplicants ?? raw.maxApplicants ?? 0) || undefined,
    status: String(raw.Status ?? raw.status ?? ''),
    sponsorLogoURL: (raw.SponsorLogoURL ?? raw.sponsorLogoURL) as string | undefined,
    contentStatus: (raw.ContentStatus ?? raw.contentStatus) as string | undefined,
    pauseReason: (raw.PauseReason ?? raw.pauseReason) as string | undefined,
    pausedAt: (raw.PausedAt ?? raw.pausedAt) as string | undefined,
    resumeAt: (raw.ResumeAt ?? raw.resumeAt) as string | undefined,
    publishPauseNotice: Boolean(raw.PublishPauseNotice ?? raw.publishPauseNotice),
    publishedContent: publishedContent as Scholarship['publishedContent'],
  };
}

export function mapEligibilityRule(raw: Raw): EligibilityRule {
  return { ruleId: Number(raw.RuleID ?? raw.ruleId), scholarshipId: Number(raw.ScholarshipID ?? raw.scholarshipId),
    ruleType: String(raw.RuleType ?? raw.ruleType ?? ''), operator: String(raw.Operator ?? raw.operator ?? ''),
    valueMin: (raw.ValueMin ?? raw.valueMin) as string | undefined,
    valueMax: (raw.ValueMax ?? raw.valueMax) as string | undefined,
    valueList: (raw.ValueList ?? raw.valueList) as string | undefined,
    isRequired: Boolean(raw.IsRequired ?? raw.isRequired) };
}

export function mapApplication(raw: Raw): import('@/types').Application {
  return {
    applicationId: Number(raw.ApplicationID ?? raw.applicationId),
    studentId: Number(raw.StudentID ?? raw.studentId),
    scholarshipId: Number(raw.ScholarshipID ?? raw.scholarshipId),
    scholarshipName: String(raw.ScholarshipName ?? raw.scholarshipName ?? ''),
    status: String(raw.Status ?? raw.status ?? ''),
    submissionDate: (raw.SubmissionDate ?? raw.submissionDate) as string | undefined,
    scholarshipAmount: Number(raw.ScholarshipAmount ?? raw.scholarshipAmount ?? 0) || undefined,
    createdAt: String(raw.CreatedAt ?? raw.createdAt ?? ''),
  };
}
