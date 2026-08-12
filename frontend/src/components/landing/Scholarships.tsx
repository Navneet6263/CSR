"use client";
import { useMemo, useState } from "react";
import { ArrowRight, Clock } from "lucide-react";
import { usePublicPortal } from './PublicPortalProvider';
import type { PublicScholarship } from '@/lib/api';

function deadline(date: string) {
  const days = Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000));
  return days === 0 ? 'Closes today' : `${days} days left`;
}
function initials(name: string) { return name.split(' ').map((part) => part[0]).slice(0, 3).join('').toUpperCase(); }

function Card({ scholarship }: { scholarship: PublicScholarship }) {
  return <article className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-primary/40">
    <header className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border bg-muted text-[11px] font-bold">{initials(scholarship.sponsorName)}</div><div className="min-w-0"><p className="truncate text-xs text-muted-foreground">{scholarship.sponsorName}</p><h3 className="truncate text-base font-semibold">{scholarship.name}</h3></div></div><span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground"><Clock className="h-3 w-3" />{deadline(scholarship.applicationCloseDate)}</span></header>
    <div className="mt-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">Award up to</p><p className="mt-0.5 text-2xl font-bold text-primary">₹{scholarship.perStudentAmount.toLocaleString('en-IN')}</p></div>
    <p className="mt-3 line-clamp-2 min-h-10 text-sm text-muted-foreground">{scholarship.description || 'Scholarship details are available after sign in.'}</p>
    <a href="/register" className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background group-hover:bg-primary">Apply Now <ArrowRight className="h-3.5 w-3.5" /></a>
  </article>;
}

export function Scholarships() {
  const { data, loading } = usePublicPortal(); const [filter, setFilter] = useState('All');
  const filters = useMemo(() => ['All', ...(data?.partners ?? []).slice(0, 4)], [data]);
  const list = (data?.scholarships ?? []).filter((item) => filter === 'All' || item.sponsorName === filter);
  return <section id="scholarships" className="content-auto border-t border-border bg-muted/30 py-16 sm:py-24"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-widest text-primary">Live openings</p><h2 className="mt-2 text-3xl font-bold sm:text-4xl">Listed Scholarships</h2><p className="mt-2 text-sm text-muted-foreground">Only currently active programs from the scholarship database are shown.</p></div>
      <div className="flex flex-wrap gap-2">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-full border px-4 py-1.5 text-xs font-semibold ${filter === item ? 'border-primary bg-primary text-primary-foreground' : 'bg-background'}`}>{item}</button>)}</div></div>
    <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{loading ? Array.from({ length: 3 }, (_, index) => <div key={index} className="h-64 animate-pulse rounded-2xl border bg-background" />) : list.map((item) => <Card key={item.scholarshipId} scholarship={item} />)}</div>
    {!loading && !list.length && <p className="mt-10 rounded-2xl border bg-background p-10 text-center text-sm text-muted-foreground">No active scholarships are open right now.</p>}
  </div></section>;
}
