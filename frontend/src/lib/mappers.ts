/* Maps SQL Server PascalCase API rows to frontend camelCase models */

import type {
  DocumentChecklistItem, ReviewApplicationRow, ScreeningApplicationRow,
  CSRApplicationRow, BGCheckApplicationRow, PaymentQueueRow, PendingPaymentRow,
} from '@/types/domain';
import type { Scholarship } from '@/types';

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
    studentName: String(raw.StudentName ?? raw.studentName ?? 'N/A'),
    studentEmail: (raw.StudentEmail ?? raw.studentEmail) as string | undefined,
    scholarshipName: String(raw.ScholarshipName ?? raw.scholarshipName ?? 'N/A'),
    pendingDocCount: Number(raw.PendingDocCount ?? raw.pendingDocCount ?? 0) || undefined,
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
  };
}

export function mapCSRApp(raw: Raw): CSRApplicationRow {
  return { ...mapScreeningApp(raw), institutionName: raw.InstitutionName as string | undefined };
}

export function mapBGApp(raw: Raw): BGCheckApplicationRow {
  return {
    applicationId: Number(raw.ApplicationID ?? raw.applicationId ?? raw.id),
    status: String(raw.ApplicationStatus ?? raw.Status ?? raw.status ?? ''),
    studentName: String(raw.StudentName ?? raw.studentName ?? 'N/A'),
    studentEmail: (raw.StudentEmail ?? raw.studentEmail) as string | undefined,
    submissionDate: (raw.SubmissionDate ?? raw.submissionDate) as string | undefined,
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
  };
}

export function mapScholarship(raw: Raw): Scholarship {
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
  };
}
