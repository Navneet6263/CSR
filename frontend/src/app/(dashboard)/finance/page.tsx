"use client";

import { useMemo } from "react";
import { AlertOctagon, CheckSquare, TrendingUp, Wallet } from "lucide-react";
import { authApi } from "@/lib/api";
import { useFinance } from "@/lib/store/finance-store";
import { inr } from "@/types/finance";
import { BarChart } from "@/components/finance/BarChart";
import { StatCard } from "@/components/finance/StatCard";
import { FinanceDashboardHero } from "@/components/finance/FinanceDashboardHero";
import { FinancePriorityQueue } from "@/components/finance/FinancePriorityQueue";
import { FinanceRecentSettlements } from "@/components/finance/FinanceRecentSettlements";
import { FinanceSponsorPanel, type SponsorExposure } from "@/components/finance/FinanceSponsorPanel";
import { FinanceWorkflowPanel } from "@/components/finance/FinanceWorkflowPanel";

export default function FinanceDashboard() {
  const finance = useFinance();
  const { pending, awaitingChecker, completed, overview, loading, error, refresh } = finance;
  const user = authApi.getUser();
  const makerAmount = overview.maker.amount;
  const checkerAmount = overview.checker.amount;
  const failedAmount = overview.exceptions.amount;

  const sponsors = useMemo<SponsorExposure[]>(() => {
    const values = new Map<string, Omit<SponsorExposure, "sponsor">>();
    completed.forEach((row) => {
      const current = values.get(row.sponsor) ?? { disbursed: 0, pending: 0 };
      current.disbursed += row.amount; values.set(row.sponsor, current);
    });
    [...pending, ...awaitingChecker].forEach((row) => {
      const current = values.get(row.sponsor) ?? { disbursed: 0, pending: 0 };
      current.pending += row.amount; values.set(row.sponsor, current);
    });
    return Array.from(values, ([sponsor, value]) => ({ sponsor, ...value }))
      .sort((a, b) => b.disbursed + b.pending - a.disbursed - a.pending);
  }, [completed, pending, awaitingChecker]);

  const trend = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setDate(1); date.setMonth(date.getMonth() - (5 - index));
      return { key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
        month: date.toLocaleDateString("en-IN", { month: "short" }), amount: 0 };
    });
    completed.forEach((row) => {
      const month = months.find((item) => row.date.startsWith(item.key));
      if (month) month.amount += row.amount;
    });
    return months.map(({ month, amount }) => ({ month, amount }));
  }, [completed]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <FinanceDashboardHero
        firstName={user?.fullName?.split(" ")[0]}
        exposure={makerAmount + checkerAmount}
        queueCount={overview.maker.count + overview.checker.count}
        loading={loading}
        financeFunction={user?.financeFunction}
        onRefresh={refresh}
      />

      {error ? (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button type="button" onClick={() => void refresh()} className="shrink-0 font-bold underline">Retry</button>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Settled today" value={inr(overview.settledToday.amount)} hint={`${overview.settledToday.count} completed transfers`} icon={TrendingUp} tone="success" />
        <StatCard label="Maker queue" value={inr(makerAmount)} hint={`${overview.maker.count} awaiting UTR entry`} icon={Wallet} />
        <StatCard label="Checker queue" value={inr(checkerAmount)} hint={`${overview.checker.count} awaiting control`} icon={CheckSquare} />
        <StatCard label="Exceptions" value={inr(failedAmount)} hint={`${overview.exceptions.count} payments need action`} icon={AlertOctagon} tone="warning" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-navy-500">Settlement performance</div>
              <h2 className="mt-1 font-display text-lg font-bold text-navy-900">Six-month disbursement trend</h2>
            </div>
            <div className="hidden rounded-lg bg-navy-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-navy-600 sm:block">All sponsors</div>
          </div>
          <div className="mt-5"><BarChart data={trend} /></div>
        </section>
        <FinanceWorkflowPanel makerCount={overview.maker.count} makerAmount={makerAmount}
          checkerCount={overview.checker.count} checkerAmount={checkerAmount}
          checkerAvailable={awaitingChecker.length}
          failedCount={overview.exceptions.count} failedAmount={failedAmount}
          financeFunction={user?.financeFunction} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <FinancePriorityQueue rows={pending} />
          <FinanceRecentSettlements rows={completed} />
        </div>
        <FinanceSponsorPanel rows={sponsors} />
      </div>
    </div>
  );
}
