"use client";

import { useMemo, useState } from "react";
import { Send, ArrowDownAZ, Filter } from "lucide-react";
import { MakerModal } from "@/components/finance/MakerModal";
import { inr, daysBetween, type Payout, type Sponsor } from "@/lib/finance-mock";
import { useFinance } from "@/lib/store/finance-store";



const SPONSORS: (Sponsor | "All")[] = ["All", "ITC Foundation", "HDFC CSR", "Tata Trusts", "Infosys Foundation", "Wipro Cares"];

export default function () {
  const { pending } = useFinance();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [modalRows, setModalRows] = useState<Payout[] | null>(null);
  const [sponsor, setSponsor] = useState<Sponsor | "All">("All");
  const [sortNewest, setSortNewest] = useState(false); // default = oldest first (priority)

  const rows = useMemo(() => {
    const filtered = sponsor === "All" ? pending : pending.filter((p) => p.sponsor === sponsor);
    return [...filtered].sort((a, b) => {
      const da = daysBetween(a.approvedAt);
      const db = daysBetween(b.approvedAt);
      return sortNewest ? da - db : db - da;
    });
  }, [pending, sponsor, sortNewest]);

  const totalAmount = rows.reduce((s, r) => s + r.amount, 0);
  const selectedRows = rows.filter((r) => selected.has(r.id));
  const selectedAmount = selectedRows.reduce((s, r) => s + r.amount, 0);
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-widest text-navy-500">Step 1 · Maker</div>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Pending Payouts</h1>
        <p className="mt-1 text-xs text-navy-500 sm:text-sm">
          Transfer via bank portal, then record the UTR here. Checker will independently verify.
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="Queued" value={String(rows.length)} />
        <SummaryCard label="Total amount" value={inr(totalAmount)} />
        <SummaryCard label="Selected" value={String(selected.size)} highlight={selected.size > 0} />
        <SummaryCard label="Batch amount" value={inr(selectedAmount)} highlight={selected.size > 0} />
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-navy-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-xs font-semibold text-navy-700">
            <Filter size={14} /> Sponsor
          </label>
          <select
            value={sponsor}
            onChange={(e) => setSponsor(e.target.value as Sponsor | "All")}
            className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm font-semibold text-navy-900"
          >
            {SPONSORS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            onClick={() => setSortNewest((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-navy-100 bg-white px-3 py-2 text-xs font-semibold text-navy-700 hover:bg-navy-50"
          >
            <ArrowDownAZ size={14} />
            {sortNewest ? "Newest first" : "Oldest first (priority)"}
          </button>
        </div>
        <button
          disabled={selected.size === 0}
          onClick={() => setModalRows(selectedRows)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-success-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-success-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={14} /> Batch Record UTR ({selected.size})
        </button>
      </div>

      {/* Table (desktop) + cards (mobile) */}
      <div className="hidden overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm md:block">
        <table className="min-w-full text-left">
          <thead className="bg-navy-50/60 text-[10px] font-bold uppercase tracking-widest text-navy-500">
            <tr>
              <th className="px-4 py-3">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 accent-navy-900" />
              </th>
              <th className="px-3 py-3">Payout ID</th>
              <th className="px-3 py-3">Student</th>
              <th className="px-3 py-3">Sponsor</th>
              <th className="px-3 py-3">Bank</th>
              <th className="px-3 py-3 text-center">Days</th>
              <th className="px-3 py-3 text-right">Amount</th>
              <th className="px-3 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {rows.length === 0 ? (
              <tr><td colSpan={8} className="px-6 py-12 text-center text-navy-500">🎉 Queue cleared.</td></tr>
            ) : rows.map((p) => {
              const days = daysBetween(p.approvedAt);
              const urgent = days >= 7;
              return (
                <tr key={p.id} className={`border-t border-navy-100 hover:bg-navy-50/40 ${selected.has(p.id) ? "bg-navy-50/60" : ""}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} className="h-4 w-4 accent-navy-900" />
                  </td>
                  <td className="px-3 py-3 font-mono text-xs font-bold text-navy-700">{p.id}</td>
                  <td className="px-3 py-3">
                    <div className="font-semibold text-navy-900">{p.fullName}</div>
                    <div className="text-xs text-navy-500">{p.applicationId}</div>
                  </td>
                  <td className="px-3 py-3 text-xs font-semibold text-navy-700">{p.sponsor}</td>
                  <td className="px-3 py-3">
                    <div className="font-medium text-navy-900">{p.bankName}</div>
                    <div className="font-mono text-xs text-navy-500">•••• {p.accountNumber.slice(-4)}</div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${urgent ? "bg-red-100 text-red-700" : "bg-navy-50 text-navy-700"}`}>
                      {days}d
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right font-display text-base font-bold text-navy-900">{inr(p.amount)}</td>
                  <td className="px-3 py-3 text-right">
                    <button
                      onClick={() => setModalRows([p])}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white hover:bg-navy-700"
                    >
                      <Send size={12} /> Record UTR
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="grid gap-3 md:hidden">
        {rows.map((p) => {
          const days = daysBetween(p.approvedAt);
          const urgent = days >= 7;
          return (
            <div key={p.id} className={`rounded-xl border bg-white p-4 shadow-sm ${selected.has(p.id) ? "border-navy-900" : "border-navy-100"}`}>
              <div className="flex items-start justify-between gap-3">
                <label className="flex min-w-0 flex-1 items-start gap-2">
                  <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} className="mt-1 h-4 w-4 shrink-0 accent-navy-900" />
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-navy-900">{p.fullName}</div>
                    <div className="truncate text-xs text-navy-500">{p.applicationId} · {p.sponsor}</div>
                  </div>
                </label>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${urgent ? "bg-red-100 text-red-700" : "bg-navy-50 text-navy-700"}`}>{days}d</span>
              </div>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-navy-500">{p.bankName}</div>
                  <div className="font-mono text-xs text-navy-700">•••• {p.accountNumber.slice(-4)}</div>
                </div>
                <div className="font-display text-lg font-bold text-navy-900">{inr(p.amount)}</div>
              </div>
              <button
                onClick={() => setModalRows([p])}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-navy-900 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-navy-700"
              >
                <Send size={14} /> Record UTR
              </button>
            </div>
          );
        })}
        {rows.length === 0 ? (
          <div className="rounded-xl border border-navy-100 bg-white py-10 text-center text-sm text-navy-500">🎉 Queue cleared.</div>
        ) : null}
      </div>

      {modalRows ? (
        <MakerModal
          rows={modalRows}
          onClose={() => {
            setModalRows(null);
            setSelected(new Set());
          }}
        />
      ) : null}
    </div>
  );
}

function SummaryCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 sm:p-4 ${highlight ? "border-success-500 bg-success-50" : "border-navy-100 bg-white"}`}>
      <div className="text-[10px] font-bold uppercase tracking-widest text-navy-500">{label}</div>
      <div className="mt-1 font-display text-base font-bold text-navy-900 sm:text-lg">{value}</div>
    </div>
  );
}



