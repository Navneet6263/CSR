'use client';

import { ArrowUpRight, History, Search } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ScreenerHeader } from '@/components/screener/ScreenerHeader';
import DataPagination from '@/components/shared/DataPagination';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { screeningApi } from '@/lib/api';
import type { ScreeningApplicationRow } from '@/types/domain';

export default function HistoryPage() {
  const [rows, setRows] = useState<ScreeningApplicationRow[]>([]); const [query, setQuery] = useState('');
  const [decision, setDecision] = useState('All'); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [page, setPage] = useState(1); const [limit, setLimit] = useState(12); const [total, setTotal] = useState(0);
  const debouncedQuery = useDebouncedValue(query, 160);
  const load = useCallback(() => {
    setLoading(true); const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (debouncedQuery) params.set('search', debouncedQuery); if (decision !== 'All') params.set('decision', decision);
    screeningApi.getHistory(params.toString()).then((response) => {
      setRows(response.data?.applications ?? []); setTotal(response.data?.pagination?.total ?? 0); setError('');
    }).catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false));
  }, [debouncedQuery, decision, limit, page]);
  useEffect(() => { load(); }, [load]);

  return <div className="screener-theme min-h-screen"><ScreenerHeader /><main className="mx-auto max-w-[1400px] space-y-5 px-4 py-6 sm:px-6 sm:py-8">
    <section className="glass-card flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold"><History className="h-3.5 w-3.5" />Audit trail</p><h1 className="mt-2 text-3xl font-semibold text-text">My decisions history</h1><p className="mt-1 text-xs text-text-muted">Signed recommendations and their current downstream status.</p></div><div className="sm:text-right"><p className="font-display text-3xl font-semibold text-text">{total}</p><p className="text-[9px] uppercase tracking-wider text-text-dim">Recorded decisions</p></div></section>
    {error ? <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</p> : null}
    <section className="glass-card overflow-hidden"><div className="flex flex-col gap-3 border-b border-border-soft p-4 sm:flex-row sm:items-center sm:justify-between"><div className="relative w-full sm:max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-text-dim" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search student, APP ID or rationale" className="w-full rounded-lg border border-brand/10 bg-brand/5 py-2 pl-9 pr-3 text-xs outline-none focus:border-brand/40" /></div><div className="flex gap-1">{['All', 'Approve', 'Returned', 'Reject'].map((value) => <button key={value} onClick={() => { setDecision(value); setPage(1); }} className={`rounded-md px-3 py-1.5 text-[10px] font-semibold ${decision === value ? 'bg-brand text-white' : 'border border-brand/10 bg-brand/5 text-text-muted'}`}>{value}</button>)}</div></div>
      <div className="divide-y divide-border-soft">{loading ? <div className="animate-pulse p-8"><div className="h-4 w-1/3 rounded bg-brand/10" /></div> : rows.map((row) => <Link key={`${row.applicationId}-${row.decisionAt}`} href={`/screener/evaluate/${row.applicationId}`} className="group grid gap-3 p-4 transition hover:bg-brand/[0.03] sm:grid-cols-[110px_minmax(0,1fr)_120px_160px_150px_20px] sm:items-center"><span className="font-mono text-[10px] font-semibold text-brand">APP-{row.applicationId}</span><span className="min-w-0"><b className="block truncate text-xs text-text">{row.studentName}</b><span className="block truncate text-[9px] text-text-dim">{row.scholarshipName}</span>{row.decisionNotes ? <span className="mt-1 block truncate text-[9px] text-text-muted">{row.decisionNotes}</span> : null}</span><span><Decision value={row.decision} /></span><span className="text-[10px] text-text-muted">{row.decisionAt ? dateTime(row.decisionAt) : 'Date unavailable'}</span><span className="text-[9px] font-semibold text-text-dim">{row.status}</span><ArrowUpRight size={13} className="text-text-dim group-hover:text-brand" /></Link>)}{!loading && !rows.length ? <div className="py-14 text-center"><History className="mx-auto text-text-dim" size={22} /><p className="mt-2 text-xs text-text-dim">No matching decisions.</p></div> : null}</div>
    </section>
    <DataPagination page={page} limit={limit} total={total} loading={loading} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1); }} />
  </main></div>;
}

function Decision({ value }: { value?: ScreeningApplicationRow['decision'] }) { const returned = value?.startsWith('Return'); const label = value === 'ReturnDocument' ? 'To documents' : value === 'ReturnBackground' ? 'To background' : value ?? 'Recorded'; return <span className={`rounded-full px-2 py-1 text-[9px] font-semibold ${value === 'Approve' ? 'bg-success/10 text-success' : returned ? 'bg-gold/10 text-gold' : 'bg-danger/10 text-danger'}`}>{label}</span>; }
function dateTime(value: string) { return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }); }
