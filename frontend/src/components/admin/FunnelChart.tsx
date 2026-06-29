import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import ChartCard from "./ChartCard";

// Dynamic stages will be computed inside the component

function RingTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-lg bg-slate-900 text-white shadow-xl px-3 py-2 text-xs">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ background: p.payload.color }} />
        <span className="text-slate-300">{p.name}</span>
        <span className="ml-auto font-medium tabular-nums">{p.value.toLocaleString()}</span>
      </div>
    </div>
  );
}

export default function FunnelChart({ data }: { data?: any }) {
  const applied = data?.applied || 1000;
  const docs = data?.docsVerified || 800;
  const bg = data?.bgVerified || 600;
  const screened = data?.screened || 480;
  const approved = data?.approved || 400;

  const stages = [
    { name: "Applied", value: applied, color: "#0f172a" },
    { name: "Docs Cleared", value: docs, color: "#334155" },
    { name: "BG Cleared", value: bg, color: "#475569" },
    { name: "Screened", value: screened, color: "#64748b" },
    { name: "Final Approval", value: approved, color: "#94a3b8" },
  ];

  const drops = [
    { name: "Applied → Docs", value: Math.max(0, applied - docs), color: "#fb7185" },
    { name: "Docs → BG", value: Math.max(0, docs - bg), color: "#f43f5e" },
    { name: "BG → Screened", value: Math.max(0, bg - screened), color: "#e11d48" },
    { name: "Screened → Final", value: Math.max(0, screened - approved), color: "#be123c" },
  ];

  const totalDropped = drops.reduce((acc, curr) => acc + curr.value, 0);
  const finalConversion = applied > 0 ? Math.round((approved / applied) * 100) : 0;

  return (
    <ChartCard
      title="Application Funnel"
      subtitle="Conversion through each pipeline stage"
      right={
        <div className="flex items-center gap-3 mr-1 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-900" /> Passed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-400" /> Dropped
          </span>
        </div>
      }
    >
      <div className="h-[240px] w-full flex items-center justify-center gap-4">
        <div className="relative w-[180px] h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stages}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={68}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {stages.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Pie
                data={drops}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {drops.map((entry, index) => (
                  <Cell key={`drop-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<RingTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-slate-900">{finalConversion}%</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Final Conversion</span>
          </div>
        </div>

        <div className="space-y-2.5 min-w-[140px]">
          {stages.map((s) => (
            <div key={s.name} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-[11px] text-slate-500 flex-1">{s.name}</span>
              <span className="text-[11px] font-semibold text-slate-900 tabular-nums">{s.value.toLocaleString()}</span>
            </div>
          ))}
          <div className="h-px bg-slate-100 my-1" />
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full shrink-0 bg-rose-400" />
            <span className="text-[11px] text-slate-500 flex-1">Total Dropped</span>
            <span className="text-[11px] font-semibold text-rose-500 tabular-nums">{totalDropped.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
