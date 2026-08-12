'use client';

import { AlertTriangle, ArrowUpRight, ChevronLeft, ChevronRight, Search, Users } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { supportApi } from '@/lib/api';
import type { SupportStudentRow } from '@/types/support';

export default function SupportStudents() {
  const params = useSearchParams(); const initial = params.get('query') ?? '';
  const [query, setQuery] = useState(initial); const [submitted, setSubmitted] = useState(initial);
  const [attention, setAttention] = useState(params.get('attention') === 'true'); const [page, setPage] = useState(1);
  const [rows, setRows] = useState<SupportStudentRow[]>([]); const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { const response = await supportApi.students(submitted, page, 25); setRows(response.data?.data ?? []); setTotal(response.data?.pagination.total ?? 0); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Student directory could not be loaded.'); }
    finally { setLoading(false); }
  }, [page, submitted]);
  useEffect(() => { void load(); }, [load]);
  const visible = useMemo(() => attention ? rows.filter((row) => row.completion < 100 || ['Draft', 'NotStarted'].includes(row.status)) : rows, [attention, rows]);
  const pages = Math.max(1, Math.ceil(total / 25));

  return <div className="mx-auto max-w-[1500px] space-y-5">
    <header><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-600">Privacy-safe directory</p>
      <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold"><Users size={26} />Student support records</h1>
      <p className="mt-1 text-sm text-slate-500">Profile readiness, latest stage and exact missing sections—without Aadhaar or bank details.</p></header>

    <section className="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      <form onSubmit={(event) => { event.preventDefault(); setPage(1); setSubmitted(query.trim()); }} className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, masked email or student ID" className="h-9 w-full rounded-xl border bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-amber-400" />
      </form>
      <button onClick={() => setAttention((value) => !value)} className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${attention
        ? 'bg-rose-600 text-white' : 'border border-slate-200 bg-white text-slate-600'}`}><AlertTriangle size={14} />Needs attention only</button>
      <span className="text-xs text-slate-500">{total.toLocaleString('en-IN')} students</span>
    </section>

    {error ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="hidden grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_150px_170px_120px_32px] gap-3 border-b bg-slate-50 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 lg:grid">
        <span>Student</span><span>Latest application</span><span>Location</span><span>Profile readiness</span><span>Primary gap</span><span />
      </div>
      <div className="divide-y">{visible.map((row) => <Link key={row.studentId} href={`/support/students/${row.studentId}`}
        className="grid gap-3 px-5 py-4 transition hover:bg-amber-50/30 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_150px_170px_120px_32px] lg:items-center">
        <div className="min-w-0"><div className="flex items-center gap-2"><b className="truncate text-sm">{row.name}</b><span className="font-mono text-[9px] text-slate-400">STU-{row.studentId}</span></div>
          <p className="truncate text-[11px] text-slate-500">{row.email} · {row.phone}</p></div>
        <div><b className="text-xs text-slate-700">{row.applicationId ? `APP-${row.applicationId}` : 'Not started'}</b><p className="text-[10px] text-slate-500">{row.status}</p></div>
        <span className="text-xs text-slate-600">{row.state || 'Not added'}</span>
        <div><div className="flex justify-between text-[10px] text-slate-500"><span>Complete</span><b>{row.completion}%</b></div><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full rounded-full ${row.completion === 100 ? 'bg-emerald-500' : row.completion < 50 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${row.completion}%` }} /></div></div>
        <span className="truncate rounded-lg bg-slate-100 px-2 py-1 text-center text-[10px] font-semibold text-slate-600" title={row.missing.join(', ')}>{row.missing[0] ?? 'Ready'}</span>
        <ArrowUpRight size={15} className="text-slate-300" />
      </Link>)}{!visible.length && !loading ? <p className="p-12 text-center text-sm text-slate-400">No students match this view.</p> : null}
      {loading ? <div className="space-y-2 p-5">{Array.from({ length: 7 }, (_, index) => <div key={index} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}</div> : null}</div>
      <div className="flex items-center justify-between border-t px-5 py-3 text-xs text-slate-500"><span>Page {page} of {pages}</span><div className="flex gap-2">
        <button disabled={page === 1 || loading} onClick={() => setPage((value) => value - 1)} className="rounded-lg border p-2 disabled:opacity-30" aria-label="Previous page"><ChevronLeft size={14} /></button>
        <button disabled={page === pages || loading} onClick={() => setPage((value) => value + 1)} className="rounded-lg border p-2 disabled:opacity-30" aria-label="Next page"><ChevronRight size={14} /></button>
      </div></div>
    </section>
  </div>;
}
