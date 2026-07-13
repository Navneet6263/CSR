"use client";
import type { LucideIcon } from "lucide-react";

type Tone = "navy" | "success" | "warning";

const toneMap: Record<Tone, { chip: string; icon: string }> = {
  navy: { chip: "bg-navy-50 text-navy-700", icon: "bg-navy-900 text-white" },
  success: { chip: "bg-success-50 text-success-700", icon: "bg-success-500 text-white" },
  warning: { chip: "bg-amber-50 text-amber-700", icon: "bg-amber-500 text-white" },
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "navy",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: Tone;
}) {
  const t = toneMap[tone];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-navy-100 bg-white p-6 shadow-[0_1px_0_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.15)]">
      <div className="flex items-start justify-between">
        <div>
          <div className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${t.chip}`}>
            {label}
          </div>
          <div className="mt-4 font-display text-3xl font-bold text-navy-900">{value}</div>
          {hint ? <div className="mt-1 text-xs font-medium text-navy-500">{hint}</div> : null}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${t.icon}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="pointer-events-none absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-navy-50/60" />
    </div>
  );
}
