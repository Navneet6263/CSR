"use client";
import { useState } from "react";
import { ArrowRight, Clock } from "lucide-react";
import { scholarships, filters, type Scholarship } from "./data";

function LogoBadge({ text }: { text: string }) {
  return (
    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-border bg-muted text-[11px] font-bold tracking-tight text-foreground">
      {text}
    </div>
  );
}

function Card({ s }: { s: Scholarship }) {
  return (
    <article className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-card-hover)]">
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <LogoBadge text={s.logo} />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-muted-foreground">{s.company}</p>
            <h3 className="truncate text-base font-semibold text-foreground">{s.name}</h3>
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
            s.urgent ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          }`}
        >
          <Clock className="h-3 w-3" /> {s.deadline}
        </span>
      </header>

      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Award up to</p>
        <p className="mt-0.5 text-2xl font-bold text-primary">{s.amount}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {s.tags.map((t) => (
          <span key={t} className="rounded-md border border-border bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
            {t}
          </span>
        ))}
      </div>

      <a
        href="#apply"
        className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-all group-hover:bg-primary group-hover:text-primary-foreground"
      >
        Apply Now <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </article>
  );
}

export function Scholarships() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const list = filter === "All" ? scholarships : scholarships.filter((s) => s.category === filter);

  return (
    <section id="scholarships" className="border-t border-border bg-muted/30 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Live openings</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Listed Scholarships
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Curated CSR-funded programs from India's most respected foundations.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${
                  filter === f
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-background text-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => <Card key={s.name} s={s} />)}
        </div>
      </div>
    </section>
  );
}

