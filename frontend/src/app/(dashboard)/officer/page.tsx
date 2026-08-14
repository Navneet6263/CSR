'use client';

import { CheckCircle2, Clock3, ListChecks, RefreshCw, ShieldCheck, UserCheck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { OfficerActivity, VerificationProtocol } from '@/components/officer/OfficerActivity';
import { OfficerQueue } from '@/components/officer/OfficerQueue';
import { StatCard } from '@/components/officer/StatsCards';
import { TopNav } from '@/components/officer/TopNav';
import { authApi, verificationApi } from '@/lib/api';
import type { BGCheckApplicationRow } from '@/types/domain';
import type { OfficerLog, OfficerStats } from '@/types/officer';
import DataPagination from '@/components/shared/DataPagination';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const emptyStats: OfficerStats = { pending: 0, assigned: 0, available: 0, completed: 0, today: 0, overdue: 0 };

export default function OfficerDashboard() {
  const [rows, setRows] = useState<BGCheckApplicationRow[]>([]);
  const [stats, setStats] = useState<OfficerStats>(emptyStats);
  const [logs, setLogs] = useState<OfficerLog[]>([]);
  const [query, setQuery] = useState(''); const debouncedQuery = useDebouncedValue(query, 160);
  const [page, setPage] = useState(1); const [limit, setLimit] = useState(12); const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const user = authApi.getUser();
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (debouncedQuery) params.set('search', debouncedQuery);
      const [queue, summary, activity] = await Promise.all([
        verificationApi.getPendingBGChecks(params.toString()), verificationApi.getOfficerStats(), verificationApi.getOfficerLogs('page=1&limit=5'),
      ]);
      setRows(queue.data?.applications ?? []); setTotal(queue.data?.pagination?.total ?? 0); setStats(summary.data ?? emptyStats); setLogs(activity.data?.logs ?? []);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Field workload could not be loaded.'); }
    finally { setLoading(false); }
  }, [debouncedQuery, limit, page]);
  useEffect(() => { void load(); }, [load]);

  return <div className="flex min-h-screen flex-col bg-slate-50/50"><TopNav />
    <main className="mx-auto w-full max-w-[1400px] space-y-5 px-4 py-6 lg:px-8 lg:py-8">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 via-sky-600 to-slate-900 p-5 text-white shadow-lg shadow-cyan-900/10 sm:p-7">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-100"><ShieldCheck size={14} />Field verification desk</div>
          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">Good day{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}</h1>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-cyan-50/80 sm:text-sm">Review assigned student records, validate evidence and complete the three independent field checks.</p></div>
          <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex w-fit items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold ring-1 ring-white/20 backdrop-blur hover:bg-white/20 disabled:opacity-60"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} />Refresh workload</button></div>
      </section>

      {error ? <div role="alert" className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><span>{error}</span><button onClick={() => void load()} className="text-xs font-bold underline">Retry</button></div> : null}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={ListChecks} label="Actionable cases" value={stats.pending} help={`${stats.available} available to claim`} tone="cyan" />
        <StatCard icon={UserCheck} label="Assigned to you" value={stats.assigned} help="Continue open visits" tone="emerald" />
        <StatCard icon={CheckCircle2} label="Cases handled" value={stats.completed} help={`${stats.today} touched today`} tone="amber" />
        <StatCard icon={Clock3} label="Past 48h SLA" value={stats.overdue} help="Oldest cases first" tone="rose" />
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-3"><OfficerQueue rows={rows} userId={user?.userId} loading={loading} query={query} onQueryChange={(value) => { setQuery(value); setPage(1); }} />
          <DataPagination page={page} limit={limit} total={total} loading={loading} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1); }} /></div>
        <aside className="space-y-5"><OfficerActivity rows={logs} /><VerificationProtocol /></aside>
      </div>
    </main>
  </div>;
}
