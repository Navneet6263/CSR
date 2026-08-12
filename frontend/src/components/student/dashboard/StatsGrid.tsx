import type { DashboardStat as StatCard } from "@/types/dashboard";
import { FileCheck, FileText, Layers, Wallet } from "lucide-react";

const iconMap = {
  active: Layers,
  docs: FileCheck,
  open: FileText,
  funded: Wallet,
} as const;

const toneStyles: Record<StatCard["tone"], string> = {
  primary: "bg-primary-soft text-accent-foreground",
  neutral: "bg-muted text-muted-foreground",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning-foreground",
};

interface Props {
  stats: StatCard[];
}

export function StatsGrid({ stats }: Props) {
  return (
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s) => {
        const Icon = iconMap[s.id as keyof typeof iconMap] ?? Layers;
        return (
          <article
            key={s.id}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {s.label}
              </span>
              <span
                className={`grid h-9 w-9 place-items-center rounded-xl ${toneStyles[s.tone]}`}
              >
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold tracking-tight">
                {s.value}
              </span>
            </div>
            {s.hint && (
              <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
            )}
          </article>
        );
      })}
    </section>
  );
}
