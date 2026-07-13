
import React from "react";

type Props = {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  tone?: "emerald" | "pink" | "slate" | "amber";
};

const tones: Record<string, string> = {
  emerald: "from-emerald-500 to-emerald-700 text-white",
  pink: "from-pink-400 to-rose-500 text-white",
  slate: "from-slate-700 to-slate-900 text-white",
  amber: "from-amber-400 to-orange-500 text-white",
};

export default function MetricCard({ label, value, sub, icon, tone = "emerald" }: Props) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-pink-100 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </div>
          <div className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</div>
          {sub && <div className="mt-1 text-xs font-medium text-emerald-600">{sub}</div>}
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm ${tones[tone]}`}
        >
          {icon}
        </div>
      </div>
      <div className="pointer-events-none absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-pink-50 opacity-0 transition group-hover:opacity-100" />
    </div>
  );
}
