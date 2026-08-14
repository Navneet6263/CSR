'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { QueueTable } from '@/components/reviewer/QueueTable';
import { ReviewerStats, StatsGrid } from '@/components/reviewer/StatsGrid';
import { TopNav } from '@/components/reviewer/TopNav';
import { authApi, verificationApi } from '@/lib/api';
import type { ReviewApplicationRow } from '@/types/domain';
import DataPagination from '@/components/shared/DataPagination';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export default function ReviewerDashboard() {
  const [queue, setQueue] = useState<ReviewApplicationRow[]>([]);
  const [stats, setStats] = useState<ReviewerStats>({});
  const [name, setName] = useState('');
  const [query, setQuery] = useState(''); const debouncedQuery = useDebouncedValue(query, 160);
  const [page, setPage] = useState(1); const [limit, setLimit] = useState(12); const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(() => {
    const user = authApi.getUser();
    setName(user?.fullName ?? '');
    setLoading(true); setError('');
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (debouncedQuery) params.set('search', debouncedQuery);
    Promise.all([verificationApi.getPendingDocs(params.toString()), verificationApi.getReviewerStats()])
      .then(([queueResponse, statsResponse]) => {
        setQueue(queueResponse.data?.applications ?? []); setTotal(queueResponse.data?.pagination?.total ?? 0);
        setStats((statsResponse.data ?? {}) as ReviewerStats);
      }).catch((reason: Error) => setError(reason.message || 'Audit queue could not be loaded.'))
      .finally(() => setLoading(false));
  }, [debouncedQuery, limit, page]);
  useEffect(() => { load(); }, [load]);
  return <div className="min-h-screen bg-bg pb-16 text-fg">
    <TopNav />
    <main className="mx-auto mt-8 max-w-[1600px] px-6"><div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4"><div>
        <div className="text-xs font-mono uppercase tracking-widest text-primary">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
        <h1 className="mt-2 text-3xl font-display font-bold">Good morning{name ? `, ${name.split(' ')[0]}` : ''}</h1>
        <p className="mt-1 text-sm text-fg-muted">You have <span className="font-semibold text-primary">
          {stats.pendingReview ?? queue.length} applications</span> waiting for document verification.</p>
      </div><button onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-fg-muted"><RefreshCw size={13} className={loading ? 'animate-spin' : ''} />Refresh queue</button></div>
      {error ? <div role="alert" className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</div> : null}
      <StatsGrid stats={stats} />
      <QueueTable applications={queue} query={query} onQueryChange={(value) => { setQuery(value); setPage(1); }} />
      <DataPagination page={page} limit={limit} total={total} loading={loading} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1); }} />
    </div></main>
  </div>;
}
