import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";
import { daysBetween, inr, type Payout } from "@/types/finance";

export function FinancePriorityQueue({ rows }: { rows: Payout[] }) {
  const priority = [...rows].sort((a, b) => daysBetween(b.approvedAt) - daysBetween(a.approvedAt)).slice(0, 5);
  return (
    <section className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-navy-100 px-5 py-4 sm:px-6">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-navy-500">Ageing watch</div>
          <h2 className="mt-0.5 font-display text-lg font-bold text-navy-900">Priority payouts</h2>
        </div>
        <Link href="/finance/pending" className="inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-3 py-2 text-xs font-bold text-white hover:bg-navy-700">
          Full queue <ArrowRight size={13} />
        </Link>
      </header>
      <div className="divide-y divide-navy-100">
        {priority.map((row) => {
          const days = daysBetween(row.approvedAt);
          return (
            <div key={row.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:px-6">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-navy-900">{row.fullName}</div>
                <div className="truncate text-[11px] text-navy-500">{row.applicationId} · {row.sponsor}</div>
              </div>
              <span className={`hidden items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold sm:inline-flex ${days >= 7 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                <Clock3 size={11} /> {days} days
              </span>
              <div className="text-right">
                <div className="font-display text-sm font-bold text-navy-900">{inr(row.amount)}</div>
                <div className="text-[10px] text-navy-500 sm:hidden">Waiting {days}d</div>
              </div>
            </div>
          );
        })}
        {priority.length === 0 ? <div className="px-6 py-10 text-center text-sm text-navy-500">Maker queue is clear.</div> : null}
      </div>
    </section>
  );
}
