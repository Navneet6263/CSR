import { useState } from "react";

export type RegionDatum = { code: string; name: string; pct: number; applicants: number };

// Simplified India map — abstract grid of regions positioned roughly by geography.
// Each "state" is a rounded square; intensity scales with pct.
const POSITIONS: Record<string, { x: number; y: number; w?: number; h?: number }> = {
  JK: { x: 110, y: 20, w: 70, h: 40 },
  PB: { x: 90, y: 65, w: 50, h: 30 },
  HR: { x: 110, y: 100, w: 50, h: 28 },
  DL: { x: 135, y: 110, w: 18, h: 14 },
  RJ: { x: 40, y: 110, w: 80, h: 60 },
  GJ: { x: 20, y: 175, w: 70, h: 55 },
  MH: { x: 70, y: 215, w: 90, h: 55 },
  GA: { x: 80, y: 270, w: 25, h: 18 },
  KA: { x: 95, y: 285, w: 60, h: 55 },
  KL: { x: 110, y: 340, w: 28, h: 45 },
  TN: { x: 140, y: 320, w: 55, h: 55 },
  AP: { x: 155, y: 260, w: 60, h: 55 },
  TS: { x: 145, y: 215, w: 55, h: 45 },
  OD: { x: 215, y: 215, w: 55, h: 45 },
  CG: { x: 175, y: 175, w: 50, h: 40 },
  MP: { x: 115, y: 145, w: 80, h: 50 },
  UP: { x: 165, y: 95, w: 95, h: 50 },
  BR: { x: 245, y: 130, w: 60, h: 35 },
  JH: { x: 240, y: 170, w: 55, h: 40 },
  WB: { x: 290, y: 165, w: 50, h: 60 },
  AS: { x: 345, y: 110, w: 75, h: 40 },
  NE: { x: 395, y: 155, w: 55, h: 60 },
  SK: { x: 295, y: 115, w: 28, h: 22 },
  UK: { x: 155, y: 70, w: 45, h: 30 },
  HP: { x: 130, y: 55, w: 40, h: 28 },
};

function intensity(pct: number, max: number) {
  return Math.max(0.08, Math.min(1, pct / max));
}

export default function IndiaHeatmap({ regions }: { regions: RegionDatum[] }) {
  const [hover, setHover] = useState<RegionDatum | null>(null);
  const max = Math.max(...regions.map((r) => r.pct), 1);
  const byCode = new Map(regions.map((r) => [r.code, r]));

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400">India · Applicant Heatmap</div>
          <p className="text-xs text-slate-500 mt-0.5">Hover regions for percentage and applicant count</p>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <span>Low</span>
          <span className="flex">
            {[0.15, 0.3, 0.5, 0.7, 1].map((a) => (
              <span key={a} className="h-2 w-3" style={{ background: `rgba(15,23,42,${a})` }} />
            ))}
          </span>
          <span>High</span>
        </div>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-[1fr_220px] gap-0">
        <div className="p-3">
          <svg viewBox="0 0 470 400" className="w-full h-[360px]" role="img" aria-label="India applicant heatmap">
            {Object.entries(POSITIONS).map(([code, pos]) => {
              const d = byCode.get(code);
              const pct = d?.pct ?? 0;
              const a = d ? intensity(pct, max) : 0.05;
              const active = hover?.code === code;
              return (
                <g key={code}>
                  <rect
                    x={pos.x}
                    y={pos.y}
                    width={pos.w ?? 40}
                    height={pos.h ?? 30}
                    rx={6}
                    fill={`rgba(15,23,42,${a})`}
                    stroke={active ? "#0f172a" : "rgba(15,23,42,0.18)"}
                    strokeWidth={active ? 1.5 : 0.6}
                    onMouseEnter={() => d && setHover(d)}
                    onMouseLeave={() => setHover(null)}
                    className="cursor-pointer transition-all"
                  />
                  <text
                    x={pos.x + (pos.w ?? 40) / 2}
                    y={pos.y + (pos.h ?? 30) / 2 + 3}
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="600"
                    fill={a > 0.45 ? "white" : "#475569"}
                    className="pointer-events-none select-none"
                  >
                    {code}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <aside className="border-t md:border-t-0 md:border-l border-slate-100 p-4 bg-slate-50/40">
          <div className="text-[10px] uppercase tracking-widest text-slate-400">Region Detail</div>
          {hover ? (
            <div className="mt-2">
              <p className="text-sm font-semibold text-slate-900">{hover.name}</p>
              <p className="text-[11px] text-slate-500">{hover.code}</p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-slate-900 tabular-nums">{hover.pct}%</span>
                <span className="text-[11px] text-slate-500">of national volume</span>
              </div>
              <p className="mt-1 text-xs text-slate-600 tabular-nums">{hover.applicants.toLocaleString()} applicants</p>
              <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full bg-slate-900" style={{ width: `${(hover.pct / max) * 100}%` }} />
              </div>
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-500">Hover any state on the map to see its share, applicant count and intensity.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
