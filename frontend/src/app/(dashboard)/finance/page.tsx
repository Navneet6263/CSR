"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Wallet, TrendingUp, AlertOctagon, CheckSquare, ArrowRight } from "lucide-react";
import { StatCard } from "@/components/finance/StatCard";
import { BarChart } from "@/components/finance/BarChart";
import { inr, monthlyTrend, daysBetween } from "@/lib/finance-mock";
import { useFinance } from "@/lib/store/finance-store";

export default function FinanceDashboard() {
  const { pending, awaitingChecker, completed, failed } = useFinance();

  const totalPending = useMemo(() => pending.reduce((s, p) => s + p.amount, 0), [pending]);
  const today = new Date().toISOString().slice(0, 10);
  const disbursedToday = useMemo(
    () => completed.filter((c) => c.date === today).reduce((s, c) => s + c.amount, 0),
    [completed, today],
  );
  const disbursedTodayCount = completed.filter((c) => c.date === today).length;

  // Sponsor-wise breakdown
  const sponsorRows = useMemo(() => {
    const map = new Map<string, { disbursed: number; pending: number }>();
    for (const c of completed) {
      const cur = map.get(c.sponsor) ?? { disbursed: 0, pending: 0 };
      cur.disbursed += c.amount;
      map.set(c.sponsor, cur);
    }
    for (const p of [...pending, ...awaitingChecker]) {
      const cur = map.get(p.sponsor) ?? { disbursed: 0, pending: 0 };
      cur.pending += p.amount;
      map.set(p.sponsor, cur);
    }
    return Array.from(map.entries())
      .map(([sponsor, v]) => ({ sponsor, ...v }))
      .sort((a, b) => b.disbursed + b.pending - (a.disbursed + a.pending));
  }, [completed, pending, awaitingChecker]);

  const failedTotal = failed.reduce((s, f) => s + f.amount, 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-widest text-navy-500">Finance Dashboard</div>
          <h1 className="mt-1 truncate font-display text-2xl font-bold text-navy-900 sm:text-3xl">
            Good morning, Meera 👋
          </h1>
          <p className="mt-1 text-xs text-navy-500 sm:text-sm">
            {pending.length} awaiting Maker · {awaitingChecker.length} awaiting Checker · {failed.length} failed
          </p>
        </div>
        <div className="shrink-0 rounded-xl border border-navy-100 bg-white px-3 py-2 text-right sm:px-4 sm:py-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-navy-500">Session</div>
          <div className="text-xs font-semibold text-success-700 sm:text-sm">● 2FA active</div>
        </div>
      </div>

      {/* Daily summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Disbursed Today" value={inr(disbursedToday)} hint={`${disbursedTodayCount} transfers · ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`} icon={TrendingUp} tone="success" />
        <StatCard label="Pending (Maker)" value={inr(totalPending)} hint={`${pending.length} applications`} icon={Wallet} tone="navy" />
        <StatCard label="Awaiting Checker" value={String(awaitingChecker.length)} hint={inr(awaitingChecker.reduce((s, p) => s + p.amount, 0))} icon={CheckSquare} tone="navy" />
        <StatCard label="Failed / Hold" value={inr(failedTotal)} hint={`${failed.length} need attention`} icon={AlertOctagon} tone="warning" />
      </div>

      {/* Chart + sponsor breakdown */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-navy-500">Monthly Trend</div>
              <div className="font-display text-lg font-bold text-navy-900">Disbursements — last 6 months</div>
            </div>
            <select className="rounded-lg border border-navy-100 bg-white px-2.5 py-1.5 text-xs font-semibold text-navy-700">
              <option>All CSR Partners</option>
              <option>ITC Foundation</option>
              <option>HDFC CSR</option>
              <option>Tata Trusts</option>
            </select>
          </div>
          <BarChart data={monthlyTrend} />
        </div>

        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-widest text-navy-500">Sponsor-wise</div>
          <div className="font-display text-lg font-bold text-navy-900">Breakdown</div>
          <div className="mt-4 space-y-3">
            {sponsorRows.map((s) => {
              const total = s.disbursed + s.pending;
              const pct = total ? (s.disbursed / total) * 100 : 0;
              return (
                <div key={s.sponsor}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-semibold text-navy-900">{s.sponsor}</span>
                    <span className="ml-2 shrink-0 font-mono text-xs text-navy-500">{inr(total)}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-navy-50">
                    <div className="h-full bg-success-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] font-medium text-navy-500">
                    <span>Disbursed {inr(s.disbursed)}</span>
                    <span>Pending {inr(s.pending)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Priority pending shortcut */}
      <div className="rounded-2xl border border-navy-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-navy-100 bg-navy-50/60 px-5 py-3 sm:px-6 sm:py-4">
          <div>
            <div className="font-display text-base font-bold text-navy-900 sm:text-lg">Longest-pending payouts</div>
            <div className="text-[11px] font-medium text-navy-500">Sorted by days waiting</div>
          </div>
          <Link
            href="/finance/pending"
            className="inline-flex items-center gap-1 rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-navy-700"
          >
            Open queue <ArrowRight size={12} />
          </Link>
        </div>
        <div className="divide-y divide-navy-100">
          {[...pending]
            .sort((a, b) => daysBetween(a.approvedAt) - daysBetween(b.approvedAt))
            .reverse()
            .slice(0, 4)
            .map((p) => {
              const days = daysBetween(p.approvedAt);
              const urgent = days >= 7;
              return (
                <div key={p.id} className="flex items-center justify-between gap-3 px-5 py-3 sm:px-6">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-navy-900">{p.fullName}</div>
                    <div className="truncate text-xs text-navy-500">{p.sponsor} · {p.applicationId}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${urgent ? "bg-red-100 text-red-700" : "bg-navy-50 text-navy-700"}`}>
                      {days}d
                    </span>
                    <span className="font-mono text-sm font-bold text-navy-900">{inr(p.amount)}</span>
                  </div>
                </div>
              );
            })}
          {pending.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-navy-500">🎉 Nothing pending — queue clear.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}


