"use client";

import { AlertOctagon, RefreshCw, MailCheck } from "lucide-react";
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { inr } from "@/types/finance";
import { useFinance } from "@/lib/store/finance-store";
import { formatFinanceDate } from "@/lib/financeFormat";



export default function FailedPaymentsPage() {
  const { failed } = useFinance();
  const user = authApi.getUser();
  const total = failed.reduce((s, f) => s + f.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-widest text-red-600">Attention needed</div>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Failed Payments</h1>
        <p className="mt-1 text-xs text-navy-500 sm:text-sm">
          Bank returns and rejected transfers. Notify student, wait for updated details, then re-process.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-red-700">Failed count</div>
          <div className="mt-1 font-display text-xl font-bold text-navy-900">{failed.length}</div>
        </div>
        <div className="rounded-xl border border-navy-100 bg-white p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-navy-500">Total value</div>
          <div className="mt-1 font-display text-xl font-bold text-navy-900">{inr(total)}</div>
        </div>
        <div className="col-span-2 rounded-xl border border-navy-100 bg-white p-4 sm:col-span-1">
          <div className="text-[10px] font-bold uppercase tracking-widest text-navy-500">Ready to re-process</div>
          <div className="mt-1 font-display text-xl font-bold text-navy-900">
            {failed.filter((f) => f.detailsUpdated).length}
          </div>
        </div>
      </div>

      {failed.length === 0 ? (
        <div className="rounded-2xl border border-navy-100 bg-white py-16 text-center">
          <AlertOctagon size={40} className="mx-auto text-success-500" />
          <div className="mt-3 font-display text-lg font-bold text-navy-900">No failed payments</div>
        </div>
      ) : (
        <div className="grid gap-3">
          {failed.map((f) => (
            <div key={f.id} className="rounded-2xl border border-red-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700">
                      FAILED
                    </span>
                    <span className="font-mono text-[11px] font-bold text-navy-500">{f.id}</span>
                    <span className="text-[11px] text-navy-500">{formatFinanceDate(f.failedAt)}</span>
                  </div>
                  <div className="mt-2 font-display text-lg font-bold text-navy-900">{f.fullName}</div>
                  <div className="text-xs text-navy-500">{f.applicationId} · {f.sponsor} · {f.bankName}</div>
                  <div className="mt-2 rounded-lg border border-red-100 bg-red-50/60 p-2.5 text-xs text-red-800">
                    <span className="font-bold">Reason: </span>{f.reason}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold ${f.studentNotified ? "bg-success-50 text-success-700" : "bg-amber-100 text-amber-800"}`}>
                      <MailCheck size={12} />
                      {f.studentNotified ? "In-app update queued" : "Update not queued"}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold ${f.detailsUpdated ? "bg-success-50 text-success-700" : "bg-navy-50 text-navy-700"}`}>
                      {f.detailsUpdated ? "Bank details updated" : "Awaiting student update"}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
                  <div className="font-display text-2xl font-bold text-navy-900">{inr(f.amount)}</div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    {user?.financeFunction === 'Maker' ? (f.detailsUpdated ? (
                      <Link href="/finance/pending" className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-success-500 px-3 py-2 text-xs font-bold text-white hover:bg-success-700">
                        <RefreshCw size={14} /> Re-process
                      </Link>
                    ) : (
                      <span className="cursor-not-allowed rounded-lg bg-navy-50 px-3 py-2 text-[10px] font-bold text-navy-500" title="Waiting for student to update bank details">
                        Awaiting bank update
                      </span>
                    )) : <span className="rounded-lg bg-navy-50 px-3 py-2 text-[10px] font-bold text-navy-600">Maker re-process required</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



