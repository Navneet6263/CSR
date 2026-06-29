'use client';

import { useState } from "react";
import { CheckCircle2, XCircle, Pause, Send, Filter, Layers } from "lucide-react";


const ACTIONS = [
  { id: "approve", label: "Approve Selected", icon: CheckCircle2, tone: "emerald" },
  { id: "reject", label: "Reject Selected", icon: XCircle, tone: "rose" },
  { id: "hold", label: "Place on Hold", icon: Pause, tone: "amber" },
  { id: "assign", label: "Reassign Officer", icon: Send, tone: "slate" },
];

const FILTERS = [
  { k: "Stage", v: "Document Check" },
  { k: "Scholarship", v: "Merit-cum-Means 2026" },
  { k: "State", v: "Maharashtra" },
  { k: "SLA", v: "Breached (>2d)" },
];

const TONE: Record<string, string> = {
  emerald: "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
  rose: "border-rose-200 text-rose-700 hover:bg-rose-50",
  amber: "border-amber-200 text-amber-700 hover:bg-amber-50",
  slate: "border-slate-200 text-slate-700 hover:bg-slate-50",
};

export default function BulkActions() {
  const [matched] = useState(128);
  const [confirmed, setConfirmed] = useState(false);
  return (
    <div className="space-y-5">
      <div>
        <div className="text-[10px] uppercase tracking-widest text-slate-400">Operations</div>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">Bulk Actions</h1>
        <p className="mt-0.5 text-sm text-slate-500">Apply an action to many applications at once. Build the filter, preview, confirm.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 rounded-xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[10px] uppercase tracking-widest text-slate-500">Filter Builder</span>
            <span className="ml-auto text-xs text-slate-500">{matched} applications matched</span>
          </div>
          <div className="p-5 space-y-2">
            {FILTERS.map((f) => (
              <div key={f.k} className="flex items-center gap-2 text-sm">
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600">{f.k}</span>
                <span className="text-slate-400 text-xs">is</span>
                <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[12px] text-slate-800">{f.v}</span>
                <button className="ml-auto text-[11px] text-slate-400 hover:text-rose-600">remove</button>
              </div>
            ))}
            <button className="mt-2 text-xs font-medium text-slate-600 hover:text-slate-900">+ Add filter</button>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3">
            <Layers className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[10px] uppercase tracking-widest text-slate-500">Pick an action</span>
          </div>
          <div className="p-5 grid grid-cols-2 gap-2">
            {ACTIONS.map((a) => {
              const Icon = a.icon;
              return (
                <button key={a.id} className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2.5 text-xs font-medium transition ${TONE[a.tone]}`}>
                  <Icon className="h-3.5 w-3.5" />
                  {a.label}
                </button>
              );
            })}
          </div>
          <div className="border-t border-slate-100 px-5 py-4 space-y-3">
            <label className="flex items-start gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300"
              />
              I understand this will affect <span className="font-semibold text-slate-900">{matched} applications</span> and is logged in the audit trail.
            </label>
            <button
              disabled={!confirmed}
              className="w-full rounded-lg bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Run Bulk Action
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

