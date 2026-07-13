"use client";
import { useState } from "react";
import { X, Landmark, Building2, Fingerprint, ShieldCheck, Send, AlertTriangle } from "lucide-react";
import { inr, type Payout } from "@/lib/finance-mock";
import { useFinance } from "@/lib/store/finance-store";

// UTR: 22 alphanumeric characters (RBI standard for NEFT/RTGS/IMPS reference)
const UTR_RE = /^[A-Z0-9]{22}$/;

export function MakerModal({
  rows,
  onClose,
}: {
  rows: Payout[];
  onClose: () => void;
}) {
  const { makerSubmit } = useFinance();
  const [utr, setUtr] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  const total = rows.reduce((s, r) => s + r.amount, 0);
  const batch = rows.length > 1;
  const valid = UTR_RE.test(utr);
  const err = utr.length > 0 && !valid;

  const submit = () => {
    makerSubmit(rows.map((r) => r.id), utr);
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-t-2xl border border-navy-100 bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between bg-navy-900 px-5 py-3 text-white sm:px-6 sm:py-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} />
            <span className="text-xs font-semibold uppercase tracking-widest sm:text-sm">
              {done ? "Recorded" : batch ? "Batch UTR Entry — Maker" : "Record Payment — Maker"}
            </span>
          </div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-white/10" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {done ? (
          <div className="p-6 text-center sm:p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-50 text-success-700">
              <ShieldCheck size={30} />
            </div>
            <div className="mt-3 font-display text-xl font-bold text-navy-900 sm:text-2xl">
              UTR recorded
            </div>
            <div className="mt-1 text-sm text-navy-500">
              {rows.length} payment{rows.length === 1 ? "" : "s"} moved to Checker queue for verification.
            </div>
            <div className="mt-4 rounded-xl border border-navy-100 bg-navy-50/60 p-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-navy-500">UTR</div>
              <div className="mt-1 break-all font-mono text-sm font-bold text-navy-900">{utr}</div>
            </div>
            <button
              onClick={onClose}
              className="mt-5 w-full rounded-xl bg-navy-900 px-5 py-3 font-semibold text-white transition hover:bg-navy-700"
            >
              Done
            </button>
          </div>
        ) : confirming ? (
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-50 p-4">
              <AlertTriangle size={22} className="mt-0.5 shrink-0 text-amber-700" />
              <div className="min-w-0 text-sm text-navy-900">
                You are recording{" "}
                <span className="font-display font-bold">{inr(total)}</span> across{" "}
                <span className="font-bold">{rows.length}</span> beneficiar
                {rows.length === 1 ? "y" : "ies"} with UTR{" "}
                <span className="break-all font-mono font-bold">{utr}</span>. Once submitted this
                cannot be edited — only the Checker can cancel.
              </div>
            </div>
            <div className="mt-4 max-h-40 overflow-y-auto rounded-xl border border-navy-100">
              {rows.map((r) => (
                <div key={r.id} className="flex items-center justify-between border-b border-navy-100 px-4 py-2 text-sm last:border-0">
                  <span className="truncate font-semibold text-navy-900">{r.fullName}</span>
                  <span className="ml-3 shrink-0 font-mono text-navy-700">{inr(r.amount)}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => setConfirming(false)}
                className="rounded-xl border border-navy-100 px-5 py-3 font-semibold text-navy-700 hover:bg-navy-50 sm:flex-1"
              >
                Back
              </button>
              <button
                onClick={submit}
                className="rounded-xl bg-success-500 px-5 py-3 font-display font-bold text-white shadow-lg transition hover:bg-success-700 sm:flex-[2]"
              >
                Confirm & Record
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-6">
            <div className="text-xs font-bold uppercase tracking-widest text-navy-500">
              {batch ? `${rows.length} beneficiaries · ${inr(total)}` : "Beneficiary"}
            </div>
            {!batch ? (
              <>
                <div className="mt-1 font-display text-xl font-bold text-navy-900 sm:text-2xl">
                  {rows[0].fullName}
                </div>
                <div className="text-sm font-medium text-navy-500">Application {rows[0].applicationId}</div>
                <div className="mt-4 rounded-xl border-2 border-dashed border-navy-100 bg-navy-50/40 p-4 sm:p-5">
                  <Row icon={Landmark} label="Bank" value={rows[0].bankName} />
                  <Row icon={Building2} label="Account" value={rows[0].accountNumber} mono />
                  <Row icon={Building2} label="IFSC" value={rows[0].ifsc} mono />
                  <Row icon={Fingerprint} label="Aadhaar" value={rows[0].aadhaarLinked} pill={rows[0].aadhaarLinked === "Yes" ? "success" : "warn"} />
                  <Row icon={Landmark} label="Sponsor" value={rows[0].sponsor} />
                </div>
              </>
            ) : (
              <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-navy-100">
                {rows.map((r) => (
                  <div key={r.id} className="flex items-center justify-between border-b border-navy-100 px-4 py-2 text-sm last:border-0">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-navy-900">{r.fullName}</div>
                      <div className="truncate text-xs text-navy-500">{r.bankName} · {r.sponsor}</div>
                    </div>
                    <div className="ml-3 shrink-0 font-mono text-sm text-navy-700">{inr(r.amount)}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 flex items-end justify-between rounded-xl bg-navy-900 px-4 py-3 text-white sm:px-5 sm:py-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/60">Amount to record</div>
                <div className="font-display text-2xl font-bold sm:text-3xl">{inr(total)}</div>
              </div>
              <div className="text-right text-[10px] font-semibold uppercase tracking-widest text-white/60">
                NEFT / RTGS
              </div>
            </div>

            <label className="mt-5 block">
              <div className="mb-1.5 text-xs font-bold uppercase tracking-widest text-navy-700">
                UTR / Reference No.
              </div>
              <input
                value={utr}
                onChange={(e) => setUtr(e.target.value.toUpperCase().replace(/\s/g, ""))}
                placeholder="e.g. SBIN026070900000123456"
                maxLength={22}
                className={`w-full rounded-xl border-2 bg-white px-4 py-3 font-mono text-sm tracking-wide text-navy-900 outline-none transition focus:ring-2 sm:text-base ${
                  err ? "border-red-500 focus:ring-red-200" : "border-navy-100 focus:border-navy-900 focus:ring-navy-100"
                }`}
                aria-invalid={err}
              />
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className={err ? "font-semibold text-red-600" : "text-navy-500"}>
                  {err
                    ? "UTR must be exactly 22 alphanumeric characters"
                    : "22 characters · letters & digits only"}
                </span>
                <span className={`font-mono ${utr.length === 22 ? "text-success-700" : "text-navy-500"}`}>
                  {utr.length}/22
                </span>
              </div>
            </label>

            <button
              disabled={!valid}
              onClick={() => setConfirming(true)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 py-3.5 font-display text-base font-bold text-white shadow-lg transition hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-40 sm:text-lg"
            >
              <Send size={18} /> Record & Send to Checker
            </button>
            <p className="mt-2 text-center text-[11px] font-medium text-navy-500">
              Requires independent Checker verification before completion.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  icon: Icon, label, value, mono, pill,
}: { icon: typeof Building2; label: string; value: string; mono?: boolean; pill?: "success" | "warn" }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-navy-100/70 py-2 last:border-0">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-navy-500">
        <Icon size={14} /> {label}
      </div>
      {pill ? (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${pill === "success" ? "bg-success-500 text-white" : "bg-amber-500 text-white"}`}>
          {value}
        </span>
      ) : (
        <div className={`min-w-0 truncate text-right text-navy-900 ${mono ? "font-mono text-sm font-bold" : "text-sm font-semibold"}`}>
          {value}
        </div>
      )}
    </div>
  );
}


