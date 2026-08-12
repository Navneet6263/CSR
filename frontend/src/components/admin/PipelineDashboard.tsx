'use client';

import { AlertTriangle, ArrowUpRight, Clock4, PauseCircle, Search, UserCheck, UsersRound } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '@/lib/api/admin';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

type PipelineRole = 'reviewer' | 'bgchecker' | 'screener' | 'csr';
type Row = Record<string, any>;
const config: Record<PipelineRole, { title: string; description: string; staffRole: string; sla: number; assignment: string }> = {
  reviewer: { title: 'Document Checkers', description: 'Evidence completeness and document decision control.', staffRole: 'DocReviewer', sla: 48, assignment: 'assignedDocReviewer' },
  bgchecker: { title: 'Background Checkers', description: 'Address, institution and income verification control.', staffRole: 'BGCheckOfficer', sla: 48, assignment: 'assignedBGOfficer' },
  screener: { title: 'Screening Officers', description: 'Independent policy and eligibility recommendation control.', staffRole: 'ScreeningOfficer', sla: 24, assignment: 'assignedScreener' },
  csr: { title: 'CSR Partners', description: 'Sponsor-scoped funding approval and fund exposure.', staffRole: 'CSRPartner', sla: 48, assignment: 'sponsorId' },
};

export default function PipelineDashboard({ role }: { role: PipelineRole }) {
  const [rows, setRows] = useState<Row[]>([]); const [staff, setStaff] = useState<Row[]>([]); const [workload, setWorkload] = useState<Array<{ userId?: number; sponsorId?: number; count: number }>>([]);
  const [total, setTotal] = useState(0); const [page, setPage] = useState(1); const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const limit = 10;
  useEffect(() => { let active = true; setLoading(true); Promise.all([adminApi.getPipeline(role, page, limit), adminApi.getUsers()])
    .then(([pipeline, users]) => { if (!active) return; setRows(pipeline.data.data ?? []); setTotal(pipeline.data.total ?? 0); setWorkload(pipeline.data.workload ?? []);
      setStaff((users.data ?? []).filter((user) => user.Role === config[role].staffRole && Boolean(user.IsActive))); setError(''); })
    .catch((cause) => active && setError(cause instanceof Error ? cause.message : 'Unable to load pipeline.'))
    .finally(() => active && setLoading(false)); return () => { active = false; }; }, [role, page]);
  const now = Date.now(); const age = (row: Row) => row.stageEnteredAt ? Math.max(0, (now - new Date(row.stageEnteredAt).getTime()) / 3_600_000) : 0;
  const visible = useMemo(() => { const needle = query.trim().toLowerCase(); return rows.filter((row) => !needle
    || `${row.applicationId} ${row.studentName} ${row.scholarshipName} ${row.status}`.toLowerCase().includes(needle)); }, [query, rows]);
  const unassigned = rows.filter((row) => role !== 'csr' && !row[config[role].assignment]).length;
  const overdue = rows.filter((row) => age(row) >= config[role].sla && !row.isHeldByAdmin).length;
  const pages = Math.max(1, Math.ceil(total / limit));

  return <div className="space-y-5"><header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] uppercase tracking-widest text-slate-400">Role command centre</p>
    <h1 className="mt-1 text-2xl font-semibold text-slate-900">{config[role].title}</h1><p className="mt-0.5 text-sm text-slate-500">{config[role].description}</p></div>
    <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Live database</div></header>
    {error ? <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Stat label="In queue" value={total} icon={Clock4} /><Stat label="Unassigned on page" value={unassigned} icon={UsersRound} warn={unassigned > 0} />
      <Stat label={`Past ${config[role].sla}h SLA`} value={overdue} icon={AlertTriangle} warn={overdue > 0} /><Stat label="Active staff" value={staff.length} icon={UserCheck} /></section>
    <div className="grid gap-5 lg:grid-cols-12"><aside className="overflow-hidden rounded-2xl border bg-white shadow-sm lg:col-span-4"><div className="border-b px-5 py-4"><h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">Team capacity</h2>
      <p className="mt-1 text-[10px] text-slate-400">Current full-queue assignment count</p></div><div className="divide-y">{staff.map((user) => { const assigned = workload.find((item) => role === 'csr'
          ? item.sponsorId === Number(user.SponsorID) : item.userId === Number(user.UserID))?.count ?? 0;
        return <div key={user.UserID} className="flex items-center gap-3 px-5 py-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-xs font-bold">{String(user.FullName).split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>
          <span className="min-w-0 flex-1"><b className="block truncate text-sm">{user.FullName}</b><span className="block truncate text-[10px] text-slate-500">{user.Email}</span></span>
          <span className={`rounded-lg px-2 py-1 text-[10px] font-bold ${assigned > 20 ? 'bg-rose-50 text-rose-700' : assigned > 10 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{assigned} cases</span></div>; })}
        {!staff.length ? <p className="p-8 text-center text-xs text-slate-400">No active staff in this role.</p> : null}</div></aside>
      <section className="relative overflow-hidden rounded-2xl border bg-white shadow-sm lg:col-span-8">{loading ? <div className="absolute inset-0 z-10 grid place-items-center bg-white/70"><LoadingSpinner size="md" /></div> : null}
        <div className="flex items-center gap-3 border-b p-4"><div><h2 className="text-sm font-bold">Action queue</h2><p className="text-[10px] text-slate-500">Oldest stage entry first · {total} total</p></div>
          <div className="relative ml-auto"><Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search visible page"
            className="h-9 w-52 rounded-xl border bg-slate-50 pl-8 pr-3 text-xs outline-none focus:border-slate-400" /></div></div>
        <div className="min-h-64 divide-y">{visible.map((row) => { const hours = age(row); const isOverdue = hours >= config[role].sla;
          return <Link key={row.applicationId} href={`/admin/pipeline/${role}/${row.applicationId}`} className="group flex items-center gap-3 px-5 py-4 hover:bg-slate-50"><div className="min-w-0 flex-1">
            <div className="flex items-center gap-2"><b className="truncate text-sm">{row.studentName}</b><span className="font-mono text-[10px] text-slate-400">APP-{row.applicationId}</span></div>
            <p className="truncate text-xs text-slate-500">{row.scholarshipName} · {row.status}</p></div>
            {row.isHeldByAdmin ? <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700"><PauseCircle size={11} />Hold</span> : null}
            <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${isOverdue ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>{Math.floor(hours)}h</span><ArrowUpRight size={15} className="text-slate-300 group-hover:text-slate-700" /></Link>; })}
          {!visible.length && !loading ? <p className="p-12 text-center text-sm text-slate-400">Queue is empty for this view.</p> : null}</div>
        <footer className="flex items-center justify-between border-t px-5 py-3 text-xs text-slate-500"><span>Page {page} of {pages}</span><div className="flex gap-2"><button disabled={page === 1 || loading} onClick={() => setPage((value) => value - 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Previous</button>
          <button disabled={page === pages || loading} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Next</button></div></footer></section></div>
  </div>;
}

function Stat({ label, value, icon: Icon, warn }: { label: string; value: number; icon: typeof Clock4; warn?: boolean }) { return <div className={`rounded-2xl border bg-white p-4 shadow-sm ${warn ? 'border-rose-200' : ''}`}><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span><Icon size={15} className={warn ? 'text-rose-600' : 'text-slate-400'} /></div><p className="mt-2 text-2xl font-bold">{value}</p></div>; }
