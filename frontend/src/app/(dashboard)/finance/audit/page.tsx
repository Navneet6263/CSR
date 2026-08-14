"use client";

import { useEffect, useState } from "react";
import { ScrollText, User, ShieldCheck, Settings, Cpu, Search } from "lucide-react";
import { useFinance } from "@/lib/store/finance-store";
import { formatFinanceDateTime } from "@/lib/financeFormat";
import { inr } from "@/types/finance";
import DataPagination from '@/components/shared/DataPagination';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';



const FILTERS = ["All", "Maker", "Checker", "Admin", "System"] as const;
type Filter = (typeof FILTERS)[number];

export default function FinanceAuditPage() {
  const { audit, auditTotal, loadAuditPage } = useFinance();
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState(''); const debouncedQuery = useDebouncedValue(query, 160); const [page, setPage] = useState(1); const [limit, setLimit] = useState(12); const [loading, setLoading] = useState(false);
  useEffect(() => { setLoading(true); loadAuditPage(page, limit, debouncedQuery).finally(() => setLoading(false)); }, [debouncedQuery, limit, loadAuditPage, page]);

  const rows = filter === "All" ? audit : audit.filter((a) => a.role === filter);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-widest text-navy-500">Transparency</div>
        <h1 className="mt-1 font-display text-2xl font-bold text-navy-900 sm:text-3xl">Audit Trail</h1>
        <p className="mt-1 text-xs text-navy-500 sm:text-sm">
          Every Maker action, Checker verification, and Admin override — immutable log.
        </p>
      </div>
      <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-navy-400" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search actor, action, UTR or APP ID" className="w-full rounded-xl border border-navy-100 bg-white py-2 pl-9 pr-3 text-sm outline-none" /></div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
              filter === f ? "bg-navy-900 text-white" : "border border-navy-100 bg-white text-navy-700 hover:bg-navy-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm">
        <ol className="divide-y divide-navy-100">
          {rows.map((a) => (
            <li key={a.id} className="flex items-start gap-3 px-4 py-4 sm:px-6">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${roleClass(a.role)}`}>
                {roleIcon(a.role)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                  <span className="font-semibold text-navy-900">{a.actor}</span>
                  <span className="rounded-full bg-navy-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy-700">
                    {a.role}
                  </span>
                  <span className="text-navy-700">{a.action}</span>
                  <span className="font-mono text-[11px] text-navy-500">→ {a.target}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold">
                  {a.paymentId ? <span className="rounded bg-navy-50 px-2 py-1 text-navy-700">PAY-{a.paymentId}</span> : null}
                  {a.amount != null ? <span className="rounded bg-success-50 px-2 py-1 text-success-700">{inr(a.amount)}</span> : null}
                  {a.referenceNo ? <span className="max-w-full break-all rounded bg-navy-50 px-2 py-1 font-mono text-navy-700">UTR {a.referenceNo}</span> : null}
                </div>
                {a.meta ? (
                  <div className="mt-1 break-all text-xs text-navy-500">{a.meta}</div>
                ) : null}
                <div className="mt-1 text-[10px] font-medium text-navy-400 sm:hidden">{formatFinanceDateTime(a.ts)}</div>
              </div>
              <div className="hidden shrink-0 text-right text-[11px] font-medium text-navy-500 sm:block">
                {formatFinanceDateTime(a.ts)}
              </div>
            </li>
          ))}
          {rows.length === 0 ? (
            <li className="px-6 py-10 text-center text-sm text-navy-500">No events for this filter.</li>
          ) : null}
        </ol>
      </div>
      <DataPagination page={page} limit={limit} total={auditTotal} loading={loading} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1); }} />
    </div>
  );
}

function roleClass(role: string) {
  switch (role) {
    case "Maker": return "bg-navy-900 text-white";
    case "Checker": return "bg-success-500 text-white";
    case "Admin": return "bg-amber-500 text-white";
    default: return "bg-navy-100 text-navy-700";
  }
}
function roleIcon(role: string) {
  switch (role) {
    case "Maker": return <User size={16} />;
    case "Checker": return <ShieldCheck size={16} />;
    case "Admin": return <Settings size={16} />;
    default: return <Cpu size={16} />;
  }
}
// keep import used
void ScrollText;



