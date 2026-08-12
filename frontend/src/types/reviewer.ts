export type DocStatus = 'Pending' | 'Uploaded' | 'Verified' | 'ReUploadRequested' | 'Rejected';

export interface ReviewerStudent {
  id: string; fullName: string; dob: string; gender: string; category: string;
  aadhar: string; income: string; state: string; district: string;
  bank: { acc: string; ifsc: string; name: string };
  scores: { tenth: string; twelfth: string; current: string };
  disability?: string;
}

export interface ReviewerDocument {
  key: string; label: string; verifies: string; status: DocStatus;
  reason?: string; required: boolean; url?: string; checklistId?: number;
}

export interface ReviewerApplication {
  id: string; scholarship: string; submitted: string; status: string;
  student: ReviewerStudent; documents: ReviewerDocument[];
}

export interface ReviewerAuditStudent {
  name: string; applicationId: number; applicationStatus: string; scholarship: string;
  aadhar?: string; income?: number; category?: string; state?: string;
  course?: string; previousYearMarks?: number; email?: string; phone?: string;
}

export interface RawReviewerLog {
  id: number; action: string; docType: string; studentName: string;
  appId: number; reason?: string; timestamp: string;
}

export interface ReviewerActivityLog {
  id: string; action: 'Approved' | 'Rejected' | 'Submitted'; docType: string;
  studentName: string; appId: string; reason?: string; timestamp: string;
}
