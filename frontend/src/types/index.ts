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
  role: 'Student';
  termsAccepted: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
}

export interface AuthUser {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  sponsorId?: number | null;
  financeFunction?: 'Maker' | 'Checker' | null;
  mustChangePassword?: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  csrfToken?: string;
}

export interface StudentProfile {
  studentId: number;
  userId: number;
  fullName: string;
  email: string;
  phone?: string;
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
  institutionId?: number | 'other';
  otherInstitutionName?: string;
  institutionName?: string;
  enrollmentYear?: number;
  bankAccountNo?: string;
  bankIFSC?: string;
  bankName?: string;
  bankBranch?: string;
  previousYearMarks?: number;
  tenthBoardName?: string;
  tenthPassingYear?: number;
  tenthMarks?: number;
  twelfthBoardName?: string;
  twelfthPassingYear?: number;
  twelfthMarks?: number;
  currentSemesterOrYear?: string;
  admissionRegistrationNo?: string;
  fatherName?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherOccupation?: string;
  religion?: string;
  isDisabled?: boolean;
  disabilityPercentage?: number;
  domicileState?: string;
  domicileDistrict?: string;
  tuitionFee?: number;

  casteCertificateNumber?: string;
  casteCertificateIssueDate?: string;
  domicileCertificateNumber?: string;
  alternatePhone?: string;

  isHosteller?: boolean;
  distanceFromHome?: number;
  hasGapYear?: boolean;
  gapYearExplanation?: string;

  receivedPreviousScholarship?: boolean;
  previousScholarshipName?: string;
  previousScholarshipAmount?: number;
  previousScholarshipYear?: number;

  isAadhaarLinkedToBank?: boolean;
  isEKYCVerified?: boolean;

  statementOfPurpose?: string;
  extracurricularActivities?: string;

  permanentAddress?: string;
  permanentCity?: string;
  permanentState?: string;
  permanentPincode?: string;
  isPermanentSameAsCurrent?: boolean;
  currentAddressDurationMonths?: number;
  numberOfSiblings?: number;
  siblingDetails?: any;
  fatherAadharFileURL?: string;
  motherAadharFileURL?: string;
  fatherPayslipFileURL?: string;
  bankStatement6MonthsFileURL?: string;
  profileCompletion?: number;
  profileSections?: Array<{ label: string; complete: boolean }>;
  missingProfileSections?: string[];
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
  | 'PaymentFailed' | 'Cancelled';

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}
