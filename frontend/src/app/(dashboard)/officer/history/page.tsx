"use client";

import Link from "next/link";
import { CheckCircle2, Flag, XCircle, MapPin } from "lucide-react";
import { visits } from "@/lib/officer-data";
import { TopNav } from "@/components/officer/TopNav";

const rows = [
  ...visits.map((v) => ({
    id: v.id,
    student: v.studentName,
    city: v.address.city,
    outcome: v.status === "completed" ? "pass" : v.status === "flagged" ? "flag" : "pending",
    when: v.assignedOn,
  })),
  { id: "VIS-1032", student: "Meera Iyer", city: "Solapur", outcome: "pass", when: "2 days ago" },
  { id: "VIS-1028", student: "Karan Joshi", city: "Pune", outcome: "flag", when: "3 days ago" },
  { id: "VIS-1024", student: "Deepa Naik", city: "Satara", outcome: "fail", when: "4 days ago" },
  { id: "VIS-1019", student: "Amit Rane", city: "Pune", outcome: "pass", when: "5 days ago" },
];

export default function OfficerHistory() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />
      <main className="relative z-10 mx-auto w-full max-w-[1400px] px-4 py-6 lg:px-8">
        <div className="space-y-6">
          <header>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">History</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Visit History</h1>
            <p className="mt-1 text-sm text-slate-500">All verifications you have submitted, most recent first.</p>
          </header>

          <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="grid grid-cols-12 gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              <div className="col-span-2">Visit ID</div>
              <div className="col-span-4">Student</div>
              <div className="col-span-3">Location</div>
              <div className="col-span-2">Outcome</div>
              <div className="col-span-1 text-right">When</div>
            </div>
            <ul style={{ contentVisibility: "auto" }} className="divide-y divide-slate-100">
              {rows.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/officer/applications/${r.id}`}
                    className="grid grid-cols-12 items-center gap-3 px-5 py-3 text-sm transition hover:bg-cyan-50/50"
                  >
                    <span className="col-span-2 font-mono text-xs text-slate-500">{r.id}</span>
                    <span className="col-span-4 truncate font-semibold text-slate-800">{r.student}</span>
                    <span className="col-span-3 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin size={12} /> {r.city}
                    </span>
                    <span className="col-span-2"><Outcome outcome={r.outcome} /></span>
                    <span className="col-span-1 text-right text-[11px] text-slate-400">{r.when}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}

function Outcome({ outcome }: { outcome: string }) {
  const map: Record<string, { icon: React.ReactNode; cls: string; label: string }> = {
    pass: { icon: <CheckCircle2 size={12} />, cls: "bg-emerald-50 text-emerald-700 ring-emerald-200", label: "Passed" },
    flag: { icon: <Flag size={12} />, cls: "bg-amber-50 text-amber-700 ring-amber-200", label: "Flagged" },
    fail: { icon: <XCircle size={12} />, cls: "bg-rose-50 text-rose-700 ring-rose-200", label: "Failed" },
    pending: { icon: <Flag size={12} />, cls: "bg-slate-100 text-slate-600 ring-slate-200", label: "Pending" },
  };
  const s = map[outcome] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  );
}
