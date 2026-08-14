'use client';

import { ArrowUpRight, CheckCircle2, Clock3, MapPin, Search, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { ScreeningApplicationRow } from '@/types/domain';

type Filter = 'All' | 'Available' | 'Mine' | 'On hold';
const filters: Filter[] = ['All', 'Available', 'Mine', 'On hold'];

export function ScreeningQueue({ rows, userId, loading, query, onQueryChange }: {
  rows: ScreeningApplicationRow[]; userId?: number; loading: boolean; query: string; onQueryChange: (value: string) => void;
}) {
  const [filter, setFilter] = useState<Filter>('All');
  const visible = useMemo(() => rows.filter((row) => {
    const needle = query.trim().toLowerCase();
    const matches = !needle || [row.applicationId, row.studentName, row.scholarshipName, row.sponsorName,
      row.studentCity, row.studentState, row.course].some((value) => String(value ?? '').toLowerCase().includes(needle));
    const category = filter === 'All' || (filter === 'Available' && !row.assignedScreenerId)
      || (filter === 'Mine' && row.assignedScreenerId === userId) || (filter === 'On hold' && row.isHeld);
    return matches && category;
  }), [filter, query, rows, userId]);

  return <section className="glass-card overflow-hidden">
    <div className="border-b border-border-soft p-4 sm:p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] uppercase tracking-[0.25em] text-gold">Priority workload</p><h2 className="mt-1 text-xl font-semibold text-text">Actionable queue</h2></div>
      <div className="relative w-full sm:w-80"><Search className="absolute left-3 top-2.5 h-4 w-4 text-text-dim" /><input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search APP ID, student or scholarship" className="w-full rounded-lg border border-brand/10 bg-brand/5 py-2 pl-9 pr-3 text-xs text-text outline-none focus:border-brand/40" /></div></div>
      <div className="mt-3 flex flex-wrap gap-1.5">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-md px-2.5 py-1.5 text-[10px] font-semibold ${filter === item ? 'bg-brand text-white' : 'border border-brand/10 bg-brand/5 text-text-muted hover:bg-brand/10'}`}>{item}</button>)}</div></div>
    <div className="min-h-64 divide-y divide-border-soft">{loading ? Array.from({ length: 3 }, (_, index) => <div key={index} className="animate-pulse p-5"><div className="h-4 w-1/3 rounded bg-brand/10" /><div className="mt-3 h-3 w-2/3 rounded bg-brand/5" /></div>) : null}
      {!loading && visible.map((row) => <QueueRow key={row.applicationId} row={row} mine={row.assignedScreenerId === userId} />)}
      {!loading && !visible.length ? <div className="px-5 py-14 text-center"><Search className="mx-auto text-text-dim" size={22} /><p className="mt-3 text-sm font-semibold text-text">No matching applications</p><p className="mt-1 text-xs text-text-dim">Try another filter or refresh the workload.</p></div> : null}</div>
  </section>;
}

function QueueRow({ row, mine }: { row: ScreeningApplicationRow; mine: boolean }) {
  const docsReady = row.requiredDocCount > 0 && row.verifiedDocCount === row.requiredDocCount;
  const bgReady = row.passedBGCount >= 3 && row.flaggedBGCount === 0;
  const age = queueAge(row.stageEnteredAt ?? row.updatedAt ?? row.submissionDate);
  return <Link href={`/screener/evaluate/${row.applicationId}`} className="group block p-4 transition hover:bg-brand/[0.03] sm:p-5">
    <div className="flex items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-2 text-xs font-semibold text-white shadow-[var(--shadow-glow)]">{initials(row.studentName)}</div>
      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-sm font-semibold text-text">{row.studentName}</h3><span className="rounded border border-brand/10 bg-brand/5 px-1.5 py-0.5 font-mono text-[9px] text-text-dim">APP-{row.applicationId}</span>
        <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${mine ? 'bg-brand/10 text-brand' : 'bg-success/10 text-success'}`}>{mine ? 'Assigned to you' : 'Available'}</span>{row.isHeld ? <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2 py-0.5 text-[9px] font-semibold text-danger"><ShieldAlert size={10} />On hold</span> : null}</div>
        <p className="mt-1 truncate text-xs text-text-muted">{row.scholarshipName} · {row.sponsorName ?? 'Sponsor'}</p><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-text-dim"><span className="inline-flex items-center gap-1"><MapPin size={11} />{[row.studentCity, row.studentState].filter(Boolean).join(', ') || 'Location unavailable'}</span><span>{row.course ?? 'Course unavailable'}</span><span className={age.overdue ? 'inline-flex items-center gap-1 font-semibold text-danger' : 'inline-flex items-center gap-1'}><Clock3 size={11} />{age.label}</span></div>
        <div className="mt-3 flex flex-wrap items-center gap-2"><Gate ready={docsReady} label={`${row.verifiedDocCount}/${row.requiredDocCount} documents`} /><Gate ready={bgReady} label={`${row.passedBGCount}/3 background`} /><span className="ml-auto font-display text-sm font-semibold text-text">₹{Number(row.scholarshipAmount ?? 0).toLocaleString('en-IN')}</span></div></div>
      <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-text-dim transition group-hover:text-brand" /></div>
  </Link>;
}

function Gate({ ready, label }: { ready: boolean; label: string }) { return <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[9px] font-semibold ${ready ? 'bg-success/10 text-success' : 'bg-gold/10 text-gold'}`}>{ready ? <CheckCircle2 size={10} /> : <ShieldAlert size={10} />}{label}</span>; }
function queueAge(value?: string) { if (!value) return { label: 'SLA unavailable', overdue: false }; const hours = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 3_600_000)); return { label: hours < 24 ? `${hours}h in screening` : `${Math.floor(hours / 24)}d in screening`, overdue: hours >= 24 }; }
function initials(value: string) { return value.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'ST'; }
