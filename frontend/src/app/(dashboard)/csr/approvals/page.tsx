"use client";
import { Metadata } from "next";
import { useState } from "react";
import { CheckCircle2, Eye, Filter, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";

type Row = { id: string; name: string; score: number; amount: string; state: string; course: string };

function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition ${
        checked ? "border-emerald-600 bg-emerald-600" : "border-slate-300 bg-white hover:border-emerald-400"
      }`}
    >
      {checked && <CheckCircle2 size={14} className="text-white" />}
    </button>
  );
}

export default function ApprovalsPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const rows: Row[] = [
    { id: "APP-1001", name: "Ananya Sharma", score: 88, amount: "₹50,000", state: "Rajasthan", course: "B.Tech CSE" },
    { id: "APP-1002", name: "Rohan Verma", score: 82, amount: "₹35,000", state: "Punjab", course: "B.Com (Hons)" },
    { id: "APP-1003", name: "Priya Nair", score: 91, amount: "₹75,000", state: "Kerala", course: "MBBS" },
    { id: "APP-1004", name: "Arjun Patel", score: 79, amount: "₹30,000", state: "Gujarat", course: "B.Sc Maths" },
    { id: "APP-1005", name: "Meera Reddy", score: 85, amount: "₹55,000", state: "Telangana", course: "B.Tech ECE" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Funding Approvals Queue</h1>
          <p className="mt-1 text-sm text-slate-600">
            Applications that cleared Document Audit, Background Check & Merit Screening.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-pink-100 bg-white px-3 py-2 shadow-sm">
            <Search size={15} className="text-slate-400" />
            <input placeholder="Search by name or ID" className="w-56 bg-transparent text-sm outline-none placeholder:text-slate-400" />
          </div>
          <button className="flex items-center gap-1.5 rounded-xl border border-pink-100 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-pink-50">
            <Filter size={15} /> Filter
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-pink-100 bg-gradient-to-r from-pink-50/50 to-white px-6 py-3">
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span className="font-semibold text-emerald-800">12 Pending Approvals</span>
          </div>
          <button className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-slate-800">
            Bulk Approve Selected
          </button>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="py-3 pl-6 pr-4 font-medium"><Checkbox checked={selected.size === rows.length} onChange={() => {}} /></th>
              <th className="py-3 px-4 font-medium">Applicant</th>
              <th className="py-3 px-4 font-medium">Location</th>
              <th className="py-3 px-4 font-medium">Merit Score</th>
              <th className="py-3 px-4 font-medium">Amount</th>
              <th className="py-3 pr-6 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-50">
            {rows.map((r) => (
              <tr key={r.id} className="transition hover:bg-emerald-50/30">
                <td className="py-4 pl-6 pr-4"><Checkbox checked={selected.has(r.id)} onChange={() => toggle(r.id)} /></td>
                <td className="py-4 px-4">
                  <div className="font-bold text-slate-900">{r.name}</div>
                  <div className="text-xs text-slate-500">{r.id} · {r.course}</div>
                </td>
                <td className="py-4 px-4 text-slate-600">{r.state}</td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${r.score >= 90 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {r.score}/100
                  </span>
                </td>
                <td className="py-4 font-bold text-slate-900">{r.amount}</td>
                <td className="py-4 pr-6 text-right">
                  <Link
                    href={`/csr/applications/${r.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                  >
                    <Eye size={13} /> Review A-Z
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
