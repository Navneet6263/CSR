"use client";
import { partners } from "./data";

function Row({ reverse }: { reverse?: boolean }) {
  const items = [...partners, ...partners];
  return (
    <div className="group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
      <div className={`flex w-max gap-4 ${reverse ? "ticker-track-reverse" : "ticker-track"} group-hover:[animation-play-state:paused]`}>
        {items.map((p, i) => (
          <div
            key={`${p}-${i}`}
            className="grid h-16 w-44 shrink-0 place-items-center rounded-xl border border-border bg-background px-5 text-sm font-semibold tracking-tight text-muted-foreground transition-all hover:scale-105 hover:border-primary hover:text-foreground hover:shadow-sm"
          >
            {p}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Partners() {
  return (
    <section id="partners" className="border-y border-border bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Corporate Partners</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Trusted by India's Leading Companies
          </h2>
        </div>
        <div className="mt-10 flex flex-col gap-4">
          <Row />
          <Row reverse />
        </div>
      </div>
    </section>
  );
}

