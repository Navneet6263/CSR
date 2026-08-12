import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { inr, type CompletedPayment } from "@/types/finance";
import { formatFinanceDate } from "@/lib/financeFormat";

export function FinanceRecentSettlements({ rows }: { rows: CompletedPayment[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-navy-100 px-5 py-4 sm:px-6">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-navy-500">Settlement ledger</div>
          <h2 className="mt-0.5 font-display text-lg font-bold text-navy-900">Recent completed payments</h2>
        </div>
        <Link href="/finance/history" className="inline-flex items-center gap-1 text-xs font-bold text-navy-700 hover:text-navy-900">
          View history <ArrowRight size={13} />
        </Link>
      </header>
      <div className="divide-y divide-navy-100">
        {rows.slice(0, 5).map((row) => (
          <div key={`${row.txnId}-${row.applicationId}`} className="flex items-center gap-3 px-5 py-3.5 sm:px-6">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-success-50 text-success-700"><CheckCircle2 size={17} /></div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-navy-900">{row.fullName}</div>
              <div className="truncate font-mono text-[10px] text-navy-500">{row.applicationId} · {row.txnId} · {row.bankName}</div>
            </div>
            <div className="shrink-0 text-right">
              <div className="font-display text-sm font-bold text-navy-900">{inr(row.amount)}</div>
              <div className="text-[10px] text-navy-500">{formatFinanceDate(row.date)}</div>
            </div>
          </div>
        ))}
        {rows.length === 0 ? <div className="px-6 py-10 text-center text-sm text-navy-500">No completed settlements yet.</div> : null}
      </div>
    </section>
  );
}
