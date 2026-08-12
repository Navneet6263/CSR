"use client";
import { useState } from "react";
import { CheckCircle2, AlertTriangle, XOctagon } from "lucide-react";
import { inr, type Payout } from "@/types/finance";
import { useFinance } from "@/lib/store/finance-store";
import { FinanceModalShell } from "./FinanceModalShell";
const UTR_RE = /^[A-Z0-9]{22}$/;
export function CheckerModal({ row, onClose }: { row: Payout; onClose: () => void }) {
  const { checkerVerify, checkerCancel } = useFinance();
  const [utr, setUtr] = useState("");
  const [notes, setNotes] = useState("");
  const [mismatch, setMismatch] = useState(false);
  const [done, setDone] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const valid = UTR_RE.test(utr);
  const verify = async () => {
    setError(''); setMismatch(false);
    try { await checkerVerify(row.id, utr, notes); setDone(true); }
    catch (reason) { setMismatch(true); setError(reason instanceof Error ? reason.message : 'Verification failed.'); }
  };
  const doCancel = async () => {
    setError('');
    try { await checkerCancel(row.id, reason || "Cancelled by Checker"); onClose(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Payment could not be cancelled.'); }
  };
  return (
    <FinanceModalShell
      onClose={onClose}
      title={done ? "Verified" : cancelling ? "Cancel Payment" : "Independent Verification — Checker"}
    >
        {done ? (
          <div className="p-6 text-center sm:p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-50 text-success-700">
              <CheckCircle2 size={40} />
            </div>
            <div className="mt-4 font-display text-2xl font-bold text-navy-900">Payment completed</div>
            <div className="mt-1 text-sm text-navy-500">
              {inr(row.amount)} · {row.fullName}. Student has been notified.
            </div>
            <div className="mt-5 rounded-xl border border-success-500/30 bg-success-50 p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-success-700">
                Transaction / UTR
              </div>
              <div className="mt-1 break-all font-mono text-base font-bold text-navy-900">{utr}</div>
            </div>
            <button
              onClick={onClose}
              className="mt-5 w-full rounded-xl bg-navy-900 px-5 py-3 font-semibold text-white transition hover:bg-navy-700"
            >
              Done
            </button>
          </div>
        ) : cancelling ? (
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-3 rounded-xl border border-red-500/40 bg-red-50 p-4">
              <XOctagon size={22} className="mt-0.5 shrink-0 text-red-700" />
              <div className="text-sm text-navy-900">
                Cancelling will move <span className="font-bold">{row.fullName}</span>'s payment of{" "}
                <span className="font-display font-bold">{inr(row.amount)}</span> to the Failed queue for re-processing.
              </div>
            </div>
            <label className="mt-4 block">
              <div className="mb-1.5 text-xs font-bold uppercase tracking-widest text-navy-700">Reason</div>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Bank return, wrong beneficiary account"
                className="w-full rounded-xl border-2 border-navy-100 bg-white px-4 py-3 text-sm text-navy-900 outline-none transition focus:border-navy-900 focus:ring-2 focus:ring-navy-100"
                rows={3}
              />
            </label>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => setCancelling(false)}
                className="rounded-xl border border-navy-100 px-5 py-3 font-semibold text-navy-700 hover:bg-navy-50 sm:flex-1"
              >
                Back
              </button>
              <button
                onClick={doCancel}
                className="rounded-xl bg-red-600 px-5 py-3 font-display font-bold text-white shadow-lg transition hover:bg-red-700 sm:flex-[2]"
              >
                Cancel Payment
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-6">
            <div className="text-xs font-bold uppercase tracking-widest text-navy-500">Awaiting your verification</div>
            <div className="mt-1 font-display text-xl font-bold text-navy-900 sm:text-2xl">{row.fullName}</div>
            <div className="text-sm font-medium text-navy-500">
              {row.applicationId} · {row.sponsor}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Info label="Amount" value={inr(row.amount)} bold />
              <Info label="Bank" value={row.bankName} />
              <Info label="Account" value={`•••• ${row.accountNumber.slice(-4)}`} mono />
              <Info label="Maker" value={row.makerName ?? "—"} />
            </div>
            <div className="mt-5 rounded-xl border border-navy-100 bg-navy-50/60 p-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-navy-500">
                Verify against bank statement
              </div>
              <div className="mt-1 text-xs text-navy-700">
                Re-enter the UTR from your bank records. It must match what the Maker recorded — you
                cannot see the Maker's UTR.
              </div>
            </div>

            <label className="mt-4 block">
              <div className="mb-1.5 text-xs font-bold uppercase tracking-widest text-navy-700">
                UTR (from bank statement)
              </div>
              <input
                value={utr}
                onChange={(e) => {
                  setMismatch(false);
                  setUtr(e.target.value.toUpperCase().replace(/\s/g, ""));
                }}
                placeholder="Type UTR exactly as it appears"
                maxLength={22}
                className={`w-full rounded-xl border-2 bg-white px-4 py-3 font-mono text-sm tracking-wide text-navy-900 outline-none transition focus:ring-2 sm:text-base ${
                  mismatch
                    ? "border-red-500 focus:ring-red-200"
                    : "border-navy-100 focus:border-navy-900 focus:ring-navy-100"
                }`}
              />
              <div className="mt-1 flex justify-between text-[11px]">
                <span className="text-navy-500">22 characters · alphanumeric</span>
                <span className="font-mono text-navy-500">{utr.length}/22</span>
              </div>
            </label>

            {mismatch ? (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-50 p-3 text-sm text-red-800">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold">UTR mismatch</div>
                  <div className="text-xs">
                    {error || "Your entry does not match the Maker's independently recorded UTR."}
                  </div>
                </div>
              </div>
            ) : null}

            <label className="mt-4 block">
              <div className="mb-1.5 text-xs font-bold uppercase tracking-widest text-navy-700">
                Checker notes (optional)
              </div>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Verified against SBI statement page 4"
                className="w-full rounded-xl border-2 border-navy-100 bg-white px-4 py-2.5 text-sm text-navy-900 outline-none focus:border-navy-900 focus:ring-2 focus:ring-navy-100"
              />
            </label>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => setCancelling(true)}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 sm:flex-1"
              >
                Cancel Payment
              </button>
              <button
                disabled={!valid}
                onClick={verify}
                className="rounded-xl bg-success-500 px-5 py-3 font-display font-bold text-white shadow-lg transition hover:bg-success-700 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-[2]"
              >
                Verify & Complete
              </button>
            </div>
          </div>
        )}
    </FinanceModalShell>
  );
}

function Info({ label, value, mono, bold }: { label: string; value: string; mono?: boolean; bold?: boolean }) {
  return (
    <div className="rounded-xl border border-navy-100 bg-white p-3">
      <div className="text-[10px] font-bold uppercase tracking-widest text-navy-500">{label}</div>
      <div className={`mt-1 truncate text-navy-900 ${mono ? "font-mono" : ""} ${bold ? "font-display text-lg font-bold" : "text-sm font-semibold"}`}>
        {value}
      </div>
    </div>
  );
}
