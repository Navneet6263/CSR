'use client';

import { CheckCircle2, ClipboardList, Clock3, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { ScreeningActivity, ScreeningControlsGuide } from '@/components/screener/ScreeningActivity';
import { ScreeningQueue } from '@/components/screener/ScreeningQueue';
import { ScreenerHeader } from '@/components/screener/ScreenerHeader';
import { StatCard } from '@/components/screener/StatCard';
import { authApi, screeningApi } from '@/lib/api';
import type { ScreeningApplicationRow } from '@/types/domain';
import type { ScreenerStats } from '@/types/screening';
import DataPagination from '@/components/shared/DataPagination';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const emptyStats: ScreenerStats = { pending: 0, assigned: 0, available: 0, approved: 0, rejected: 0, returned: 0,
  totalReviewed: 0, today: 0, overdue: 0, approvalRate: 0 };

export default function ScreenerDashboard() {
  const [rows, setRows] = useState<ScreeningApplicationRow[]>([]); const [history, setHistory] = useState<ScreeningApplicationRow[]>([]);
  const [stats, setStats] = useState<ScreenerStats>(emptyStats); const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 160); const [page, setPage] = useState(1); const [limit, setLimit] = useState(12); const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const user = authApi.getUser();
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) }); if (debouncedQuery) params.set('search', debouncedQuery);
      const [queue, summary, decisions] = await Promise.all([
        screeningApi.getPendingScreening(params.toString()), screeningApi.getStats(), screeningApi.getHistory('page=1&limit=5'),
      ]);
      setRows(queue.data?.applications ?? []); setTotal(queue.data?.pagination?.total ?? 0); setStats(summary.data ?? emptyStats); setHistory(decisions.data?.applications ?? []);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Screening workload could not be loaded.'); }
    finally { setLoading(false); }
  }, [debouncedQuery, limit, page]);
  useEffect(() => { const initial = new URLSearchParams(window.location.search).get('search') ?? ''; if (initial) setQuery(initial); }, []);
  useEffect(() => { void load(); }, [load]);

  return <div className="screener-theme flex min-h-screen flex-col"><ScreenerHeader /><main className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-6 sm:px-6 sm:py-8">
    <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold"><Sparkles className="h-3.5 w-3.5" />Merit command center</p><h1 className="mt-2 text-3xl font-semibold text-text sm:text-4xl">Welcome{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}.</h1><p className="mt-1 text-sm text-text-muted">Review verified evidence and issue an independent scholarship recommendation.</p></div>
      <button onClick={() => void load()} disabled={loading} className="inline-flex w-fit items-center gap-2 rounded-lg border border-brand/10 bg-brand/5 px-3 py-2 text-xs font-semibold text-text-muted hover:bg-brand/10 disabled:opacity-50"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} />Refresh workload</button></section>
    {error ? <div role="alert" className="flex items-center justify-between rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger"><span>{error}</span><button onClick={() => void load()} className="text-xs font-semibold underline">Retry</button></div> : null}
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard label="Actionable" value={stats.pending} delta={`${stats.available} available`} icon={ClipboardList} tone="brand" /><StatCard label="Assigned to you" value={stats.assigned} delta="Open reviews" icon={CheckCircle2} tone="success" /><StatCard label="Past 24h SLA" value={stats.overdue} delta="Priority first" icon={Clock3} tone="danger" /><StatCard label="Total reviewed" value={stats.totalReviewed} delta={`${stats.approvalRate}% approval`} icon={TrendingUp} tone="gold" /></section>
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_330px]"><div className="space-y-3"><ScreeningQueue rows={rows} userId={user?.userId} loading={loading} query={query} onQueryChange={(value) => { setQuery(value); setPage(1); }} /><DataPagination page={page} limit={limit} total={total} loading={loading} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1); }} /></div><aside className="space-y-5"><ScreeningActivity rows={history} /><ScreeningControlsGuide /></aside></div>
  </main></div>;
}
