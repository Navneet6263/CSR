'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { financeApi } from '@/lib/api/finance';
import { authApi } from '@/lib/api/auth';
import type { AuditEvent, CompletedPayment, FailedPayment, FinanceOverview, Payout } from '@/types/finance';
import type { PaymentQueueRow, PendingPaymentRow } from '@/types/domain';

type FinanceContext = {
  pending: Payout[]; awaitingChecker: Payout[]; completed: CompletedPayment[];
  failed: FailedPayment[]; audit: AuditEvent[]; loading: boolean; error: string;
  overview: FinanceOverview;
  refresh: () => Promise<void>;
  makerSubmit: (ids: string[], utr: string) => Promise<void>;
  checkerVerify: (id: string, utr: string, notes: string) => Promise<{ ok: boolean }>;
  checkerCancel: (id: string, reason: string) => Promise<void>;
};

const Context = createContext<FinanceContext | null>(null);
const emptyOverview: FinanceOverview = {
  maker: { count: 0, amount: 0 }, checker: { count: 0, amount: 0 },
  settledToday: { count: 0, amount: 0 }, exceptions: { count: 0, amount: 0 }, generatedAt: '',
};
const text = (value: unknown, fallback = '—') => value == null || value === '' ? fallback : String(value);
const number = (value: unknown) => Number(value ?? 0);

function mapInitiation(row: PaymentQueueRow): Payout {
  return {
    id: `APP-${row.applicationId}`, applicationId: `APP-${row.applicationId}`,
    fullName: row.studentName ?? 'Applicant', amount: row.scholarshipAmount ?? 0,
    bankName: row.bankName ?? '—', accountNumber: row.bankAccountNo ?? '—', ifsc: row.bankIFSC ?? '—',
    aadhaarLinked: row.aadhaarLinked ? 'Yes' : 'No', sponsor: row.sponsorName ?? '—',
    approvedAt: row.approvedAt ?? new Date(0).toISOString(), status: 'CSRApproved',
  };
}

function mapVerification(row: PendingPaymentRow): Payout {
  return {
    id: `PAY-${row.paymentId}`, paymentId: row.paymentId, applicationId: `APP-${row.applicationId}`,
    fullName: row.studentName ?? 'Applicant', amount: row.amount, bankName: row.bankName ?? '—',
    accountNumber: row.bankAccountNo ?? '—', ifsc: row.bankIFSC ?? '—', aadhaarLinked: 'Yes',
    sponsor: row.sponsorName ?? '—', approvedAt: row.createdAt ?? new Date(0).toISOString(),
    status: 'MakerEntered', makerName: row.makerId ? `User #${row.makerId}` : 'Maker', makerAt: row.createdAt,
  };
}

function mapCompleted(row: Record<string, unknown>): CompletedPayment {
  return {
    txnId: text(row.ReferenceNo), applicationId: `APP-${text(row.ApplicationID)}`,
    fullName: text(row.StudentName, 'Applicant'), bankName: text(row.BankName), amount: number(row.Amount),
    sponsor: text(row.SponsorName), date: text(row.UpdatedAt).slice(0, 10),
    maker: text(row.MakerName, 'Maker'), checker: text(row.CheckerName, 'Checker'),
  };
}

function mapFailed(row: Record<string, unknown>): FailedPayment {
  return {
    id: `PAY-${text(row.PaymentID)}`, paymentId: number(row.PaymentID),
    applicationId: `APP-${text(row.ApplicationID)}`, fullName: text(row.StudentName, 'Applicant'),
    amount: number(row.Amount), bankName: text(row.BankName), sponsor: text(row.SponsorName),
    reason: text(row.CheckerNotes, 'Payment failed'), failedAt: text(row.UpdatedAt).slice(0, 10),
    studentNotified: true,
    detailsUpdated: Boolean(row.StudentUpdatedAt && new Date(text(row.StudentUpdatedAt)).getTime() > new Date(text(row.UpdatedAt)).getTime()),
  };
}

