import { Wallet, Banknote, Hourglass, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";

const inr = (n: number) => {
  if (n >= 10000000) return `₹ ${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹ ${(n / 100000).toFixed(1)} L`;
  return `₹ ${n.toLocaleString("en-IN")}`;
};

export default function CSRMetrics({
  committed, disbursed, pending, students,
}: { committed: number; disbursed: number; pending: number; students: number }) {
  const utilization = Math.round((disbursed / committed) * 100);
  const cards = [
    { l: "Committed Funds", v: inr(committed), sub: "FY 2026 pledge", icon: Wallet, tone: "slate" as const },
    { l: "Disbursed", v: inr(disbursed), sub: `${utilization}% utilized`, icon: Banknote, tone: "emerald" as const, trend: 8.4 },
    { l: "Pending Approval", v: inr(pending), sub: "awaits signature", icon: Hourglass, tone: "amber" as const, urgent: true },
    { l: "Students Supported", v: students.toLocaleString("en-IN"), sub: "across 16 states", icon: Users, tone: "slate" as const, trend: 12.1 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ contentVisibility: "auto" as const }}>
      {cards.map((c) => {
        const Icon = c.icon;
        const ring =
          c.tone === "emerald" ? "ring-emerald-100" :
          c.tone === "amber" ? "ring-amber-100" : "ring-slate-100";
        const dot =
          c.tone === "emerald" ? "bg-emerald-500" :
          c.tone === "amber" ? "bg-amber-500" : "bg-slate-900";
        return (
          <div key={c.l} className={`relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm ring-4 ${ring}`}>
            <div className="flex items-start justify-between">
              <div className="text-[10px] uppercase tracking-widest text-slate-400">{c.l}</div>
              <span className={`grid h-7 w-7 place-items-center rounded-lg bg-slate-50 text-slate-600`}>
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              </span>
            </div>
            <p className="mt-2 text-[22px] font-semibold tracking-tight text-slate-900 tabular-nums">{c.v}</p>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-1.5 text-slate-500">
                <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />{c.sub}
              </span>
              {c.trend !== undefined && (
                <span className={"inline-flex items-center gap-0.5 font-medium " + (c.trend >= 0 ? "text-emerald-600" : "text-rose-600")}>
                  {c.trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(c.trend)}%
                </span>
              )}
              {c.urgent && (
                <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-700">Action</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
