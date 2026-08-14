'use client';

import { ArrowUpRight, Clock3, MapPin, RotateCcw, Search, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { BGCheckApplicationRow } from '@/types/domain';

type Filter = 'All' | 'Available' | 'Mine' | 'In progress';
const filters: Filter[] = ['All', 'Available', 'Mine', 'In progress'];

export function OfficerQueue({ rows, userId, loading, query, onQueryChange }: { rows: BGCheckApplicationRow[]; userId?: number; loading: boolean; query: string; onQueryChange: (value: string) => void }) {
  const [filter, setFilter] = useState<Filter>('All');
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matches = !needle || [row.applicationId, row.studentName, row.scholarshipName, row.city, row.state]
        .some((value) => String(value ?? '').toLowerCase().includes(needle));
      const category = filter === 'All' || (filter === 'Available' && !row.assignedOfficerId)
        || (filter === 'Mine' && row.assignedOfficerId === userId)
        || (filter === 'In progress' && row.completedChecks > 0);
      return matches && category;
    });
  }, [filter, query, rows, userId]);

  return <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
    <div className="border-b border-slate-100 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-700">Live workload</p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">Verification queue</h2></div>
        <div className="relative w-full sm:w-72"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search student, APP ID, city"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs outline-none focus:border-cyan-400 focus:bg-white" /></div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">{filters.map((item) => <button key={item} onClick={() => setFilter(item)}
        className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${filter === item ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{item}</button>)}</div>
    </div>
    <div className="divide-y divide-slate-100">
      {loading ? Array.from({ length: 3 }, (_, index) => <div key={index} className="animate-pulse p-5"><div className="h-4 w-1/3 rounded bg-slate-100" /><div className="mt-3 h-3 w-2/3 rounded bg-slate-100" /></div>) : null}
      {!loading && visible.map((row) => <QueueRow key={row.applicationId} row={row} mine={row.assignedOfficerId === userId} />)}
      {!loading && !visible.length ? <div className="px-5 py-14 text-center"><div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-cyan-50 text-cyan-600"><Search size={18} /></div>
        <p className="mt-3 text-sm font-semibold text-slate-700">No matching verification cases</p><p className="mt-1 text-xs text-slate-400">Try another filter or refresh the queue.</p></div> : null}
    </div>
  </section>;
}

function QueueRow({ row, mine }: { row: BGCheckApplicationRow; mine: boolean }) {
  const progress = Math.min(row.completedChecks, 3);
  const age = queueAge(row.stageEnteredAt ?? row.submissionDate);
  return <Link href={`/officer/applications/${row.applicationId}`} className="group block p-4 transition hover:bg-cyan-50/30 sm:p-5">
    <div className="flex items-start gap-3 sm:gap-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 text-xs font-bold text-white">{initials(row.studentName)}</div>
      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-sm font-bold text-slate-900">{row.studentName}</h3>
        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-slate-500">APP-{row.applicationId}</span>
        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${mine ? 'bg-cyan-50 text-cyan-700' : 'bg-emerald-50 text-emerald-700'}`}>{mine ? 'Assigned to you' : 'Available'}</span>
        {row.isHeld ? <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-700"><ShieldAlert size={10} />On hold</span> : null}</div>
        <p className="mt-1 truncate text-xs font-medium text-slate-600">{row.scholarshipName ?? 'Scholarship verification'}</p>
        {row.returnReason ? <p className="mt-1 flex items-center gap-1 truncate text-[10px] font-semibold text-amber-700" title={row.returnReason}><RotateCcw size={10} />Returned by screening: {row.returnReason}</p> : null}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500"><span className="inline-flex items-center gap-1"><MapPin size={11} />{[row.city, row.state].filter(Boolean).join(', ') || 'Location not provided'}</span>
          <span className={`inline-flex items-center gap-1 ${age.overdue ? 'font-semibold text-rose-600' : ''}`}><Clock3 size={11} />{age.label}</span></div>
        <div className="mt-3 flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-cyan-500" style={{ width: `${progress / 3 * 100}%` }} /></div>
          <span className="shrink-0 text-[10px] font-semibold text-slate-500">{progress}/3 checks</span>{row.inconclusiveChecks ? <span className="text-[10px] font-semibold text-amber-600">Needs revisit</span> : null}</div>
      </div><ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-cyan-600" /></div>
  </Link>;
}

function queueAge(value?: string) {
  if (!value) return { label: 'SLA clock unavailable', overdue: false };
  const hours = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 3_600_000));
  return { label: hours < 24 ? `${hours}h in queue` : `${Math.floor(hours / 24)}d in queue`, overdue: hours >= 48 };
}

function initials(name: string) { return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'ST'; }
