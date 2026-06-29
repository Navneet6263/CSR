import { lazy, Suspense } from "react";

const Chart = lazy(() => import("./ImpactDonutChart"));

export type ImpactSlice = { name: string; value: number; color: string };

export default function ImpactDonut({ slices }: { slices: ImpactSlice[] }) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400">Impact Distribution</div>
          <h3 className="text-sm font-semibold text-slate-900 mt-0.5">Funds by Discipline</h3>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-slate-400">FY 2026</span>
      </div>

      <div className="p-4">
        <Suspense fallback={<div className="h-[200px] animate-pulse rounded-lg bg-slate-100" />}>
          <Chart slices={slices} total={total} />
        </Suspense>

        <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
          {slices.map((s) => {
            const pct = ((s.value / total) * 100).toFixed(0);
            return (
              <li key={s.name} className="flex items-center justify-between gap-2 text-[12px]">
                <span className="inline-flex items-center gap-1.5 min-w-0">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: s.color }} />
                  <span className="truncate text-slate-700">{s.name}</span>
                </span>
                <span className="font-semibold text-slate-900 tabular-nums">{pct}%</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
