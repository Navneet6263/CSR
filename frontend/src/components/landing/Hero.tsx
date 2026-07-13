"use client";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { stats } from "./data";

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,theme(colors.primary-soft),transparent_60%)]" />
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:px-8 lg:pb-24 lg:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Verified CSR partner network · 100% transparent
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Your Dream, <span className="text-primary">Our Support</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Connecting deserving students with CSR scholarships from India's top companies.
            Apply once. Get matched to every scholarship you qualify for.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="/register"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-95 hover:shadow-md sm:w-auto"
            >
              Apply for Scholarship <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#scholarships"
              className="inline-flex w-full items-center justify-center rounded-lg border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary sm:w-auto"
            >
              Check Eligibility
            </a>
          </div>
        </div>

        <dl className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-sm sm:mt-20 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center bg-background px-4 py-6 text-center sm:py-8">
              <dt className="order-2 mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:text-sm">
                {s.label}
              </dt>
              <dd className="order-1 text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
                <span className="text-primary">{s.value}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}


