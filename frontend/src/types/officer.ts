export interface OfficerStats {
  pending: number;
  assigned: number;
  available: number;
  completed: number;
  today: number;
  overdue: number;
}

export interface OfficerLog {
  logId: number;
  appId: number;
  studentName: string;
  scholarshipName?: string;
  actionType: 'Identity' | 'Address' | 'IncomeVerification';
  status: 'Pass' | 'Fail' | 'Inconclusive';
  notes?: string;
  evidenceUrl?: string;
  timestamp: string;
}

export interface OfficerDocument {
  id: number;
  type: string;
  status: string;
  rejectionReason?: string;
  reviewedAt?: string;
  url: string;
}

export interface OfficerCheck {
  type: 'Identity' | 'Address' | 'IncomeVerification';
  result: 'Pass' | 'Fail' | 'Inconclusive';
  notes?: string;
  evidenceUrl?: string;
  completedAt?: string;
}

export interface OfficerCaseDetail {
  student: Record<string, unknown>;
  docs: OfficerDocument[];
  checks: OfficerCheck[];
  returnInstruction?: { notes?: string; returnedAt?: string; returnedBy?: string } | null;
}
