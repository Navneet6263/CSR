"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, RefreshCw, ShieldCheck } from "lucide-react";
import { inr } from "@/types/finance";

interface Props {
  firstName?: string;
  exposure: number;
  queueCount: number;
  loading: boolean;
  financeFunction?: 'Maker' | 'Checker' | null;
  onRefresh: () => Promise<void>;
}

export function FinanceDashboardHero(props: Props) {
  const { firstName, exposure, queueCount, loading, financeFunction, onRefresh } = props;
  const [refreshing, setRefreshing] = useState(false);
  const refresh = async () => {
    setRefreshing(true);
    try { await onRefresh(); } finally { setRefreshing(false); }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-navy-900 px-5 py-6 text-white shadow-xl sm:px-7 sm:py-7">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-success-500/10 blur-2xl" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
              Payment operations
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300">
              <ShieldCheck size={13} /> Dual control active
            </span>
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
            Good morning{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-white/60">
            Review transfer exposure, clear payment queues and monitor settlement exceptions.
          </p>
        </div>

        <div className="grid min-w-0 gap-4 sm:grid-cols-[1fr_auto] sm:items-end lg:min-w-[440px]">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Processing exposure</div>
            <div className="mt-1 truncate font-display text-3xl font-bold sm:text-4xl">{inr(exposure)}</div>
            <div className="mt-1 text-xs font-medium text-white/55">{queueCount} transfers across Maker and Checker</div>
          </div>
          <button type="button" onClick={refresh} disabled={refreshing || loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-xs font-bold hover:bg-white/15 disabled:opacity-50">
            <RefreshCw size={14} className={refreshing || loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      <div className="relative mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-4">
        {financeFunction === 'Maker' ? <QuickLink href="/finance/pending" label="Open Maker queue" /> : null}
        {financeFunction === 'Checker' ? <QuickLink href="/finance/checker" label="Open Checker queue" /> : null}
        <QuickLink href="/finance/audit" label="View audit trail" />
      </div>
    </section>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-white/75 transition hover:bg-white/10 hover:text-white">
      {label}<ArrowUpRight size={13} />
    </Link>
  );
}
