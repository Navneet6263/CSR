'use client';

import SLAPill from "@/components/admin/SLAPill";
import { getSLALevel, SLA_STYLES } from "@/lib/sla";
import { AlertTriangle, Download } from "lucide-react";


const STAGES = [
  { stage: "Document Check", avg: "8h", breached: 23, atRisk: 41, onTrack: 184, sample: "1d 6h" },
  { stage: "Background Check", avg: "1d 4h", breached: 38, atRisk: 52, onTrack: 156, sample: "3d 2h" },
  { stage: "Screening", avg: "12h", breached: 9, atRisk: 22, onTrack: 92, sample: "1d 2h" },
  { stage: "CSR Approval", avg: "6h", breached: 3, atRisk: 11, onTrack: 48, sample: "10h" },
];

export default function SLAReport() {
  const totalBreached = STAGES.reduce((s, x) => s + x.breached, 0);
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400">Analytics</div>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">SLA Report</h1>
          <p className="mt-0.5 text-sm text-slate-500">Stage-wise breach analysis and turnaround tracking.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900">
          <Download className="h-3.5 w-3.5" /> Export PDF
        </button>
      </div>

      <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-rose-600 mt-0.5" />
        <div className="text-sm text-rose-800">
          <span className="font-semibold">{totalBreached} applications</span> have breached their SLA threshold across all stages. Recommend reassignment or escalation.
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/60 text-[10px] uppercase tracking-widest text-slate-500">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Stage</th>
              <th className="text-left px-5 py-3 font-medium">Avg. TAT</th>
              <th className="text-left px-5 py-3 font-medium">Worst Case</th>
              <th className="text-right px-5 py-3 font-medium">On Track</th>
              <th className="text-right px-5 py-3 font-medium">At Risk</th>
              <th className="text-right px-5 py-3 font-medium">Breached</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {STAGES.map((s) => {
              const lvl = getSLALevel(s.sample);
              const row = SLA_STYLES[lvl].row;
              return (
                <tr key={s.stage} className={row}>
                  <td className="px-5 py-3 font-medium text-slate-900">{s.stage}</td>
                  <td className="px-5 py-3 text-slate-600 tabular-nums">{s.avg}</td>
                  <td className="px-5 py-3"><SLAPill waiting={s.sample} /></td>
                  <td className="px-5 py-3 text-right tabular-nums text-emerald-700">{s.onTrack}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-amber-700">{s.atRisk}</td>
                  <td className="px-5 py-3 text-right tabular-nums font-semibold text-rose-700">{s.breached}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

