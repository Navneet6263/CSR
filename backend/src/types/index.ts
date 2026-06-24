import { Request } from 'express';

// ─── Role & Status Enums ────────────────────────────────────────────────────
export type UserRole =
  | 'Student' | 'Agent' | 'DocReviewer' | 'BGCheckOfficer'
  | 'ScreeningOfficer' | 'CSRPartner' | 'Admin' | 'Finance';

export type ApplicationStatus =
  | 'Draft' | 'Submitted' | 'AutoMatched' | 'EligibilityFailed'
  | 'DocAuditInProgress' | 'DocAuditComplete'
  | 'BGCheckInProgress' | 'BGCheckComplete'
  | 'ScreeningPending' | 'ScreeningApproved' | 'ScreeningRejected'
  | 'CSRPending' | 'CSRApproved' | 'CSRDeclined'
  | 'PaymentPending' | 'PaymentInitiated' | 'PaymentCompleted' | 'Cancelled';

export type DocumentStatus =
  | 'Pending' | 'Uploaded' | 'Verified' | 'Rejected' | 'ReUploadRequested';

export type BGCheckResult = 'Pass' | 'Fail' | 'Inconclusive' | 'Pending';

export type PaymentStatus = 'Pending' | 'Initiated' | 'Completed' | 'Failed';

// ─── Interfaces ─────────────────────────────────────────────────────────────
export interface IUser {
  UserID: number;
  FullName: string;
  Email: string;
  Phone: string;
  PasswordHash: string;
  Role: UserRole;
  AgentCode: string | null;
  SponsorID: number | null;
  IsActive: boolean;
  CreatedAt: Date;
  UpdatedAt: Date;
}

export interface IStudent {
  StudentID: number;
  UserID: number;
  AadharNumber: string;
  DOB: Date;
  Gender: string;
  Category: string;
  Address: string;
  City: string;
  State: string;
  Pincode: string;
  AnnualFamilyIncome: number;
  FamilySize: number;
  Course: string;
  InstitutionID: number | null;
  EnrollmentYear: number;
  BankAccountNo: string;
  BankIFSC: string;
  BankName: string;
  CreatedAt: Date;
}

export interface IApplication {
  ApplicationID: number;
  StudentID: number;
  AgentID: number | null;
  ScholarshipID: number;
  SubmissionDate: Date;
  Status: ApplicationStatus;
  ScholarshipAmount: number;
  SponsorID: number | null;
  Notes: string | null;
  CreatedAt: Date;
}

export interface IApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  message: string;
}

// ─── Express Extension ──────────────────────────────────────────────────────
export interface AuthPayload {
  userId: number;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
