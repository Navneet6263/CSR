'use client';

import { AlertTriangle, Clock3, LifeBuoy, Search, UserCheck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TicketWorkspace } from '@/components/support/TicketWorkspace';
import { supportApi } from '@/lib/api';
import type { SupportTicket } from '@/types/support';
import DataPagination from '@/components/shared/DataPagination';

const statuses = ['All', 'Open', 'InProgress', 'WaitingOnUser', 'Resolved'];
const priorityOrder: Record<string, number> = { Urgent: 1, High: 2, Normal: 3, Low: 4 };
const when = (value?: string) => value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Not set';

export default function SupportTickets() {
  const params = useSearchParams(); const initialId = Number(params.get('ticket')) || null;
  const [rows, setRows] = useState<SupportTicket[]>([]); const [status, setStatus] = useState('All');
  const [mine, setMine] = useState(false); const [query, setQuery] = useState(''); const [selected, setSelected] = useState<number | null>(initialId);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [page, setPage] = useState(1); const [limit, setLimit] = useState(12); const [total, setTotal] = useState(0);
  const [totals, setTotals] = useState({ urgent: 0, unassigned: 0, overdue: 0 });
  const load = useCallback(async () => { setLoading(true); setError('');
    try { const response = await supportApi.tickets(status, mine, query.trim(), page, limit); setRows(response.data?.tickets ?? []); setTotal(response.data?.pagination?.total ?? 0); setTotals(response.data?.summary ?? { urgent: 0, unassigned: 0, overdue: 0 }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Ticket queue could not be loaded.'); }
    finally { setLoading(false); }
  }, [limit, mine, page, query, status]);
  useEffect(() => { const timer = setTimeout(() => void load(), query ? 250 : 0); return () => clearTimeout(timer); }, [load, query]);
  const sorted = useMemo(() => [...rows].sort((a, b) => (priorityOrder[a.Priority] ?? 9) - (priorityOrder[b.Priority] ?? 9)), [rows]);

  return <div className="mx-auto max-w-[1500px] space-y-5"><header><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-600">Resolution queue</p>
    <h1 className="mt-1 flex items-center gap-2 text-3xl font-bold"><LifeBuoy size={27} />Help requests</h1><p className="mt-1 text-sm text-slate-500">Assign, investigate, document and resolve every student blocker with a complete audit trail.</p></header>
    <section className="grid grid-cols-3 gap-3"><Metric label="Urgent" value={totals.urgent} icon={AlertTriangle} tone="rose" /><Metric label="Overdue" value={totals.overdue} icon={Clock3} tone="amber" />
      <Metric label="Unassigned" value={totals.unassigned} icon={UserCheck} tone="slate" /></section>
    <section className="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm lg:flex-row lg:items-center"><div className="relative flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
      <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search requester, subject or email" className="h-9 w-full rounded-xl border bg-slate-50 pl-9 pr-3 text-sm outline-none focus:border-amber-400" /></div>
      <div className="flex gap-1 overflow-x-auto">{statuses.map((item) => <button key={item} onClick={() => { setStatus(item); setPage(1); }} className={`shrink-0 rounded-lg px-2.5 py-2 text-[10px] font-bold ${status === item ? 'bg-slate-950 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>{item === 'InProgress' ? 'In progress' : item === 'WaitingOnUser' ? 'Waiting on user' : item}</button>)}</div>
      <button onClick={() => { setMine((value) => !value); setPage(1); }} className={`rounded-lg px-3 py-2 text-xs font-bold ${mine ? 'bg-amber-400 text-slate-950' : 'border text-slate-600'}`}>Assigned to me</button></section>
    {error ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
    <section className="overflow-hidden rounded-2xl border bg-white shadow-sm"><div className="hidden grid-cols-[100px_minmax(0,1fr)_150px_150px_150px_110px] gap-3 border-b bg-slate-50 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 lg:grid">
      <span>Ticket</span><span>Request</span><span>Priority / status</span><span>Owner</span><span>SLA due</span><span>Last activity</span></div>
      <div className="divide-y">{sorted.map((ticket) => <button key={ticket.TicketID} onClick={() => setSelected(ticket.TicketID)} className="grid w-full gap-3 px-5 py-4 text-left transition hover:bg-amber-50/30 lg:grid-cols-[100px_minmax(0,1fr)_150px_150px_150px_110px] lg:items-center">
        <span className="font-mono text-xs font-bold text-amber-700">TKT-{ticket.TicketID}</span><span className="min-w-0"><b className="block truncate text-sm">{ticket.Subject}</b><span className="block truncate text-[10px] text-slate-500">{ticket.RequesterName} · {ticket.Category}</span></span>
        <span><b className={`block text-[10px] ${ticket.Priority === 'Urgent' ? 'text-rose-700' : 'text-slate-700'}`}>{ticket.Priority}</b><span className="text-[10px] text-slate-500">{ticket.Status}</span></span>
        <span className="truncate text-xs text-slate-600">{ticket.AssigneeName || 'Unassigned'}</span><span className={`text-[10px] ${ticket.DueAt && new Date(ticket.DueAt) < new Date() && ticket.Status !== 'Resolved' ? 'font-bold text-rose-700' : 'text-slate-500'}`}>{when(ticket.DueAt)}</span>
        <span className="text-[10px] text-slate-500">{when(ticket.LastActivityAt || ticket.CreatedAt)}</span></button>)}
        {!sorted.length && !loading ? <p className="p-12 text-center text-sm text-slate-400">No tickets match this queue.</p> : null}{loading ? <p className="p-12 text-center text-sm text-slate-400">Loading ticket queue…</p> : null}</div></section>
    <DataPagination page={page} limit={limit} total={total} loading={loading} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1); }} />
    {selected ? <TicketWorkspace id={selected} onClose={() => setSelected(null)} onChanged={load} /> : null}
  </div>;
}

function Metric({ label, value, icon: Icon, tone }: { label: string; value: number; icon: typeof LifeBuoy; tone: string }) { const style: Record<string, string> = { rose: 'bg-rose-50 text-rose-700', amber: 'bg-amber-50 text-amber-700', slate: 'bg-slate-950 text-white' };
  return <div className="flex items-center justify-between rounded-2xl border bg-white p-4 shadow-sm"><div><p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></div><span className={`grid h-9 w-9 place-items-center rounded-xl ${style[tone]}`}><Icon size={16} /></span></div>; }
