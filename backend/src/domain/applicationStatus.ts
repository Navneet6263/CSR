import { ApplicationStatus, UserRole } from '../types';

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'Draft', 'Submitted', 'AutoMatched', 'EligibilityFailed',
  'DocAuditInProgress', 'DocAuditComplete', 'BGCheckInProgress', 'BGCheckComplete',
  'ScreeningPending', 'ScreeningApproved', 'ScreeningRejected',
  'CSRPending', 'CSRApproved', 'CSRDeclined', 'PaymentPending',
  'PaymentInitiated', 'PaymentCompleted', 'PaymentFailed', 'Cancelled',
];

export const ALLOWED_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  Draft: ['Submitted', 'Cancelled'],
  Submitted: ['DocAuditInProgress', 'DocAuditComplete', 'EligibilityFailed', 'Cancelled'],
  AutoMatched: ['DocAuditInProgress', 'DocAuditComplete', 'EligibilityFailed', 'Cancelled'],
  EligibilityFailed: ['Cancelled'],
  DocAuditInProgress: ['DocAuditComplete', 'Cancelled'],
  DocAuditComplete: ['BGCheckInProgress', 'BGCheckComplete', 'Cancelled'],
  BGCheckInProgress: ['BGCheckComplete', 'ScreeningPending', 'Cancelled'],
  BGCheckComplete: ['DocAuditInProgress', 'BGCheckInProgress', 'ScreeningApproved', 'ScreeningRejected', 'Cancelled'],
  ScreeningPending: ['DocAuditInProgress', 'BGCheckInProgress', 'ScreeningApproved', 'ScreeningRejected', 'Cancelled'],
  ScreeningApproved: ['CSRPending', 'CSRApproved', 'CSRDeclined', 'Cancelled'],
  ScreeningRejected: ['Cancelled'],
  CSRPending: ['CSRApproved', 'CSRDeclined', 'Cancelled'],
  CSRApproved: ['PaymentPending', 'PaymentInitiated', 'Cancelled'],
  CSRDeclined: ['Cancelled'],
  PaymentPending: ['PaymentInitiated', 'PaymentFailed', 'Cancelled'],
  PaymentInitiated: ['PaymentCompleted', 'PaymentFailed'],
  PaymentCompleted: [],
  PaymentFailed: ['PaymentInitiated', 'Cancelled'],
  Cancelled: [],
};

const transitionRoles: Partial<Record<ApplicationStatus, UserRole[]>> = {
  Submitted: ['Student'],
  DocAuditInProgress: ['DocReviewer', 'ScreeningOfficer'],
  DocAuditComplete: ['DocReviewer'],
  BGCheckInProgress: ['BGCheckOfficer', 'ScreeningOfficer'],
  BGCheckComplete: ['BGCheckOfficer'],
  ScreeningPending: ['BGCheckOfficer'],
  ScreeningApproved: ['ScreeningOfficer'],
  ScreeningRejected: ['ScreeningOfficer'],
  CSRPending: ['CSRPartner'],
  CSRApproved: ['CSRPartner'],
  CSRDeclined: ['CSRPartner'],
  PaymentPending: ['Finance'],
  PaymentInitiated: ['Finance'],
  PaymentCompleted: ['Finance'],
  PaymentFailed: ['Finance'],
};

export function canRoleTransition(role: UserRole, toStatus: ApplicationStatus): boolean {
  return role === 'Admin' || (transitionRoles[toStatus]?.includes(role) ?? false);
}
