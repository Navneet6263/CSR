"use client";
import { GraduationCap } from 'lucide-react';
import { usePublicPortal } from './PublicPortalProvider';

export function Stories() {
  const { data, loading } = usePublicPortal(); const outcomes = data?.outcomes ?? [];
  return <section id="stories" className="content-auto py-16 sm:py-24"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-2xl text-center"><p className="text-xs font-semibold uppercase tracking-widest text-primary">Verified impact</p><h2 className="mt-2 text-3xl font-bold sm:text-4xl">Funded Student Outcomes</h2><p className="mt-3 text-sm text-muted-foreground">Aggregated results are shown only for groups of at least three students to protect privacy.</p></div>
    <div className="mt-12 grid gap-5 sm:grid-cols-3">{outcomes.map((item) => <article key={item.course} className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]"><GraduationCap className="h-8 w-8 text-primary" /><h3 className="mt-4 text-base font-semibold">{item.course}</h3><p className="mt-4 text-3xl font-bold text-primary">{item.beneficiaryCount}</p><p className="text-xs uppercase text-muted-foreground">Funded students</p><p className="mt-4 text-sm font-medium">₹{item.totalAwarded.toLocaleString('en-IN')} awarded</p></article>)}</div>
    {!loading && !outcomes.length && <p className="mt-10 rounded-2xl border bg-muted/30 p-10 text-center text-sm text-muted-foreground">Aggregated outcomes will appear after qualifying cohorts are funded.</p>}
  </div></section>;
}
