export type ApplicationDisplayStatus = 'Funded' | 'Under Review' | 'Pending' | 'Rejected';
export type StageKey = 'registration' | 'documents' | 'auto_match' | 'doc_audit'
  | 'bg_check' | 'screening' | 'csr_approval' | 'funded';

export interface DashboardStudentProfile {
  name: string;
  profileCompletion: number;
  classLevel: '10' | '12' | 'UG' | 'PG';
  stream: 'Engineering' | 'Science' | 'Commerce' | 'Arts' | 'Other';
  gender: 'male' | 'female' | 'other';
  annualIncome: number;
  category: string;
  state: string;
}

export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  hint?: string;
  tone: 'primary' | 'neutral' | 'success' | 'warning';
}

export interface ProgressStep {
  key: string;
  label: string;
  status: 'complete' | 'current' | 'pending';
}

export interface RequiredDocument {
  id: string;
  name: string;
  description: string;
  status: 'uploaded' | 'pending' | 'rejected';
  rejectionReason?: string;
}

export interface DashboardApplication {
  id: string;
  scholarship: string;
  appliedOn: string;
  currentStage: string;
  amount: string;
  status: ApplicationDisplayStatus;
}

export interface DashboardNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  type: 'info' | 'action' | 'success';
}
