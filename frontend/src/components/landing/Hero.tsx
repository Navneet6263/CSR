"use client";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { usePublicPortal } from './PublicPortalProvider';

const compactMoney = (value: number) => new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(value);

export function Hero() {
  const { data, loading } = usePublicPortal();
  const stats = [
    { value: data?.stats.registeredStudents ?? 0, label: 'Registered Students' },
    { value: data?.stats.studentsFunded ?? 0, label: 'Students Funded' },
    { value: `₹${compactMoney(data?.stats.disbursed ?? 0)}`, label: 'Disbursed' },
    { value: data?.stats.activePartners ?? 0, label: 'Active Partners' },
  ];
  return <section id="home" className="relative overflow-hidden">
    <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,theme(colors.primary-soft),transparent_60%)]" />
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:px-8 lg:pb-24 lg:pt-28">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm"><ShieldCheck className="h-3.5 w-3.5 text-primary" />Role-based verification · auditable payments</div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">Your Dream, <span className="text-primary">Our Support</span></h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">Apply once, match against active CSR scholarships, and track document checks, screening, approval, and disbursal end to end.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"><a href="/register" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm sm:w-auto">Apply for Scholarship <ArrowRight className="h-4 w-4" /></a><a href="#scholarships" className="inline-flex w-full items-center justify-center rounded-lg border border-border bg-background px-6 py-3 text-sm font-semibold sm:w-auto">View Open Scholarships</a></div>
      </div>
      <dl className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-sm sm:mt-20 sm:grid-cols-4">{stats.map((stat) => <div key={stat.label} className="flex flex-col items-center bg-background px-4 py-6 text-center sm:py-8"><dt className="order-2 mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:text-sm">{stat.label}</dt><dd className={`order-1 text-2xl font-bold text-primary sm:text-4xl ${loading ? 'h-9 w-20 animate-pulse rounded bg-muted' : ''}`}>{loading ? '' : stat.value}</dd></div>)}</dl>
    </div>
  </section>;
}
