'use client';

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, GraduationCap, Users, Wallet, Calendar,
  Pause, Settings2, Download, CheckCircle2, Clock4, Edit3,
} from "lucide-react";

const inr = (n: number) => "₹ " + n.toLocaleString("en-IN");

export default function ManageScholarship() {
  const params = useParams();
  const rawId = (params?.id as string) || "untitled-scholarship";
  const name = rawId.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  
  const budget = 5000000;
  const disbursed = 2400000;
  const reserved = 800000;
  const remaining = budget - disbursed - reserved;
  const seats = 100;
  const filled = 64;
  const pct = Math.round((filled / seats) * 100);

  const rules = [
    { f: "Caste / Category", op: "in", v: "SC, ST, OBC" },
    { f: "Annual Family Income", op: "≤", v: "₹ 2,00,000" },
    { f: "Minimum GPA", op: ">", v: "8.0" },
    { f: "Course Enrolled", op: "in", v: "B.Tech, B.Sc CS" },
  ];

  const timeline = [
    { t: "Batch #402 authorized — ₹12,00,000", who: "CSR Partner", when: "2d ago", tone: "ok" as const },
    { t: "Screening completed for 24 applicants", who: "Neha B.", when: "3d ago", tone: "ok" as const },
    { t: "Eligibility rule updated: GPA 7.5 → 8.0", who: "Admin", when: "5d ago", tone: "warn" as const },
    { t: "Program launched", who: "Admin", when: "21d ago", tone: "info" as const },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex items-center gap-2 text-[12px] text-slate-500">
        <Link href="/admin/scholarships" className="inline-flex items-center gap-1 hover:text-slate-900">
          <ArrowLeft className="h-3.5 w-3.5" /> All Scholarships
        </Link>
      </div>

      <header className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-start">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-900 text-white shrink-0">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl sm:text-2xl font-semibold text-slate-900">{name}</h1>
              <p className="text-[12px] text-slate-500 truncate">Tata CSR Foundation · Live · Closes 30 Sep 2026</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 hover:bg-amber-100">
            <Pause className="h-3.5 w-3.5" /> Pause
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800">
            <Edit3 className="h-3.5 w-3.5" /> Edit Rules
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric label="Budget" value={inr(budget)} icon={<Wallet className="h-3.5 w-3.5" />} />
        <Metric label="Disbursed" value={inr(disbursed)} sub={`${Math.round(disbursed/budget*100)}%`} />
        <Metric label="Reserved" value={inr(reserved)} sub="awaiting payout" />
        <Metric label="Remaining" value={inr(remaining)} sub={`${Math.round(remaining/budget*100)}% free`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card title="Fund Utilization" hint="Live tracking">
            <div className="space-y-3">
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 flex">
                <div className="h-full bg-emerald-500" style={{ width: `${disbursed/budget*100}%` }} />
                <div className="h-full bg-amber-400" style={{ width: `${reserved/budget*100}%` }} />
              </div>
              <div className="flex flex-wrap gap-4 text-[12px] text-slate-600">
                <Legend dot="bg-emerald-500" label="Disbursed" v={inr(disbursed)} />
                <Legend dot="bg-amber-400" label="Reserved" v={inr(reserved)} />
                <Legend dot="bg-slate-200" label="Available" v={inr(remaining)} />
              </div>
            </div>
          </Card>

          <Card title="Eligibility Rules Engine" hint={`${rules.length} active`}>
            <ul className="divide-y divide-slate-100">
              {rules.map((r, i) => (
                <li key={i} className="flex items-center gap-3 py-2.5 text-sm">
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-slate-50 text-[11px] font-semibold text-slate-500 tabular-nums">
                    {i + 1}
                  </span>
                  <span className="font-medium text-slate-900">{r.f}</span>
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-mono text-slate-600">{r.op}</span>
                  <span className="text-slate-700 truncate">{r.v}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Activity Timeline">
            <ol className="space-y-3">
              {timeline.map((e, i) => (
                <li key={i} className="flex gap-3">
                  <span className={
                    "mt-1 h-2 w-2 rounded-full shrink-0 " +
                    (e.tone === "ok" ? "bg-emerald-500" : e.tone === "warn" ? "bg-amber-500" : "bg-slate-400")
                  } />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-900 truncate">{e.t}</p>
                    <p className="text-[11px] text-slate-500">{e.who} · {e.when}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Seats" hint={`${pct}% filled`}>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-semibold text-slate-900 tabular-nums">{filled}<span className="text-slate-400 text-lg">/{seats}</span></div>
              <div className="flex-1">
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-slate-900" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">{seats - filled} seats open</p>
              </div>
            </div>
          </Card>

          <Card title="Quick Stats">
            <ul className="space-y-2 text-sm">
              {[
                { l: "Applications", v: "1,284", icon: <Users className="h-3.5 w-3.5" /> },
                { l: "In Screening", v: "126", icon: <Clock4 className="h-3.5 w-3.5" /> },
                { l: "Approved", v: "64", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
                { l: "Closes In", v: "94 days", icon: <Calendar className="h-3.5 w-3.5" /> },
              ].map((s) => (
                <li key={s.l} className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-slate-600">{s.icon}{s.l}</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{s.v}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Danger Zone">
            <div className="space-y-2">
              <button className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 hover:bg-amber-100">
                <Settings2 className="h-3.5 w-3.5" /> Close Applications Early
              </button>
              <button className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100">
                Archive Program
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4">
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-[10px] uppercase tracking-widest">{label}</span>
        {icon}
      </div>
      <p className="mt-2 text-xl font-semibold text-slate-900 tabular-nums">{value}</p>
      {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200/80 bg-white">
      <header className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {hint && <span className="text-[10px] uppercase tracking-widest text-slate-400">{hint}</span>}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Legend({ dot, label, v }: { dot: string; label: string; v: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900 tabular-nums">{v}</span>
    </span>
  );
}
