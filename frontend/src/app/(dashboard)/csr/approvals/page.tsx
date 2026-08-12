'use client';

import { AlertTriangle, Clock3, Eye, Search, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { screeningApi } from '@/lib/api';
import type { CSRApplicationRow } from '@/types/domain';

function age(value?: string) { if (!value) return { hours: 0, label: 'SLA unavailable' }; const hours = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 3_600_000));
  return { hours, label: hours < 24 ? `${hours}h awaiting sponsor` : `${Math.floor(hours / 24)}d awaiting sponsor` }; }

export default function ApprovalsPage() {
  const [rows, setRows] = useState<CSRApplicationRow[]>([]); const [query, setQuery] = useState('');
  const [pendingTotal, setPendingTotal] = useState(0);
  const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  const load = useCallback(() => { setLoading(true); return Promise.all([screeningApi.getPendingCSR(), screeningApi.getCSRStats()])
    .then(([queue, summary]) => { setRows(queue.data ?? []); setPendingTotal(Number(summary.data?.pending ?? queue.data?.length ?? 0)); setError(''); })
    .catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false)); }, []);
  useEffect(() => { void load(); }, [load]);
  const filtered = useMemo(() => rows.filter((row) => `${row.applicationId} ${row.studentName} ${row.scholarshipName}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => age(b.stageEnteredAt).hours - age(a.stageEnteredAt).hours), [rows, query]);
  const exposure = rows.reduce((sum, row) => sum + Number(row.scholarshipAmount ?? 0), 0);
  const overdue = rows.filter((row) => age(row.stageEnteredAt).hours >= 48).length;
  return <div className="space-y-6"><header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Independent sponsor control</p>
    <h1 className="mt-1 text-3xl font-bold">Funding approvals queue</h1><p className="mt-1 text-sm text-slate-600">Review each cleared case A–Z before committing sponsor funds.</p></div>
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-right"><p className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">Queue exposure</p>
      <p className="text-xl font-bold text-emerald-900">₹{exposure.toLocaleString('en-IN')}</p></div></header>
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3"><Metric label="Awaiting control" value={pendingTotal} /><Metric label="Past 48h SLA" value={overdue} warn={overdue > 0} />
      <Metric label="Policy" value="One-by-one" /></section>
    <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2"><Search size={15} className="text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, scholarship or APP ID" className="w-full text-sm outline-none" /></div>
    {error ? <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
    <section className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm"><div className="flex items-center justify-between border-b bg-pink-50/50 px-5 py-3"><span className="flex items-center gap-2 text-sm font-semibold text-emerald-800"><ShieldCheck size={16} />Showing {filtered.length} of {pendingTotal} pending</span>
      <span className="text-[10px] text-slate-500">Oldest first · no bulk approval</span></div><div className="divide-y">{filtered.map((row) => { const waiting = age(row.stageEnteredAt); return <div key={row.applicationId}
        className="grid gap-3 p-4 transition hover:bg-emerald-50/30 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_120px_150px_130px] md:items-center"><div><b className="text-sm">{row.studentName}</b>
        <p className="text-[10px] text-slate-500">APP-{row.applicationId} · {row.course ?? 'Course not added'} · {row.studentState ?? 'State not added'}</p></div><div><b className="text-xs text-slate-700">{row.scholarshipName}</b>
        <p className="text-[10px] text-slate-500">{row.institutionName ?? 'Institution not added'}</p></div><span className="text-xs font-bold">{row.previousYearMarks != null ? `${row.previousYearMarks}% merit` : 'Merit —'}</span>
        <span className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${waiting.hours >= 48 ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>{waiting.hours >= 48 ? <AlertTriangle size={11} /> : <Clock3 size={11} />}{waiting.label}</span>
        <Link href={`/csr/applications/${row.applicationId}`} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white"><Eye size={13} />Review A–Z</Link></div>; })}
        {!filtered.length && !loading ? <p className="p-12 text-center text-sm text-slate-400">No applications awaiting sponsor approval.</p> : null}{loading ? <p className="p-12 text-center text-sm text-slate-400">Loading approval queue…</p> : null}</div></section>
  </div>;
}

function Metric({ label, value, warn }: { label: string; value: string | number; warn?: boolean }) { return <div className={`rounded-xl border bg-white p-4 ${warn ? 'border-rose-200' : ''}`}><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className={`mt-1 text-xl font-bold ${warn ? 'text-rose-700' : ''}`}>{value}</p></div>; }