function mapAudit(row: Record<string, unknown>): AuditEvent {
  return { id: text(row.id), ts: text(row.timestamp), actor: text(row.actor, 'System'),
    role: text(row.role, 'System') as AuditEvent['role'], action: text(row.action),
    target: text(row.target), paymentId: number(row.paymentId) || undefined,
    amount: row.amount == null ? undefined : number(row.amount),
    referenceNo: row.referenceNo ? text(row.referenceNo) : undefined,
    meta: row.requestId ? `Request ${text(row.requestId)}` : undefined };
}

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Payout[]>([]);
  const [awaitingChecker, setAwaitingChecker] = useState<Payout[]>([]);
  const [completed, setCompleted] = useState<CompletedPayment[]>([]);
  const [failed, setFailed] = useState<FailedPayment[]>([]);
  const [audit, setAudit] = useState<AuditEvent[]>([]);
  const [overview, setOverview] = useState<FinanceOverview>(emptyOverview);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setError('');
    try {
      const financeFunction = authApi.getUser()?.financeFunction;
      const makerQueue = financeFunction === 'Maker'
        ? financeApi.getPendingInitiation() : Promise.resolve({ data: [] as PaymentQueueRow[] });
      const checkerQueue = financeFunction === 'Checker'
        ? financeApi.getPendingVerifications() : Promise.resolve({ data: [] as PendingPaymentRow[] });
      const [summary, initiation, verification, done, failedRows, auditRows] = await Promise.all([
        financeApi.getOverview(),
        makerQueue, checkerQueue,
        financeApi.getHistory('completed'), financeApi.getHistory('failed'), financeApi.getAudit(),
      ]);
      setOverview(summary.data ?? emptyOverview);
      setPending((initiation.data ?? []).map(mapInitiation));
      setAwaitingChecker((verification.data ?? []).map(mapVerification));
      setCompleted((done.data ?? []).map(mapCompleted));
      setFailed((failedRows.data ?? []).map(mapFailed));
      setAudit((auditRows.data ?? []).map(mapAudit));
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Finance data could not be loaded.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const makerSubmit = useCallback(async (ids: string[], utr: string) => {
    if (ids.length !== 1) throw new Error('Each bank UTR can be recorded against exactly one payment.');
    const row = pending.find((item) => item.id === ids[0]);
    if (!row) throw new Error('Payment is no longer pending. Refresh and retry.');
    if (!Number.isFinite(row.amount) || row.amount <= 0) {
      throw new Error('Approved scholarship amount is missing. Ask an administrator to repair this application.');
    }
    await financeApi.initiatePayment({ appId: Number(row.applicationId.replace('APP-', '')),
      amount: row.amount, paymentType: 'Direct', referenceNo: utr });
    await refresh();
  }, [pending, refresh]);

  const checkerVerify = useCallback(async (id: string, utr: string, notes: string) => {
    const row = awaitingChecker.find((item) => item.id === id);
    if (!row?.paymentId) throw new Error('Payment is no longer pending verification.');
    await financeApi.verifyPayment(row.paymentId, { status: 'Completed', referenceNo: utr,
      checkerNotes: notes || undefined });
    await refresh(); return { ok: true };
  }, [awaitingChecker, refresh]);

  const checkerCancel = useCallback(async (id: string, reason: string) => {
    const row = awaitingChecker.find((item) => item.id === id);
    if (!row?.paymentId) throw new Error('Payment is no longer pending verification.');
    await financeApi.verifyPayment(row.paymentId, { status: 'Failed', checkerNotes: reason });
    await refresh();
  }, [awaitingChecker, refresh]);

  const value = useMemo<FinanceContext>(() => ({ pending, awaitingChecker, completed, failed,
    audit, overview, loading, error, refresh, makerSubmit, checkerVerify, checkerCancel,
  }), [pending, awaitingChecker, completed, failed, audit, overview, loading, error, refresh,
    makerSubmit, checkerVerify, checkerCancel]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useFinance() {
  const context = useContext(Context);
  if (!context) throw new Error('useFinance must be used within FinanceProvider');
  return context;
}
