import React from "react";

export function StatCard({
  icon: Icon,
  label,
  value,
  tone,
  help,
}: {
  icon: React.ComponentType<{ size?: string | number; className?: string }>;
  label: string;
  value: number;
  tone: "cyan" | "emerald" | "amber" | "rose";
  help?: string;
}) {
  const tones = {
    cyan: "bg-cyan-50 text-cyan-600 ring-cyan-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
    rose: "bg-rose-50 text-rose-600 ring-rose-100",
  } as const;
  
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className={`mb-3 grid h-9 w-9 place-items-center rounded-xl ring-1 ${tones[tone]}`}>
        <Icon size={16} />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{label}</p>
      {help ? <p className="mt-1 text-[10px] text-slate-400">{help}</p> : null}
    </div>
  );
}
