"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Search, Clock } from "lucide-react";
import { CheckerModal } from "@/components/finance/CheckerModal";
import { inr, type Payout } from "@/types/finance";
import { useFinance } from "@/lib/store/finance-store";
import { formatFinanceDateTime } from "@/lib/financeFormat";
import DataPagination from '@/components/shared/DataPagination';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';



export default function () {
  const { awaitingChecker, awaitingCheckerTotal, loadCheckerPage } = useFinance();
  const [active, setActive] = useState<Payout | null>(null);
  const [query, setQuery] = useState(''); const debouncedQuery = useDebouncedValue(query, 160); const [page, setPage] = useState(1); const [limit, setLimit] = useState(12); const [loading, setLoading] = useState(false);
  useEffect(() => { setLoading(true); loadCheckerPage(page, limit, debouncedQuery).finally(() => setLoading(false)); }, [debouncedQuery, limit, loadCheckerPage, page]);

  const total = awaitingChecker.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-widest text-navy-500">Step 2 · Checker</div>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Checker Verification Queue</h1>
        <p className="mt-1 text-xs text-navy-500 sm:text-sm">
          Re-enter the UTR from bank records. Must match Maker's entry — you cannot see it.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MiniStat icon={ShieldCheck} label="Awaiting verification" value={String(awaitingCheckerTotal)} />
        <MiniStat icon={Clock} label="Total value" value={inr(total)} />
        <MiniStat icon={Search} label="Dual-control" value="Enforced" />
      </div>
      <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-navy-400" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search student, sponsor, payment or APP ID" className="w-full rounded-xl border border-navy-100 bg-white py-2 pl-9 pr-3 text-sm outline-none" /></div>

      {awaitingChecker.length === 0 ? (
        <div className="rounded-2xl border border-navy-100 bg-white py-16 text-center">
          <ShieldCheck size={40} className="mx-auto text-success-500" />
          <div className="mt-3 font-display text-lg font-bold text-navy-900">All caught up</div>
          <div className="text-sm text-navy-500">No payments awaiting Checker verification.</div>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {awaitingChecker.map((r) => (
            <div key={r.id} className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-display text-lg font-bold text-navy-900">{r.fullName}</div>
                  <div className="truncate text-xs text-navy-500">{r.applicationId} · {r.sponsor}</div>
                </div>
                <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-800">
                  MAKER ENTERED
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <Field label="Amount" value={inr(r.amount)} bold />
                <Field label="Bank" value={r.bankName} />
                <Field label="Maker" value={r.makerName ?? "—"} />
                <Field label="Recorded" value={r.makerAt ? formatFinanceDateTime(r.makerAt) : "—"} />
              </div>
              <div className="mt-4 rounded-lg border border-dashed border-navy-100 bg-navy-50/50 p-3 text-center text-[11px] font-semibold text-navy-500">
                Maker's UTR is hidden — enter from bank statement independently.
              </div>
              <button
                onClick={() => setActive(r)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-navy-900 py-2.5 text-sm font-bold text-white hover:bg-navy-700"
              >
                <ShieldCheck size={16} /> Verify Payment
              </button>
            </div>
          ))}
        </div>
      )}

      {active ? <CheckerModal row={active} onClose={() => setActive(null)} /> : null}
      <DataPagination page={page} limit={limit} total={awaitingCheckerTotal} loading={loading} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1); }} />
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: typeof ShieldCheck; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-navy-100 bg-white p-3 sm:p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-white">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-widest text-navy-500">{label}</div>
        <div className="truncate font-display text-base font-bold text-navy-900">{value}</div>
      </div>
    </div>
  );
}

function Field({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="rounded-lg border border-navy-100 bg-navy-50/40 p-2.5">
      <div className="text-[9px] font-bold uppercase tracking-widest text-navy-500">{label}</div>
      <div className={`mt-0.5 truncate text-navy-900 ${bold ? "font-display text-base font-bold" : "text-xs font-semibold"}`}>
        {value}
      </div>
    </div>
  );
}



