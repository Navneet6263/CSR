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
  pendingTotal: number; awaitingCheckerTotal: number; completedTotal: number; failedTotal: number; auditTotal: number;
  loadPendingPage: (page: number, limit: number, search?: string) => Promise<void>;
  loadCheckerPage: (page: number, limit: number, search?: string) => Promise<void>;
  loadCompletedPage: (page: number, limit: number, search?: string) => Promise<void>;
  loadFailedPage: (page: number, limit: number, search?: string) => Promise<void>;
  loadAuditPage: (page: number, limit: number, search?: string) => Promise<void>;
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

export function mapCompleted(row: Record<string, unknown>): CompletedPayment {
  return {
    txnId: text(row.ReferenceNo), applicationId: `APP-${text(row.ApplicationID)}`,
    fullName: text(row.StudentName, 'Applicant'), bankName: text(row.BankName), amount: number(row.Amount),
    sponsor: text(row.SponsorName), date: text(row.UpdatedAt).slice(0, 10),
    maker: text(row.MakerName, 'Maker'), checker: text(row.CheckerName, 'Checker'),
  };
}

export function mapFailed(row: Record<string, unknown>): FailedPayment {
  return {
    id: `PAY-${text(row.PaymentID)}`, paymentId: number(row.PaymentID),
    applicationId: `APP-${text(row.ApplicationID)}`, fullName: text(row.StudentName, 'Applicant'),
    amount: number(row.Amount), bankName: text(row.BankName), sponsor: text(row.SponsorName),
    reason: text(row.CheckerNotes, 'Payment failed'), failedAt: text(row.UpdatedAt).slice(0, 10),
    studentNotified: true,
    detailsUpdated: Boolean(row.StudentUpdatedAt && new Date(text(row.StudentUpdatedAt)).getTime() > new Date(text(row.UpdatedAt)).getTime()),
  };
}

export function mapAudit(row: Record<string, unknown>): AuditEvent {
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
  const [pendingTotal, setPendingTotal] = useState(0); const [awaitingCheckerTotal, setAwaitingCheckerTotal] = useState(0);
  const [completedTotal, setCompletedTotal] = useState(0); const [failedTotal, setFailedTotal] = useState(0); const [auditTotal, setAuditTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setError('');
    try {
      const financeFunction = authApi.getUser()?.financeFunction;
      const makerQueue = financeFunction === 'Maker'
        ? financeApi.getPendingInitiation('page=1&limit=12') : Promise.resolve({ data: { payments: [] as PaymentQueueRow[], pagination: { page: 1, limit: 12, total: 0 } } });
      const checkerQueue = financeFunction === 'Checker'
        ? financeApi.getPendingVerifications('page=1&limit=12') : Promise.resolve({ data: { payments: [] as PendingPaymentRow[], pagination: { page: 1, limit: 12, total: 0 } } });
      const [summary, initiation, verification, done, failedRows, auditRows] = await Promise.all([
        financeApi.getOverview(),
        makerQueue, checkerQueue,
        financeApi.getHistory('completed', 'page=1&limit=12'), financeApi.getHistory('failed', 'page=1&limit=12'), financeApi.getAudit('page=1&limit=12'),
      ]);
      setOverview(summary.data ?? emptyOverview);
      setPending((initiation.data?.payments ?? []).map(mapInitiation));
      setAwaitingChecker((verification.data?.payments ?? []).map(mapVerification));
      setPendingTotal(initiation.data?.pagination?.total ?? 0); setAwaitingCheckerTotal(verification.data?.pagination?.total ?? 0);
      setCompleted((done.data?.payments ?? []).map(mapCompleted));
      setFailed((failedRows.data?.payments ?? []).map(mapFailed));
      setAudit((auditRows.data?.events ?? []).map(mapAudit));
      setCompletedTotal(done.data?.pagination?.total ?? 0); setFailedTotal(failedRows.data?.pagination?.total ?? 0); setAuditTotal(auditRows.data?.pagination?.total ?? 0);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Finance data could not be loaded.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const loadPendingPage = useCallback(async (page: number, limit: number, search = '') => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) }); if (search) params.set('search', search);
    const response = await financeApi.getPendingInitiation(params.toString()); setPending((response.data?.payments ?? []).map(mapInitiation)); setPendingTotal(response.data?.pagination?.total ?? 0);
  }, []);
  const loadCheckerPage = useCallback(async (page: number, limit: number, search = '') => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) }); if (search) params.set('search', search);
    const response = await financeApi.getPendingVerifications(params.toString()); setAwaitingChecker((response.data?.payments ?? []).map(mapVerification)); setAwaitingCheckerTotal(response.data?.pagination?.total ?? 0);
  }, []);
  const loadCompletedPage = useCallback(async (page: number, limit: number, search = '') => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) }); if (search) params.set('search', search);
    const response = await financeApi.getHistory('completed', params.toString()); setCompleted((response.data?.payments ?? []).map(mapCompleted)); setCompletedTotal(response.data?.pagination?.total ?? 0);
  }, []);
  const loadFailedPage = useCallback(async (page: number, limit: number, search = '') => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) }); if (search) params.set('search', search);
    const response = await financeApi.getHistory('failed', params.toString()); setFailed((response.data?.payments ?? []).map(mapFailed)); setFailedTotal(response.data?.pagination?.total ?? 0);
  }, []);
  const loadAuditPage = useCallback(async (page: number, limit: number, search = '') => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) }); if (search) params.set('search', search);
    const response = await financeApi.getAudit(params.toString()); setAudit((response.data?.events ?? []).map(mapAudit)); setAuditTotal(response.data?.pagination?.total ?? 0);
  }, []);

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
    audit, overview, loading, error, pendingTotal, awaitingCheckerTotal, completedTotal, failedTotal, auditTotal,
    loadPendingPage, loadCheckerPage, loadCompletedPage, loadFailedPage, loadAuditPage,
    refresh, makerSubmit, checkerVerify, checkerCancel,
  }), [pending, awaitingChecker, completed, failed, audit, overview, loading, error, refresh,
    pendingTotal, awaitingCheckerTotal, completedTotal, failedTotal, auditTotal, loadPendingPage, loadCheckerPage,
    loadCompletedPage, loadFailedPage, loadAuditPage, makerSubmit, checkerVerify, checkerCancel]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useFinance() {
  const context = useContext(Context);
  if (!context) throw new Error('useFinance must be used within FinanceProvider');
  return context;
}
