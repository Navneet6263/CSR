'use client';

import { CheckCircle2, Clock3, FileClock, LifeBuoy, RefreshCw, UserRoundX, Users } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { supportApi } from '@/lib/api';
import type { SupportOverview, SupportStudentRow, SupportTicket } from '@/types/support';

export default function SupportDashboard() {
  const [overview, setOverview] = useState<SupportOverview | null>(null);
  const [students, setStudents] = useState<SupportStudentRow[]>([]); const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [summary, directory, queue] = await Promise.all([supportApi.overview(), supportApi.students('', 1, 50), supportApi.tickets()]);
      setOverview(summary.data); setStudents(directory.data?.data ?? []); setTickets(queue.data ?? []);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Support workload could not be loaded.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const attention = useMemo(() => students.filter((row) => row.completion < 100 || ['Draft', 'NotStarted'].includes(row.status))
    .sort((a, b) => a.completion - b.completion).slice(0, 6), [students]);
  const urgent = tickets.filter((ticket) => ticket.Status !== 'Resolved' && ['Urgent', 'High'].includes(ticket.Priority)).slice(0, 5);
  const metrics = overview?.metrics;

  return <div className="mx-auto max-w-[1500px] space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4"><div>
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-600">Student success desk</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">Today&apos;s support command centre</h1>
      <p className="mt-1 text-sm text-slate-500">Resolve blockers before they become abandoned applications.</p></div>
      <button onClick={() => void load()} disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm disabled:opacity-50">
        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />Refresh live data</button></header>

    {error ? <div role="alert" className="flex justify-between rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
      <span>{error}</span><button onClick={() => void load()} className="font-bold underline">Retry</button></div> : null}

    <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <Stat label="Active today" value={metrics?.activeToday ?? 0} help="Authenticated sessions" icon={Users} tone="slate" />
      <Stat label="Pending applications" value={metrics?.pendingApplications ?? 0} help="Moving through review" icon={FileClock} tone="amber" />
      <Stat label="Incomplete profiles" value={metrics?.incompleteProfiles ?? 0} help="Follow-up opportunity" icon={UserRoundX} tone="rose" />
      <Stat label="Resolved today" value={metrics?.resolvedToday ?? 0} help="Closed in last 24h" icon={CheckCircle2} tone="emerald" />
    </section>

    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-bold">Students needing attention</h2>
          <p className="text-xs text-slate-500">Lowest completion and unsubmitted applications first</p></div>
          <Link href="/support/students?attention=true" className="text-xs font-bold text-amber-700">Open directory →</Link></div>
        <div className="divide-y">{attention.map((row) => <Link key={row.studentId} href={`/support/students/${row.studentId}`}
          className="grid gap-3 px-5 py-4 transition hover:bg-amber-50/40 sm:grid-cols-[minmax(0,1fr)_180px_120px] sm:items-center">
          <div className="min-w-0"><div className="flex items-center gap-2"><b className="truncate text-sm">{row.name}</b>
            <span className="font-mono text-[10px] text-slate-400">STU-{row.studentId}</span></div>
            <p className="truncate text-xs text-slate-500">{row.status} · {row.course || 'Course not added'}</p></div>
          <div><div className="flex justify-between text-[10px] text-slate-500"><span>Profile</span><b>{row.completion}%</b></div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-amber-500" style={{ width: `${row.completion}%` }} /></div></div>
          <span className="truncate rounded-lg bg-rose-50 px-2 py-1 text-center text-[10px] font-semibold text-rose-700">
            {row.missing[0] ?? 'Review case'}</span>
        </Link>)}{!attention.length && !loading ? <Empty text="No incomplete student profiles found." /> : null}</div>
      </section>

      <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 text-white shadow-xl shadow-slate-950/10">
        <div className="flex items-center justify-between border-b border-white/10 p-5"><div><p className="text-[10px] uppercase tracking-widest text-amber-400">Priority queue</p>
          <h2 className="mt-1 font-bold">Urgent help requests</h2></div><LifeBuoy className="text-amber-400" /></div>
        <div className="divide-y divide-white/10">{urgent.map((ticket) => <Link href={`/support/tickets?ticket=${ticket.TicketID}`}
          key={ticket.TicketID} className="block p-4 hover:bg-white/5"><div className="flex items-center justify-between gap-2">
          <b className="truncate text-sm">{ticket.RequesterName}</b><span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[9px] font-bold text-rose-200">{ticket.Priority}</span></div>
          <p className="mt-1 line-clamp-2 text-xs text-white/65">{ticket.Subject}</p>
          <p className="mt-2 flex items-center gap-1 text-[10px] text-white/40"><Clock3 size={10} />Due {ticket.DueAt ? new Date(ticket.DueAt).toLocaleString('en-IN') : 'not set'}</p>
        </Link>)}{!urgent.length && !loading ? <p className="p-8 text-center text-xs text-white/50">No urgent tickets.</p> : null}</div>
        <Link href="/support/tickets" className="m-4 block rounded-xl bg-amber-400 px-4 py-2.5 text-center text-xs font-bold text-slate-950">Open complete queue</Link>
      </aside>
    </div>

    <section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><div><h2 className="font-bold">Recent secure sessions</h2>
      <p className="text-xs text-slate-500">Masked contact details; newest session activity first</p></div></div>
      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">{(overview?.recentLogins ?? []).map((login) => <div key={login.userId}
        className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-xs font-bold">{login.name.slice(0, 2).toUpperCase()}</span>
        <span className="min-w-0 flex-1"><b className="block truncate text-xs">{login.name}</b><span className="block truncate text-[10px] text-slate-500">{login.email} · {login.role}</span></span>
        <span className="text-[9px] text-slate-400">{login.lastUsedAt ? new Date(login.lastUsedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</span></div>)}</div>
    </section>
  </div>;
}

function Stat({ label, value, help, icon: Icon, tone }: { label: string; value: number; help: string; icon: typeof Users; tone: string }) {
  const tones: Record<string, string> = { slate: 'bg-slate-950 text-white', amber: 'bg-amber-100 text-amber-700',
    rose: 'bg-rose-100 text-rose-700', emerald: 'bg-emerald-100 text-emerald-700' };
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-start justify-between gap-2">
    <div><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p><p className="mt-2 text-3xl font-bold tabular-nums">{value}</p>
      <p className="mt-1 text-[10px] text-slate-500">{help}</p></div><span className={`grid h-10 w-10 place-items-center rounded-xl ${tones[tone]}`}><Icon size={18} /></span></div></div>;
}
function Empty({ text }: { text: string }) { return <p className="p-10 text-center text-sm text-slate-400">{text}</p>; }
