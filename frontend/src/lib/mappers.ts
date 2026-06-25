/* Maps SQL Server PascalCase API rows to frontend camelCase models */

import type {
  DocumentChecklistItem, ReviewApplicationRow, ScreeningApplicationRow,
  CSRApplicationRow, BGCheckApplicationRow, PaymentQueueRow, PendingPaymentRow,
} from '@/types/domain';
import type { Scholarship, StudentProfile } from '@/types';

type Raw = Record<string, unknown>;

export function mapStudentProfile(raw: Raw): StudentProfile {
  return {
    studentId: Number(raw.StudentID ?? raw.studentId),
    userId: Number(raw.UserID ?? raw.userId),
    fullName: String(raw.FullName ?? raw.fullName ?? ''),
    firstName: String(raw.FullName ?? raw.fullName ?? '').split(' ')[0] || '',
    lastName: String(raw.FullName ?? raw.fullName ?? '').split(' ').slice(1).join(' ') || '',
    email: String(raw.Email ?? raw.email ?? ''),
    phone: String(raw.Phone ?? raw.phone ?? ''),
    aadharNumber: (raw.AadharNumber ?? raw.aadharNumber) as string | undefined,
    dob: (raw.DOB ?? raw.dob) as string | undefined,
    gender: (raw.Gender ?? raw.gender) as string | undefined,
    category: (raw.Category ?? raw.category) as string | undefined,
    address: (raw.Address ?? raw.address) as string | undefined,
    city: (raw.City ?? raw.city) as string | undefined,
    state: (raw.State ?? raw.state) as string | undefined,
    pincode: (raw.Pincode ?? raw.pincode) as string | undefined,
    annualFamilyIncome: Number(raw.AnnualFamilyIncome ?? raw.annualFamilyIncome ?? 0) || undefined,
    familySize: Number(raw.FamilySize ?? raw.familySize ?? 0) || undefined,
    course: (raw.Course ?? raw.course) as string | undefined,
    currentDegree: (raw.Course ?? raw.course) as string | undefined,
    institutionId: Number(raw.InstitutionID ?? raw.institutionId) || undefined,
    otherInstitutionName: (raw.OtherInstitutionName ?? raw.otherInstitutionName) as string | undefined,
    institutionName: (raw.InstitutionName ?? raw.institutionName) as string | undefined,
    enrollmentYear: Number(raw.EnrollmentYear ?? raw.enrollmentYear) || undefined,
    yearOfStudy: Number(raw.EnrollmentYear ?? raw.enrollmentYear) || undefined,
    bankAccountNo: (raw.BankAccountNo ?? raw.bankAccountNo) as string | undefined,
    bankAccountNumber: (raw.BankAccountNo ?? raw.bankAccountNo) as string | undefined,
    bankIFSC: (raw.BankIFSC ?? raw.bankIFSC) as string | undefined,
    ifscCode: (raw.BankIFSC ?? raw.bankIFSC) as string | undefined,
    bankName: (raw.BankName ?? raw.bankName) as string | undefined,
    // Extended fields
    fatherName: (raw.FatherName ?? raw.fatherName) as string | undefined,
    motherName: (raw.MotherName ?? raw.motherName) as string | undefined,
    religion: (raw.Religion ?? raw.religion) as string | undefined,
    tenthMarks: Number(raw.TenthMarks ?? raw.tenthMarks ?? 0) || undefined,
    twelfthMarks: Number(raw.TwelfthMarks ?? raw.twelfthMarks ?? 0) || undefined,
    statementOfPurpose: (raw.StatementOfPurpose ?? raw.statementOfPurpose) as string | undefined,
    extracurricularActivities: (raw.ExtracurricularActivities ?? raw.extracurricularActivities) as string | undefined,
    isHosteller: Boolean(raw.IsHosteller ?? raw.isHosteller),
    hasGapYear: Boolean(raw.HasGapYear ?? raw.hasGapYear),
    receivedPreviousScholarship: Boolean(raw.ReceivedPreviousScholarship ?? raw.receivedPreviousScholarship),
  };
}

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
