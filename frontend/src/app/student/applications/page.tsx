'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Filter, Search } from 'lucide-react';
import { ApplicationRow } from '@/components/student/applications/ApplicationRow';
import { applicationApi } from '@/lib/api';
import { applicationRow } from '@/lib/applicationPresentation';
import type { DashboardApplication as Application } from '@/types/dashboard';

const PAGE = 10;
const FILTERS: Array<'All' | Application['status']> = ['All', 'Under Review', 'Pending', 'Funded', 'Rejected'];

export default function ApplicationsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [query, setQuery] = useState('');
  const [shown, setShown] = useState(PAGE);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    applicationApi.getMy()
      .then((response) => setApplications((response.data ?? []).map((item) => applicationRow(item as any))))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => applications.filter((application) => {
    const matchesStatus = filter === 'All' || application.status === filter;
    const search = query.trim().toLowerCase();
    return matchesStatus && (!search || application.scholarship.toLowerCase().includes(search)
      || application.id.toLowerCase().includes(search));
  }), [applications, filter, query]);
  const visible = filtered.slice(0, shown);

  if (loading) return <div className="min-h-screen p-8 text-center text-muted-foreground">Loading applications...</div>;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">My Applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} application{filtered.length === 1 ? '' : 's'} • showing {visible.length}
          </p>
        </div>
        <Link href="/student/scholarships"
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
          + New application
        </Link>
      </header>

      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={(event) => { setQuery(event.target.value); setShown(PAGE); }}
            placeholder="Search by name or ID..."
            className="h-10 w-full rounded-full border border-border bg-muted/40 pl-9 pr-4 text-sm outline-none focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/30" />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
          {FILTERS.map((item) => (
            <button key={item} type="button" onClick={() => { setFilter(item); setShown(PAGE); }}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                filter === item ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground hover:bg-accent'}`}>
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {visible.map((application) => <ApplicationRow key={application.id} app={application} />)}
        {!visible.length && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No applications match your filters.
          </div>
        )}
      </div>

      {shown < filtered.length && (
        <div className="mt-6 flex justify-center">
          <button type="button" onClick={() => setShown((value) => value + PAGE)}
            className="rounded-full border border-border bg-card px-6 py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent">
            Load 10 more ({filtered.length - shown} left)
          </button>
        </div>
      )}
    </main>
  );
}
