import type { ApplicationDisplayStatus, DashboardApplication } from '@/types/dashboard';

export const workflowStages = [
  { key: 'submitted', label: 'Submitted', note: 'Application received' },
  { key: 'review', label: 'Doc Review', note: 'Documents under verification' },
  { key: 'bg', label: 'Background Check', note: 'Identity and address verification' },
  { key: 'screening', label: 'Screening', note: 'Eligibility screening decision' },
  { key: 'csr', label: 'CSR Approval', note: 'Sponsor decision' },
  { key: 'payment', label: 'Payment', note: 'Disbursement processing' },
] as const;

const rejectedStatuses = new Set(['EligibilityFailed', 'ScreeningRejected', 'CSRDeclined', 'Cancelled', 'PaymentFailed']);

export function displayStatus(status: string): ApplicationDisplayStatus {
  if (status === 'PaymentCompleted') return 'Funded';
  if (rejectedStatuses.has(status)) return 'Rejected';
  if (status === 'Draft') return 'Pending';
  return 'Under Review';
}

export function stageIndex(status: string) {
  if (['Submitted', 'AutoMatched', 'DocAuditInProgress', 'DocAuditComplete'].includes(status)) return 1;
  if (['BGCheckInProgress', 'BGCheckComplete'].includes(status)) return 2;
  if (['ScreeningPending', 'ScreeningApproved', 'ScreeningRejected'].includes(status)) return 3;
  if (['CSRPending', 'CSRApproved', 'CSRDeclined'].includes(status)) return 4;
  if (['PaymentPending', 'PaymentInitiated', 'PaymentCompleted', 'PaymentFailed'].includes(status)) return 5;
  return 0;
}

export function applicationRow(raw: Record<string, any>): DashboardApplication {
  const status = String(raw.Status ?? raw.status ?? 'Draft');
  const amount = Number(raw.ScholarshipAmount ?? raw.scholarshipAmount ?? 0);
  const createdAt = raw.SubmissionDate ?? raw.submissionDate ?? raw.CreatedAt ?? raw.createdAt;
  return {
    id: String(raw.ApplicationID ?? raw.applicationId ?? raw.id ?? ''),
    scholarship: String(raw.ScholarshipName ?? raw.scholarshipName ?? ''),
    appliedOn: createdAt ? new Date(createdAt).toLocaleDateString('en-IN') : 'Not submitted',
    currentStage: status,
    amount: amount ? `₹${amount.toLocaleString('en-IN')}` : 'Not set',
    status: displayStatus(status),
  };
}

export function applicationTimeline(status: string) {
  const active = stageIndex(status);
  const rejected = rejectedStatuses.has(status);
  return workflowStages.map((stage, index) => ({
    ...stage,
    status: rejected && index === active ? 'rejected' as const
      : status === 'PaymentCompleted' || index < active ? 'complete' as const
        : index === active ? 'current' as const : 'pending' as const,
  }));
}
