'use client';

import { Activity, AlertOctagon, Clock3, FileWarning, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { supportApi } from '@/lib/api';
import type { SupportActivity } from '@/types/support';
import DataPagination from '@/components/shared/DataPagination';

const styles: Record<string, { label: string; className: string; icon: typeof Activity }> = {
  UploadError: { label: 'Upload blocked', className: 'border-rose-200 bg-rose-50 text-rose-700', icon: FileWarning },
  ValidationError: { label: 'Validation blocker', className: 'border-amber-200 bg-amber-50 text-amber-700', icon: AlertOctagon },
  HelpRequested: { label: 'Help requested', className: 'border-purple-200 bg-purple-50 text-purple-700', icon: AlertOctagon },
  PageView: { label: 'Page activity', className: 'border-slate-200 bg-slate-50 text-slate-600', icon: Activity },
};

export default function SupportActivityPage() {
  const [rows, setRows] = useState<SupportActivity[]>([]); const [errorsOnly, setErrorsOnly] = useState(true);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [page, setPage] = useState(1); const [limit, setLimit] = useState(12); const [total, setTotal] = useState(0); const [counts, setCounts] = useState({ blocked: 0, help: 0, active: 0 });
  const load = useCallback(async () => { setLoading(true); setError(''); try { const response = await supportApi.activity(page, limit, errorsOnly); setRows(response.data?.activities ?? []); setTotal(response.data?.pagination?.total ?? 0); setCounts(response.data?.facets ?? { blocked: 0, help: 0, active: 0 }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Activity could not be loaded.'); } finally { setLoading(false); } }, [errorsOnly, limit, page]);
  useEffect(() => { void load(); const timer = setInterval(() => void load(), 30_000); return () => clearInterval(timer); }, [load]);

  return <div className="mx-auto max-w-[1500px] space-y-5"><header className="flex flex-wrap items-end justify-between gap-3"><div>
    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-600">Privacy-safe telemetry</p><h1 className="mt-1 flex items-center gap-2 text-3xl font-bold"><Activity size={27} />Live student blockers</h1>
    <p className="mt-1 text-sm text-slate-500">Page, step and error codes only. No keystrokes, documents or sensitive values.</p></div>
    <button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-xs font-bold"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} />Refresh</button></header>
    <section className="grid grid-cols-3 gap-3"><Metric label="Blocked events" value={counts.blocked} tone="rose" /><Metric label="Help requested" value={counts.help} tone="purple" /><Metric label="Active students" value={counts.active} tone="emerald" /></section>
    <div className="flex items-center justify-between rounded-2xl border bg-white p-4"><div><b className="text-sm">Operational event stream</b><p className="text-[10px] text-slate-500">Newest events first · refreshes every 30 seconds</p></div>
      <button onClick={() => { setErrorsOnly((value) => !value); setPage(1); }} className={`rounded-lg px-3 py-2 text-xs font-bold ${errorsOnly ? 'bg-slate-950 text-white' : 'border text-slate-600'}`}>Blockers only</button></div>
    {error ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
    <section className="grid gap-3 lg:grid-cols-2">{rows.map((row) => { const style = styles[row.EventType] ?? styles.PageView; const Icon = style.icon;
      return <div key={row.ActivityID} className={`rounded-2xl border p-4 ${style.className}`}><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/70"><Icon size={18} /></span>
        <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><b className="truncate text-sm">{row.FullName}</b><span className="font-mono text-[9px] opacity-60">U-{row.UserID}</span>
          <span className="ml-auto rounded-full bg-white/60 px-2 py-0.5 text-[9px] font-bold">{style.label}</span></div><p className="mt-1 text-xs font-semibold">{row.PageCode}{row.StepCode ? ` · ${row.StepCode}` : ''}</p>
          <div className="mt-2 flex items-center justify-between gap-2 text-[10px] opacity-70"><span>{row.ErrorCode || 'No error code'}</span><span className="inline-flex items-center gap-1"><Clock3 size={10} />{new Date(row.OccurredAt).toLocaleString('en-IN')}</span></div></div></div></div>; })}
      {!rows.length && !loading ? <p className="col-span-full rounded-2xl border border-dashed bg-white p-12 text-center text-sm text-slate-400">No events match this view yet.</p> : null}</section>
    <DataPagination page={page} limit={limit} total={total} loading={loading} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1); }} />
  </div>;
}

function Metric({ label, value, tone }: { label: string; value: number; tone: string }) { const color: Record<string, string> = { rose: 'text-rose-700', purple: 'text-purple-700', emerald: 'text-emerald-700' };
  return <div className="rounded-2xl border bg-white p-4 shadow-sm"><p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{label}</p><p className={`mt-1 text-3xl font-bold ${color[tone]}`}>{value}</p></div>; }
