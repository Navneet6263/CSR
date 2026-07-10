"use client";

import Link from "next/link";
import { useState } from "react";
import {
  MapPin,
  ChevronRight,
  CheckCircle2,
  Clock,
  Flag,
  ListChecks,
} from "lucide-react";
import { dailyStats, visits, type VisitStatus } from "@/lib/officer-data";
import { StatCard } from "@/components/officer/StatsCards";
import { TopNav } from "@/components/officer/TopNav";

type Filter = "all" | VisitStatus;

export default function OfficerDashboard() {
  const [filter, setFilter] = useState<Filter>("pending");
  const list = filter === "all" ? visits : visits.filter((v) => v.status === filter);

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />
      <main className="relative z-10 mx-auto w-full max-w-[1400px] px-4 py-6 lg:px-8">
        <div className="space-y-6">
          <section>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Good morning, Rohan</h1>
            <p className="text-sm text-slate-500">You have {dailyStats.pending} verifications on the field today.</p>
          </section>

          <section className="grid grid-cols-3 gap-2.5">
            <StatCard icon={ListChecks} label="Assigned" value={dailyStats.assigned} tone="cyan" />
            <StatCard icon={CheckCircle2} label="Completed" value={dailyStats.completed} tone="emerald" />
            <StatCard icon={Clock} label="Pending" value={dailyStats.pending} tone="amber" />
          </section>

          <section className="flex gap-2 overflow-x-auto pb-1">
            {(["pending", "completed", "flagged", "all"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition ${
                  filter === f
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
                }`}
              >
                {f}
              </button>
            ))}
          </section>

          <section className="space-y-3" style={{ contentVisibility: "auto" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">Visit Queue</h2>
              <span className="text-xs text-slate-500">{list.length} visits</span>
            </div>
            {list.map((v) => (
              <VisitCard key={v.id} visit={v} />
            ))}
            {list.length === 0 && (
              <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 ring-1 ring-slate-200">
                No visits in this bucket.
              </p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function VisitCard({ visit }: { visit: (typeof visits)[number] }) {
  const urgency = {
    high: "bg-rose-50 text-rose-600 ring-rose-200",
    medium: "bg-amber-50 text-amber-700 ring-amber-200",
    low: "bg-slate-100 text-slate-600 ring-slate-200",
  }[visit.urgency];

  const statusIcon = {
    pending: <Clock size={12} />,
    completed: <CheckCircle2 size={12} />,
    flagged: <Flag size={12} />,
  }[visit.status];

  return (
    <Link
      href={`/officer/applications/${visit.id}`}
      className="group block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:ring-cyan-400 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">{visit.id}</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ring-1 ${urgency}`}>
              {visit.urgency}
            </span>
          </div>
          <p className="mt-1 truncate text-base font-semibold text-slate-900">{visit.studentName}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
            <MapPin size={12} /> {visit.address.city}, {visit.address.state}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium capitalize text-slate-600">
            {statusIcon} {visit.status}
          </span>
          <ChevronRight size={18} className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-cyan-500" />
        </div>
      </div>
    </Link>
  );
}
