import { MapPin, TrendingUp, TrendingDown } from "lucide-react";

export type CityRow = {
  city: string;
  state: string;
  applicants: number;
  approved: number;
  trend: number; // +/- pct vs last period
};

export default function CityBreakdown({ rows }: { rows: CityRow[] }) {
  const total = rows.reduce((s, r) => s + r.applicants, 0);
  const sorted = [...rows].sort((a, b) => b.applicants - a.applicants);

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400">Top Cities · Drill-down</div>
          <p className="text-xs text-slate-500 mt-0.5">City-level share with conversion & trend</p>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-slate-400">{rows.length} cities</span>
      </div>
      <ul className="divide-y divide-slate-100">
        {sorted.map((c, i) => {
          const share = (c.applicants / total) * 100;
          const conv = Math.round((c.approved / c.applicants) * 100);
          const up = c.trend >= 0;
          return (
            <li key={c.city} className="px-5 py-3">
              <div className="grid grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-slate-50 text-[10px] font-semibold text-slate-500 tabular-nums">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-sm">
                    <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-900 truncate">{c.city}</span>
                    <span className="text-[11px] text-slate-400 truncate">· {c.state}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-slate-900" style={{ width: `${share * 4}%` }} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900 tabular-nums">{share.toFixed(1)}%</div>
                  <div className="flex items-center justify-end gap-2 text-[10px] text-slate-500 tabular-nums">
                    <span className="text-emerald-600">{conv}%</span>
                    <span className={"inline-flex items-center gap-0.5 " + (up ? "text-emerald-600" : "text-rose-600")}>
                      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(c.trend)}%
                    </span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
