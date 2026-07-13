"use client";
import { Quote } from "lucide-react";
import { stories } from "./data";

export function Stories() {
  return (
    <section id="stories" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Real Impact</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Students Who Made It
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Three lives — thousands more. Every scholarship starts with an application.
          </p>
        </div>

        <div className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
          {stories.map((s) => (
            <article
              key={s.name}
              className="min-w-[85%] snap-center rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] sm:min-w-0"
            >
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  {s.initials}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-foreground">{s.name}</h3>
                  <p className="truncate text-xs text-muted-foreground">{s.course}</p>
                  <p className="truncate text-xs font-medium text-foreground">{s.college}</p>
                </div>
              </div>

              <div className="mt-5 rounded-lg bg-primary-soft px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Received</p>
                <p className="text-xl font-bold text-primary">{s.amount}</p>
              </div>

              <div className="mt-5 flex gap-3 text-sm text-muted-foreground">
                <Quote className="h-4 w-4 shrink-0 text-primary" />
                <p className="leading-relaxed">{s.quote}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

