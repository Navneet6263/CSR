'use client';

import { ArrowUpRight, History, Search } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { TopNav } from '@/components/officer/TopNav';
import DataPagination from '@/components/shared/DataPagination';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { verificationApi } from '@/lib/api';
import type { OfficerLog } from '@/types/officer';

export default function OfficerHistory() {
  const [rows, setRows] = useState<OfficerLog[]>([]); const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All'); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [page, setPage] = useState(1); const [limit, setLimit] = useState(12); const [total, setTotal] = useState(0);
  const debouncedQuery = useDebouncedValue(query, 160);
  const load = useCallback(() => {
    setLoading(true); const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (debouncedQuery) params.set('search', debouncedQuery); if (status !== 'All') params.set('status', status);
    verificationApi.getOfficerLogs(params.toString()).then((response) => {
      setRows(response.data?.logs ?? []); setTotal(response.data?.pagination?.total ?? 0); setError('');
    }).catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false));
  }, [debouncedQuery, limit, page, status]);
  useEffect(() => { load(); }, [load]);

  return <div className="min-h-screen bg-slate-50/50"><TopNav /><main className="mx-auto max-w-[1400px] space-y-5 px-4 py-6 lg:px-8 lg:py-8">
    <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-700">Audit record</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Verification history</h1><p className="mt-1 text-xs text-slate-500">Every result recorded under your secure officer ID.</p></div><div className="text-left sm:text-right"><p className="text-2xl font-bold text-slate-900">{total}</p><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Recorded checks</p></div></section>
    {error ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="relative w-full sm:max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search student, APP ID or check" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs outline-none focus:border-cyan-400" /></div>
        <div className="flex gap-1">{['All', 'Pass', 'Fail', 'Inconclusive'].map((value) => <button key={value} onClick={() => { setStatus(value); setPage(1); }} className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold ${status === value ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{value}</button>)}</div></div>
      <div className="divide-y divide-slate-100">{loading ? <div className="animate-pulse p-8"><div className="h-4 w-1/3 rounded bg-slate-100" /></div> : rows.map((row) => <Link key={row.logId} href={`/officer/applications/${row.appId}`} className="group grid gap-3 p-4 transition hover:bg-cyan-50/30 sm:grid-cols-[120px_minmax(0,1fr)_170px_110px_160px_20px] sm:items-center">
        <span className="font-mono text-[10px] font-bold text-cyan-700">APP-{row.appId}</span><span className="min-w-0"><b className="block truncate text-xs text-slate-800">{row.studentName}</b><span className="block truncate text-[10px] text-slate-400">{row.scholarshipName ?? 'Scholarship application'}</span></span><span className="text-xs font-medium text-slate-600">{label(row.actionType)}</span><span><Status value={row.status} /></span><span className="text-[10px] text-slate-500">{dateTime(row.timestamp)}</span><ArrowUpRight size={13} className="text-slate-300 group-hover:text-cyan-600" /></Link>)}
        {!loading && !rows.length ? <div className="py-14 text-center"><History className="mx-auto text-slate-300" size={22} /><p className="mt-2 text-xs text-slate-400">No matching checks recorded.</p></div> : null}</div>
    </section>
    <DataPagination page={page} limit={limit} total={total} loading={loading} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1); }} />
  </main></div>;
}

function Status({ value }: { value: OfficerLog['status'] }) { const tone = value === 'Pass' ? 'bg-emerald-50 text-emerald-700' : value === 'Fail' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'; return <span className={`rounded-full px-2 py-1 text-[9px] font-bold ${tone}`}>{value}</span>; }
function label(value: string) { return value === 'IncomeVerification' ? 'Income verification' : value; }
function dateTime(value: string) { return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }); }
