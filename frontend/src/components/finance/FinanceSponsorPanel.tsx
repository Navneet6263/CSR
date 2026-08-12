import { inr } from "@/types/finance";

export interface SponsorExposure {
  sponsor: string;
  disbursed: number;
  pending: number;
}

export function FinanceSponsorPanel({ rows }: { rows: SponsorExposure[] }) {
  return (
    <section className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-navy-500">Portfolio view</div>
      <h2 className="mt-1 font-display text-lg font-bold text-navy-900">Sponsor exposure</h2>
      <p className="mt-1 text-xs text-navy-500">Settled versus currently processing.</p>
      <div className="mt-5 space-y-4">
        {rows.slice(0, 5).map((row) => {
          const total = row.disbursed + row.pending;
          const settled = total > 0 ? Math.round((row.disbursed / total) * 100) : 0;
          return (
            <div key={row.sponsor}>
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-sm font-semibold text-navy-900">{row.sponsor}</span>
                <span className="shrink-0 font-mono text-xs font-semibold text-navy-700">{inr(total)}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-navy-100">
                <div className="h-full rounded-full bg-success-500" style={{ width: `${settled}%` }} />
              </div>
              <div className="mt-1.5 flex justify-between text-[10px] text-navy-500">
                <span>{settled}% settled</span><span>{inr(row.pending)} processing</span>
              </div>
            </div>
          );
        })}
        {rows.length === 0 ? <div className="rounded-xl bg-navy-50 py-8 text-center text-sm text-navy-500">No sponsor activity yet.</div> : null}
      </div>
    </section>
  );
}
