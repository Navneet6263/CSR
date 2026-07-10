import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  delta?: string;
  icon: LucideIcon;
  tone?: "brand" | "gold" | "success" | "danger";
}

const TONE: Record<string, string> = {
  brand: "from-brand/25 to-brand-2/10 text-brand",
  gold: "from-gold/25 to-gold/5 text-gold",
  success: "from-success/25 to-success/5 text-success",
  danger: "from-danger/25 to-danger/5 text-danger",
};

export function StatCard({ label, value, delta, icon: Icon, tone = "brand" }: Props) {
  return (
    <div className="glass-card group relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-40 blur-2xl transition group-hover:opacity-70"
        style={{ background: "radial-gradient(circle, currentColor, transparent 70%)" }} />
      <div className="flex items-start justify-between">
        <div className={`grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br ${TONE[tone]} border border-brand/10`}>
          <Icon className="h-5 w-5" />
        </div>
        {delta && (
          <span className="rounded-full border border-brand/10 bg-brand/5 px-2 py-0.5 text-[10px] font-medium text-text-muted">
            {delta}
          </span>
        )}
      </div>
      <div className="mt-5">
        <div className="font-display text-3xl font-semibold tracking-tight">{value}</div>
        <div className="mt-1 text-xs uppercase tracking-wider text-text-dim">{label}</div>
      </div>
    </div>
  );
}
