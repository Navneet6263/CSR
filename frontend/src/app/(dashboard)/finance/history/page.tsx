"use client";

import { CheckCircle2, Download, Receipt } from "lucide-react";
import { inr } from "@/types/finance";
import { useFinance } from "@/lib/store/finance-store";
import { formatFinanceDate } from "@/lib/financeFormat";



export default function () {
  const { completed } = useFinance();
  const total = completed.reduce((s, r) => s + r.amount, 0);

  const exportCsv = () => {
    const header = ["Txn ID / UTR", "Application", "Beneficiary", "Bank", "Sponsor", "Amount", "Date", "Maker", "Checker"];
    const lines = completed.map((r) =>
      [r.txnId, r.applicationId, r.fullName, r.bankName, r.sponsor, r.amount, r.date, r.maker, r.checker]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finance-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadReceipt = (txnId: string) => {
    const r = completed.find((c) => c.txnId === txnId);
    if (!r) return;
    const html = `<!doctype html><meta charset="utf-8"><title>Receipt ${r.txnId}</title>
      <style>body{font-family:system-ui;padding:40px;color:#0f172a}h1{color:#1e293b}
      .card{border:2px solid #0f172a;border-radius:16px;padding:24px;max-width:520px}
      .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0}
      .row:last-child{border:0}.k{color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.08em}
      .v{font-weight:700}.amt{font-size:32px;font-weight:800;color:#0f172a;margin:8px 0 24px}</style>
      <div class="card"><h1>TalentBridge · Payment Receipt</h1>
      <div class="amt">${inr(r.amount)}</div>
      <div class="row"><span class="k">Transaction / UTR</span><span class="v" style="font-family:monospace">${r.txnId}</span></div>
      <div class="row"><span class="k">Beneficiary</span><span class="v">${r.fullName}</span></div>
      <div class="row"><span class="k">Application</span><span class="v">${r.applicationId}</span></div>
      <div class="row"><span class="k">Bank</span><span class="v">${r.bankName}</span></div>
      <div class="row"><span class="k">Sponsor</span><span class="v">${r.sponsor}</span></div>
      <div class="row"><span class="k">Date</span><span class="v">${formatFinanceDate(r.date)}</span></div>
      <div class="row"><span class="k">Maker</span><span class="v">${r.maker}</span></div>
      <div class="row"><span class="k">Checker</span><span class="v">${r.checker}</span></div>
      </div>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 300); }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-widest text-navy-500">Records</div>
          <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Transaction History</h1>
          <p className="mt-1 text-xs text-navy-500 sm:text-sm">
            {completed.length} completed transfers · {inr(total)} disbursed
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-navy-100 bg-white px-3 py-2 text-xs font-semibold text-navy-700 hover:bg-navy-50 sm:px-4 sm:text-sm"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-navy-100 bg-white shadow-sm md:block">
        <table className="min-w-[850px] text-left">
          <thead className="bg-navy-50/60 text-[10px] font-bold uppercase tracking-widest text-navy-500">
            <tr>
              <th className="px-4 py-3">Txn / UTR</th>
              <th className="px-4 py-3">Beneficiary</th>
              <th className="px-4 py-3">Bank</th>
              <th className="px-4 py-3">Sponsor</th>
              <th className="px-4 py-3">Maker / Checker</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-right">Receipt</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {completed.map((r) => (
              <tr key={r.txnId} className="border-t border-navy-100 hover:bg-navy-50/40">
                <td className="px-4 py-3">
                  <div className="break-all font-mono text-xs font-bold text-navy-900">{r.txnId}</div>
                  <div className="text-[10px] text-navy-500">{r.applicationId}</div>
                </td>
                <td className="px-4 py-3 font-semibold text-navy-900">{r.fullName}</td>
                <td className="px-4 py-3 text-xs text-navy-700">{r.bankName}</td>
                <td className="px-4 py-3 text-xs text-navy-700">{r.sponsor}</td>
                <td className="px-4 py-3 text-xs text-navy-700">
                  <div>{r.maker}</div>
                  <div className="text-navy-500">✓ {r.checker}</div>
                </td>
                <td className="px-4 py-3 text-xs text-navy-700">{formatFinanceDate(r.date)}</td>
                <td className="px-4 py-3 text-right font-display font-bold text-navy-900">{inr(r.amount)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => downloadReceipt(r.txnId)}
                    className="inline-flex items-center gap-1 rounded-lg border border-navy-100 bg-white px-2 py-1.5 text-[11px] font-bold text-navy-700 hover:bg-navy-50"
                  >
                    <Receipt size={12} /> PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="grid gap-3 md:hidden">
        {completed.map((r) => (
          <div key={r.txnId} className="rounded-xl border border-navy-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-semibold text-navy-900">{r.fullName}</div>
                <div className="truncate text-xs text-navy-500">{r.applicationId} · {r.sponsor}</div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-[10px] font-bold text-success-700">
                <CheckCircle2 size={10} /> DONE
              </span>
            </div>
            <div className="mt-2 break-all rounded-lg bg-navy-50/60 p-2 font-mono text-[11px] font-bold text-navy-900">
              {r.txnId}
            </div>
            <div className="mt-2 flex items-end justify-between">
              <div className="text-[10px] text-navy-500">
                {r.bankName} · {formatFinanceDate(r.date)}<br />
                {r.maker} → ✓ {r.checker}
              </div>
              <div className="font-display text-lg font-bold text-navy-900">{inr(r.amount)}</div>
            </div>
            <button
              onClick={() => downloadReceipt(r.txnId)}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-navy-100 py-2 text-xs font-bold text-navy-700 hover:bg-navy-50"
            >
              <Receipt size={14} /> Download receipt
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}



