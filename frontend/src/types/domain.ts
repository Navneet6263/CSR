export type DocumentStatus =
  | 'Pending' | 'Uploaded' | 'Verified' | 'Rejected' | 'ReUploadRequested';

export type DocumentType =
  | 'Aadhar' | 'PAN' | 'IncomeCertificate' | 'CasteCertificate'
  | 'EducationProof' | 'BankProof' | 'PhotoID' | 'Other';

export type BGCheckResult = 'Pass' | 'Fail' | 'Inconclusive' | 'Pending';

export type ScreeningDecision = 'Approve' | 'Reject';
export type CSRDecision = 'Approve' | 'Decline' | 'Defer';
export type PaymentVerifyStatus = 'Completed' | 'Failed';

export interface DocumentChecklistItem {
  checklistId: number;
  applicationId: number;
  documentType: DocumentType | string;
  fileUrl?: string;
  status: DocumentStatus;
  rejectionReason?: string;
  reUploadCount?: number;
  uploadedAt?: string;
}

export interface ReviewApplicationRow {
  applicationId: number;
  status: string;
  submissionDate?: string;
  studentName: string;
  studentEmail?: string;
  scholarshipName: string;
  pendingDocCount?: number;
}

export interface ScreeningApplicationRow {
  applicationId: number;
  status: string;
  submissionDate?: string;
  scholarshipAmount?: number;
  scholarshipName: string;
  studentName: string;
  studentEmail?: string;
  notes?: string;
}

export interface CSRApplicationRow extends ScreeningApplicationRow {
  institutionName?: string;
  docStatusSummary?: string;
}

export interface BGCheckApplicationRow {
  applicationId: number;
  status: string;
  studentName: string;
  studentEmail?: string;
  submissionDate?: string;
}

export interface PaymentQueueRow {
  applicationId: number;
  status: string;
  scholarshipAmount?: number;
  scholarshipName?: string;
  sponsorName?: string;
  bankAccountNo?: string;
  bankIFSC?: string;
}

export interface PendingPaymentRow {
  paymentId: number;
  applicationId: number;
  amount: number;
  paymentType: string;
  paymentStatus: string;
  bankAccountNo?: string;
  bankIFSC?: string;
}

export interface ScholarshipListResponse {
  scholarships: Record<string, unknown>[];
  pagination: { page: number; limit: number; total: number };
}

export interface DocReviewPayload {
  status: 'Verified' | 'Rejected';
  rejectionReason?: string;
}

export interface DocUploadPayload {
  applicationId: number;
  documentType: string;
  fileUrl: string;
}

export interface BGCheckPayload {
  checkType: string;
  result: BGCheckResult;
  notes?: string;
  evidenceUrl?: string;
}

export interface ScreeningPayload {
  decision: ScreeningDecision;
  notes?: string;
}

export interface CSRPayload {
  decision: Exclude<CSRDecision, 'Defer'>;
  notes?: string;
}

export interface InitiatePaymentPayload {
  appId: number;
  amount: number;
  paymentType: string;
  makerNotes?: string;
}

export interface VerifyPaymentPayload {
  status: PaymentVerifyStatus;
  referenceNo: string;
  checkerNotes?: string;
}
