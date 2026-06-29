import { ArrowUpRight } from "lucide-react";

export default function ChartCard({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200/80 bg-white">
      <header className="flex items-start justify-between px-5 pt-4 pb-3">
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold tracking-wide text-slate-900 uppercase">
            {title}
          </h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {right}
          <button className="grid h-7 w-7 place-items-center rounded-md border border-slate-200/80 text-slate-500 hover:text-slate-900 hover:border-slate-300 transition">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>
      <div className="px-2 pb-3">{children}</div>
    </section>
  );
}

export function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-slate-900 text-white shadow-xl px-3 py-2 text-xs">
      {label && <p className="text-slate-300 mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="text-slate-300">{p.name}</span>
          <span className="ml-auto font-medium tabular-nums">
            {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}
