export type Sponsor = string;
export type PayoutStatus = 'CSRApproved' | 'MakerEntered' | 'PaymentCompleted' | 'Failed';

export interface Payout {
  id: string; paymentId?: number; applicationId: string; fullName: string; amount: number;
  bankName: string; accountNumber: string; ifsc: string; aadhaarLinked: 'Yes' | 'No';
  sponsor: Sponsor; approvedAt: string; status: PayoutStatus; makerName?: string; makerAt?: string;
}

export interface CompletedPayment {
  txnId: string; applicationId: string; fullName: string; bankName: string; amount: number;
  sponsor: Sponsor; date: string; maker: string; checker: string;
}

export interface FailedPayment {
  id: string; paymentId?: number; applicationId: string; fullName: string; amount: number;
  bankName: string; sponsor: Sponsor; reason: string; failedAt: string;
  studentNotified: boolean; detailsUpdated: boolean;
}

export interface AuditEvent {
  id: string; ts: string; actor: string; role: 'Maker' | 'Checker' | 'Admin' | 'System';
  action: string; target: string; paymentId?: number; amount?: number;
  referenceNo?: string; meta?: string;
}

export interface FinanceMetric { count: number; amount: number }
export interface FinanceOverview {
  maker: FinanceMetric; checker: FinanceMetric; settledToday: FinanceMetric;
  exceptions: FinanceMetric; generatedAt: string;
}

export const inr = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;
export const daysBetween = (isoDate: string, now = new Date()) => Math.max(
  0, Math.floor((now.getTime() - new Date(isoDate).getTime()) / 86_400_000),
);
