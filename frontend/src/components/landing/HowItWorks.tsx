import { UserPlus, Sparkles, FileCheck, Wallet } from "lucide-react";
import { steps } from "./data";

const icons = [UserPlus, Sparkles, FileCheck, Wallet];

export function HowItWorks() {
  return (
    <section id="process" className="content-auto py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Simple Process</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">How It Works</h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            From registration to disbursal in four transparent steps.
          </p>
        </div>

        <ol className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => {
            const Icon = icons[i];
            return (
              <li
                key={s.n}
                className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-card-hover)]"
              >
                <div className="flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-4xl font-bold text-muted-foreground/25">0{s.n}</span>
                </div>
                <h3 className="mt-5 text-base font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
              </li>
            );
          })}
        </ol>

        <div className="mx-auto mt-14 flex max-w-3xl flex-col items-center justify-between gap-4 rounded-2xl border border-primary/30 bg-primary-soft px-6 py-6 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Ready to begin?</h3>
            <p className="text-sm text-muted-foreground">It takes less than 5 minutes to get matched.</p>
          </div>
          <a
            href="/register"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-95 hover:shadow-md"
          >
            Start Application
          </a>
        </div>
      </div>
    </section>
  );
}

