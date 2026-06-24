export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: 'Student' | 'Agent';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
}

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface StudentProfile {
  studentId: number;
  userId: number;
  fullName: string;
  email: string;
  aadharNumber?: string;
  dob?: string;
  gender?: string;
  category?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  annualFamilyIncome?: number;
  familySize?: number;
  course?: string;
  institutionId?: number;
  institutionName?: string;
  enrollmentYear?: number;
  bankAccountNo?: string;
  bankIFSC?: string;
  bankName?: string;
}

export interface Scholarship {
  scholarshipId: number;
  name: string;
  description?: string;
  sponsorName: string;
  totalBudget: number;
  perStudentAmount: number;
  applicationOpenDate: string;
  applicationCloseDate: string;
  maxApplicants?: number;
  status: string;
}

export interface EligibilityRule {
  ruleId: number;
  scholarshipId: number;
  ruleType: string;
  operator: string;
  valueMin?: string;
  valueMax?: string;
  valueList?: string;
  isRequired: boolean;
}

export interface Application {
  applicationId: number;
  studentId: number;
  scholarshipId: number;
  scholarshipName: string;
  status: string;
  submissionDate?: string;
  scholarshipAmount?: number;
  createdAt: string;
}

export interface Institution {
  institutionId: number;
  name: string;
  type: string;
  district: string;
  state: string;
}

export type ApplicationStatus =
  | 'Draft' | 'Submitted' | 'AutoMatched' | 'EligibilityFailed'
  | 'DocAuditInProgress' | 'DocAuditComplete'
  | 'BGCheckInProgress' | 'BGCheckComplete'
  | 'ScreeningPending' | 'ScreeningApproved' | 'ScreeningRejected'
  | 'CSRPending' | 'CSRApproved' | 'CSRDeclined'
  | 'PaymentPending' | 'PaymentInitiated' | 'PaymentCompleted'
  | 'Cancelled';

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}
