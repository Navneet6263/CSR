import { MapPin } from "lucide-react";

export type GeoRow = { state: string; applicants: number; approved: number };

export default function GeoMap({ rows }: { rows: GeoRow[] }) {
  const max = Math.max(...rows.map((r) => r.applicants), 1);
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400">Geographic Distribution</div>
          <p className="text-xs text-slate-500 mt-0.5">Applicants by state · heatmap intensity</p>
        </div>
        <div className="text-[10px] uppercase tracking-widest text-slate-400">{rows.length} states</div>
      </div>
      <div className="divide-y divide-slate-100">
        {rows.map((r) => {
          const w = (r.applicants / max) * 100;
          const conv = Math.round((r.approved / r.applicants) * 100);
          const intensity = Math.max(0.18, r.applicants / max);
          return (
            <div key={r.state} className="px-5 py-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-900">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-medium">{r.state}</span>
                </div>
                <div className="text-xs text-slate-500 tabular-nums">
                  {r.applicants.toLocaleString()} · <span className="text-emerald-600">{conv}% approved</span>
                </div>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${w}%`, background: `rgba(15,23,42,${intensity})` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
