'use client';

import { Activity, AlertTriangle, CheckCircle2, Clock3, Radio, Search, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '@/lib/api/admin';
import DataPagination from '@/components/shared/DataPagination';
import { mapAuditEvent, type AuditEventView, type AuditTone } from '@/lib/auditPresentation';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const toneStyle: Record<AuditTone, string> = { ok: 'border-emerald-200 bg-emerald-50 text-emerald-800', warn: 'border-amber-200 bg-amber-50 text-amber-800', info: 'border-blue-200 bg-blue-50 text-blue-800', danger: 'border-rose-200 bg-rose-50 text-rose-800' };
const toneIcon = { ok: CheckCircle2, warn: AlertTriangle, info: Activity, danger: AlertTriangle };

export default function LiveUpdatesPage() {
  const [events, setEvents] = useState<AuditEventView[]>([]); const [query, setQuery] = useState(''); const debouncedQuery = useDebouncedValue(query);
  const [tone, setTone] = useState<'all' | AuditTone>('all'); const [error, setError] = useState(''); const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true); const [page, setPage] = useState(1); const [limit, setLimit] = useState(25); const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({ ok: 0, warn: 0, info: 0, danger: 0 });
  const load = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (tone !== 'all') params.set('tone', tone); if (debouncedQuery.trim()) params.set('search', debouncedQuery.trim());
    setLoading(true);
    try { const response = await adminApi.getAuditEvents(params.toString()); setEvents((response.data?.events ?? []).map(mapAuditEvent)); setTotal(Number(response.data?.pagination?.total ?? 0)); setCounts(response.data?.facets ?? { ok: 0, warn: 0, info: 0, danger: 0 }); setUpdatedAt(new Date()); setError(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Audit events could not be loaded.'); }
    finally { setLoading(false); }
  }, [debouncedQuery, limit, page, tone]);
  useEffect(() => { void load(); const timer = window.setInterval(() => void load(), 15_000); return () => window.clearInterval(timer); }, [load]);

  return <div className="mx-auto max-w-7xl space-y-5"><header className="flex flex-wrap items-end justify-between gap-3"><div><div className="flex items-center gap-2"><h1 className="text-2xl font-semibold">Platform activity</h1><span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />LIVE</span></div><p className="mt-1 text-sm text-slate-500">Server-paginated immutable administrative and workflow history.</p></div><p className="flex items-center gap-1.5 text-xs text-slate-400"><Clock3 className="h-3.5 w-3.5" />Updated {updatedAt ? updatedAt.toLocaleTimeString('en-IN') : '—'}</p></header>
    {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">{([['Successful', counts.ok, 'ok'], ['Attention', counts.warn, 'warn'], ['Information', counts.info, 'info'], ['Critical', counts.danger, 'danger']] as Array<[string, number, AuditTone]>).map(([label, count, itemTone]) => <button key={itemTone} onClick={() => { setTone(tone === itemTone ? 'all' : itemTone); setPage(1); }} className={`rounded-2xl border p-4 text-left transition ${tone === itemTone ? toneStyle[itemTone] : 'bg-white hover:bg-slate-50'}`}><p className="text-[10px] font-bold uppercase tracking-wider">{label}</p><p className="mt-1 text-2xl font-bold">{count}</p></button>)}</section>
    <section className="overflow-hidden rounded-2xl border bg-white shadow-sm"><header className="flex flex-wrap items-center gap-3 border-b p-4"><Radio className="h-4 w-4" /><div><h2 className="text-sm font-semibold">Audit timeline</h2><p className="text-[11px] text-slate-400">{events.length} on page · {total} results</p></div><div className="relative ml-auto w-full sm:w-80"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search actor, action, reason, request ID…" className="h-9 w-full rounded-xl border bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-slate-400" /></div></header>
      {loading && <div className="h-1 bg-slate-100"><div className="h-full w-1/3 animate-pulse bg-slate-500" /></div>}
      <ol className="divide-y">{events.map((event) => { const Icon = toneIcon[event.tone]; return <li key={event.id} className="p-4 transition hover:bg-slate-50/70"><div className="flex items-start gap-3"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${toneStyle[event.tone]}`}><Icon className="h-4 w-4" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-2 gap-y-1"><p className="text-sm"><b>{event.actor}</b> <span className="text-slate-600">{event.action}</span></p><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{event.target}</span></div><p className="mt-1 text-xs leading-5 text-slate-600">{event.summary}</p><div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400"><span>{event.role}</span><span>{event.time}</span>{event.ipAddress && <span>IP {event.ipAddress}</span>}{event.requestId && <span className="font-mono">Request {event.requestId}</span>}</div></div><ShieldCheck className="h-4 w-4 shrink-0 text-slate-300" /></div></li>; })}{!events.length && !loading && <li className="p-12 text-center text-sm text-slate-400">No audit events match these filters.</li>}</ol>
    </section>
    {total > 0 && <DataPagination page={page} limit={limit} total={total} loading={loading} pageSizes={[25, 50, 100]} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1); }} />}
  </div>;
}
