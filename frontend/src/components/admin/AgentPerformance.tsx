import { AlertTriangle, Flag, TrendingDown, TrendingUp } from "lucide-react";

export type AgentPerf = {
  name: string;
  pending: number;
  done: number;
  accuracy: number;
  avgTime: string; // e.g. "14m"
  status: "online" | "idle" | "offline";
};

const DOT: Record<string, string> = {
  online: "bg-emerald-500",
  idle: "bg-amber-500",
  offline: "bg-slate-300",
};

function loadLevel(pending: number) {
  if (pending >= 10) return { tag: "Overloaded", cls: "bg-rose-50 text-rose-700 border-rose-200", flag: true };
  if (pending >= 6) return { tag: "Heavy", cls: "bg-amber-50 text-amber-700 border-amber-200", flag: false };
  return { tag: "Normal", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", flag: false };
}

export default function AgentPerformance({ agents }: { agents: AgentPerf[] }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400">Agent Performance</div>
          <p className="text-xs text-slate-500 mt-0.5">Per-agent pending vs. done today · flag slow agents</p>
        </div>
        <div className="text-[10px] uppercase tracking-widest text-slate-400">Today</div>
      </div>
      <div className="divide-y divide-slate-100">
        {agents.map((a) => {
          const total = a.pending + a.done;
          const donePct = total ? (a.done / total) * 100 : 0;
          const lvl = loadLevel(a.pending);
          const trendDown = a.accuracy < 94;
          return (
            <div key={a.name} className="px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="relative grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-700">
                  {a.name.split(" ").map((p) => p[0]).join("")}
                  <span className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-white ${DOT[a.status]}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900 truncate">{a.name}</span>
                    <span className={`rounded-full border px-1.5 py-0.5 text-[9.5px] font-medium ${lvl.cls}`}>
                      {lvl.tag}
                    </span>
                    {lvl.flag && (
                      <button className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-rose-700 hover:bg-rose-50">
                        <Flag className="h-3 w-3" /> Warn
                      </button>
                    )}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500 tabular-nums">
                    <span className="text-rose-600 font-medium">{a.pending} pending</span>
                    <span className="px-1.5 text-slate-300">/</span>
                    <span className="text-emerald-600 font-medium">{a.done} done</span>
                    <span className="px-1.5 text-slate-300">·</span>
                    avg {a.avgTime}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 text-sm font-semibold text-slate-900">
                    {a.accuracy}%
                    {trendDown
                      ? <TrendingDown className="h-3 w-3 text-rose-500" />
                      : <TrendingUp className="h-3 w-3 text-emerald-500" />}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-400">accuracy</div>
                </div>
              </div>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full bg-emerald-500" style={{ width: `${donePct}%` }} />
              </div>
              {lvl.flag && (
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-rose-700">
                  <AlertTriangle className="h-3 w-3" />
                  Queue building up — consider reassigning {Math.max(0, a.pending - 6)} cases.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
