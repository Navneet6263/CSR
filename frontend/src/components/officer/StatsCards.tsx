import React from "react";

export function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
  tone: "cyan" | "emerald" | "amber";
}) {
  const tones = {
    cyan: "bg-cyan-50 text-cyan-600 ring-cyan-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
  } as const;
  
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
      <div className={`mb-2 grid h-8 w-8 place-items-center rounded-lg ring-1 ${tones[tone]}`}>
        <Icon size={16} />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{label}</p>
    </div>
  );
}
