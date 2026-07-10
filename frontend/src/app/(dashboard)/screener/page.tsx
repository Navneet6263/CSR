"use client";

import { useMemo, useState } from "react";
import { ClipboardList, CheckCircle2, XCircle, Sparkles, Filter, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/screener/StatCard";
import { QueueTable } from "@/components/screener/QueueTable";
import { ScreenerHeader } from "@/components/screener/ScreenerHeader";
import { APPLICATIONS } from "@/lib/screening-data";

type FilterKey = "all" | "high" | "low";

export default function ScreenerDashboard() {
  const [filter, setFilter] = useState<FilterKey>("all");

  const rows = useMemo(() => {
    if (filter === "high") return APPLICATIONS.filter((a) => a.meritScore > 80);
    if (filter === "low") return APPLICATIONS.filter((a) => a.income < 200000);
    return APPLICATIONS;
  }, [filter]);

  const avg = Math.round(APPLICATIONS.reduce((s, a) => s + a.meritScore, 0) / APPLICATIONS.length);

  return (
    <div className="screener-theme flex flex-col min-h-screen" style={{ background: "radial-gradient(1200px 800px at 10% -10%, oklch(0.92 0.08 350 / 0.55), transparent 60%), radial-gradient(900px 700px at 100% 0%, oklch(0.9 0.1 340 / 0.35), transparent 55%), var(--screener-bg, oklch(0.99 0.008 350))" }}>
      <ScreenerHeader />
      <main className="mx-auto w-full max-w-[1400px] px-6 py-8 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold">
              <Sparkles className="h-3.5 w-3.5" /> Merit Command Center
            </div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-text">Good afternoon, Meera.</h1>
            <p className="mt-1.5 text-sm text-text-muted">
              You have <span className="font-semibold text-text">{APPLICATIONS.length} applications</span> awaiting merit screening.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-brand/8 bg-brand/5 px-4 py-2 text-xs">
            <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
            <span className="text-text-muted">Live sync active · Field & Doc Audit teams online</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Pending Screening" value={APPLICATIONS.length} icon={ClipboardList} tone="brand" delta="+6 today" />
          <StatCard label="Approved Today" value={12} icon={CheckCircle2} tone="success" delta="↑ 18%" />
          <StatCard label="Rejected Today" value={3} icon={XCircle} tone="danger" delta="↓ 5%" />
          <StatCard label="Avg. Merit Score" value={`${avg}/100`} icon={TrendingUp} tone="gold" delta="This week" />
        </div>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-text">Actionable Queue</h2>
              <p className="text-xs text-text-dim">Applications in status <span className="rounded bg-gold/15 px-1.5 py-0.5 font-mono text-[10px] text-gold">ScreeningPending</span></p>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-text-dim" />
              {([
                ["all", "All"],
                ["high", "High Merit ( > 80% )"],
                ["low", "Low Income"],
              ] as [FilterKey, string][]).map(([k, l]) => (
                <button key={k} onClick={() => setFilter(k)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                    filter === k
                      ? "border-gold/50 bg-gold/15 text-gold"
                      : "border-brand/8 bg-brand/5 text-text-muted hover:text-text"
                  }`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <QueueTable rows={rows} />
        </section>
      </main>
    </div>
  );
}
