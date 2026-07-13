"use client";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  initialPending,
  initialMakerEntered,
  completedHistory,
  initialFailed,
  initialAudit,
  CURRENT_MAKER,
  CURRENT_CHECKER,
  type Payout,
  type Completed,
  type FailedPayment,
  type AuditEvent,
} from "@/lib/finance-mock";

type Ctx = {
  pending: Payout[];             // status = CSRApproved
  awaitingChecker: Payout[];     // status = MakerEntered
  completed: Completed[];
  failed: FailedPayment[];
  audit: AuditEvent[];

  // Maker records UTR → moves to awaitingChecker
  makerSubmit: (ids: string[], utr: string) => void;

  // Checker verifies. If UTR matches → complete. If not → audit alert.
  checkerVerify: (id: string, utr: string, notes: string) => { ok: boolean; expected: string };
  checkerCancel: (id: string, reason: string) => void;

  // Reprocess a failed payment (moves back to pending)
  reprocessFailed: (id: string) => void;
  markStudentNotified: (id: string) => void;
};

const FinanceCtx = createContext<Ctx | null>(null);

let audSeq = 9100;
const nextAud = () => "AUD-" + audSeq++;

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Payout[]>(initialPending);
  const [awaitingChecker, setAwaitingChecker] = useState<Payout[]>(initialMakerEntered);
  const [completed, setCompleted] = useState<Completed[]>(completedHistory);
  const [failed, setFailed] = useState<FailedPayment[]>(initialFailed);
  const [audit, setAudit] = useState<AuditEvent[]>(initialAudit);

  const pushAudit = (e: Omit<AuditEvent, "id" | "ts"> & { ts?: string }) =>
    setAudit((prev) => [{ id: nextAud(), ts: e.ts ?? new Date().toISOString(), ...e }, ...prev]);

  const makerSubmit: Ctx["makerSubmit"] = (ids, utr) => {
    const now = new Date().toISOString();
    setPending((prev) => {
      const moving = prev.filter((p) => ids.includes(p.id));
      const rest = prev.filter((p) => !ids.includes(p.id));
      setAwaitingChecker((cur) => [
        ...moving.map((m) => ({
          ...m,
          status: "MakerEntered" as const,
          makerUtr: utr,
          makerName: CURRENT_MAKER,
          makerAt: now,
        })),
        ...cur,
      ]);
      moving.forEach((m) =>
        pushAudit({
          actor: CURRENT_MAKER,
          role: "Maker",
          action: "UTR recorded",
          target: m.id,
          meta: `₹${m.amount.toLocaleString("en-IN")} · ${utr}`,
        }),
      );
      return rest;
    });
  };

  const checkerVerify: Ctx["checkerVerify"] = (id, utr, notes) => {
    const row = awaitingChecker.find((p) => p.id === id);
    if (!row) return { ok: false, expected: "" };
    if (row.makerUtr !== utr) {
      pushAudit({
        actor: CURRENT_CHECKER,
        role: "Checker",
        action: "UTR mismatch — Admin alerted",
        target: id,
        meta: `Maker: ${row.makerUtr} · Checker: ${utr}`,
      });
      return { ok: false, expected: row.makerUtr ?? "" };
    }
    const now = new Date();
    setAwaitingChecker((prev) => prev.filter((p) => p.id !== id));
    setCompleted((prev) => [
      {
        txnId: utr,
        applicationId: row.applicationId,
        fullName: row.fullName,
        bankName: row.bankName,
        amount: row.amount,
        sponsor: row.sponsor,
        date: now.toISOString().slice(0, 10),
        maker: row.makerName ?? CURRENT_MAKER,
        checker: CURRENT_CHECKER,
      },
      ...prev,
    ]);
    pushAudit({
      actor: CURRENT_CHECKER,
      role: "Checker",
      action: "Payment verified & completed",
      target: row.applicationId,
      meta: `${utr}${notes ? ` · Note: ${notes}` : ""}`,
    });
    return { ok: true, expected: utr };
  };

  const checkerCancel: Ctx["checkerCancel"] = (id, reason) => {
    const row = awaitingChecker.find((p) => p.id === id);
    if (!row) return;
    setAwaitingChecker((prev) => prev.filter((p) => p.id !== id));
    setFailed((prev) => [
      {
        id: "FAIL-" + Math.floor(2100 + Math.random() * 900),
        applicationId: row.applicationId,
        fullName: row.fullName,
        amount: row.amount,
        bankName: row.bankName,
        sponsor: row.sponsor,
        reason: reason || "Cancelled by Checker",
        failedAt: new Date().toISOString().slice(0, 10),
        studentNotified: false,
        detailsUpdated: false,
      },
      ...prev,
    ]);
    pushAudit({
      actor: CURRENT_CHECKER,
      role: "Checker",
      action: "Payment cancelled by Checker",
      target: row.applicationId,
      meta: reason,
    });
  };

  const reprocessFailed: Ctx["reprocessFailed"] = (id) => {
    const row = failed.find((f) => f.id === id);
    if (!row) return;
    setFailed((prev) => prev.filter((f) => f.id !== id));
    setPending((prev) => [
      {
        id: "PYT-" + Math.floor(1100 + Math.random() * 900),
        applicationId: row.applicationId,
        fullName: row.fullName,
        amount: row.amount,
        bankName: row.bankName,
        accountNumber: "XXXXXXXXX (updated)",
        ifsc: "UPDATED",
        aadhaarLinked: "Yes",
        sponsor: row.sponsor,
        approvedAt: new Date().toISOString().slice(0, 10),
        status: "CSRApproved",
      },
      ...prev,
    ]);
    pushAudit({
      actor: CURRENT_MAKER,
      role: "Maker",
      action: "Failed payment re-queued for re-processing",
      target: row.applicationId,
    });
  };

  const markStudentNotified: Ctx["markStudentNotified"] = (id) => {
    setFailed((prev) => prev.map((f) => (f.id === id ? { ...f, studentNotified: true } : f)));
    pushAudit({
      actor: "System",
      role: "System",
      action: "Student notified to update bank details",
      target: id,
    });
  };

  const value = useMemo<Ctx>(
    () => ({
      pending,
      awaitingChecker,
      completed,
      failed,
      audit,
      makerSubmit,
      checkerVerify,
      checkerCancel,
      reprocessFailed,
      markStudentNotified,
    }),
    [pending, awaitingChecker, completed, failed, audit],
  );

  return <FinanceCtx.Provider value={value}>{children}</FinanceCtx.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceCtx);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
}
