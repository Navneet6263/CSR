'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Filter, Search } from 'lucide-react';
import { ApplicationRow } from '@/components/student/applications/ApplicationRow';
import DataPagination from '@/components/shared/DataPagination';
import { applicationApi } from '@/lib/api';
import { applicationRow } from '@/lib/applicationPresentation';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { DashboardApplication as Application } from '@/types/dashboard';

const FILTERS: Array<'All' | Application['status']> = ['All', 'Under Review', 'Pending', 'Funded', 'Rejected'];

export default function ApplicationsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [query, setQuery] = useState(''); const debouncedQuery = useDebouncedValue(query);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [page, setPage] = useState(1); const [limit, setLimit] = useState(10); const [total, setTotal] = useState(0);

  useEffect(() => {
    let active = true; setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filter !== 'All') params.set('bucket', filter);
    if (debouncedQuery.trim()) params.set('search', debouncedQuery.trim());
    applicationApi.getMy(params.toString()).then((response) => {
      if (!active) return;
      setApplications((response.data?.applications ?? []).map((item) => applicationRow(item as any)));
      setTotal(Number(response.data?.pagination?.total ?? 0)); setError('');
    }).catch((reason) => {
      if (active) { setApplications([]); setTotal(0); setError(reason instanceof Error ? reason.message : 'Applications could not be loaded.'); }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [debouncedQuery, filter, limit, page]);

  if (loading && !applications.length) return <div className="min-h-screen p-8 text-center text-muted-foreground">Loading applications...</div>;

  return <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3"><div>
      <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">My Applications</h1>
      <p className="mt-1 text-sm text-muted-foreground">{total} application{total === 1 ? '' : 's'} · {applications.length} on this page</p>
    </div><Link href="/student/scholarships" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">+ New application</Link></header>

    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 sm:flex-row sm:items-center">
      <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search by scholarship name or application ID…"
          className="h-10 w-full rounded-full border border-border bg-muted/40 pl-9 pr-4 text-sm outline-none focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/30" />
      </div><div className="flex items-center gap-1.5 overflow-x-auto"><Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
        {FILTERS.map((item) => <button key={item} type="button" onClick={() => { setFilter(item); setPage(1); }} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${filter === item ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground hover:bg-accent'}`}>{item}</button>)}
      </div>
    </div>

    {error && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    {loading && <div className="mb-4 h-1 overflow-hidden rounded-full bg-muted"><div className="h-full w-1/3 animate-pulse bg-primary" /></div>}
    <div className="space-y-3">{applications.map((application) => <ApplicationRow key={application.id} app={application} />)}
      {!applications.length && !loading && <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No applications match your filters.</div>}
    </div>
    {total > 0 && <div className="mt-6"><DataPagination page={page} limit={limit} total={total} loading={loading} pageSizes={[10, 20, 50]} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1); }} /></div>}
  </main>;
}
