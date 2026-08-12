'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, LifeBuoy, MapPin, User2 } from 'lucide-react';
import { adminApi } from '@/lib/api';

type Ticket = Record<string, any>;
const statuses = ['all', 'Open', 'InProgress', 'Resolved'] as const;

export default function SupportZone() {
  const [tickets, setTickets] = useState<Ticket[]>([]); const [status, setStatus] = useState<(typeof statuses)[number]>('all');
  const [state, setState] = useState('All'); const [error, setError] = useState('');
  const load = useCallback(() => adminApi.getSupportTickets().then((response) => setTickets(response.data ?? [])).catch((reason: Error) => setError(reason.message)), []);
  useEffect(() => { void load(); }, [load]);
  const states = useMemo(() => ['All', ...Array.from(new Set(tickets.map((item) => String(item.State || 'Unspecified'))))], [tickets]);
  const filtered = tickets.filter((item) => (status === 'all' || item.Status === status) && (state === 'All' || String(item.State || 'Unspecified') === state));
  const totals = { open: tickets.filter((item) => item.Status === 'Open').length,
    progress: tickets.filter((item) => item.Status === 'InProgress').length,
    urgent: tickets.filter((item) => item.Priority === 'Urgent' && item.Status !== 'Resolved').length,
    resolved: tickets.filter((item) => item.Status === 'Resolved').length };
  async function change(id: number, next: string) { try { await adminApi.updateSupportTicket(id, next); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Ticket could not be updated.'); } }
  return <div className="space-y-5">
    {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Stat label="Open Tickets" value={totals.open} icon={AlertTriangle} /><Stat label="In Progress" value={totals.progress} icon={Clock} /><Stat label="Urgent" value={totals.urgent} icon={LifeBuoy} /><Stat label="Resolved" value={totals.resolved} icon={CheckCircle2} /></div>
    <section className="rounded-2xl border bg-white"><header className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4"><div><h3 className="text-sm font-semibold">Support Tickets</h3><p className="text-xs text-slate-500">{filtered.length} matching records</p></div><div className="flex flex-wrap gap-2"><select value={state} onChange={(event) => setState(event.target.value)} className="rounded-lg border px-2 py-1.5 text-xs">{states.map((item) => <option key={item}>{item}</option>)}</select>{statuses.map((item) => <button key={item} onClick={() => setStatus(item)} className={`rounded-md px-2.5 py-1.5 text-xs ${status === item ? 'bg-slate-900 text-white' : ''}`}>{item === 'all' ? 'All' : item}</button>)}</div></header>
      <ul className="max-h-[600px] divide-y overflow-y-auto">{filtered.map((ticket) => <li key={ticket.TicketID} className="p-4"><div className="flex flex-wrap items-start gap-3"><span className={`mt-1.5 h-2 w-2 rounded-full ${ticket.Status === 'Resolved' ? 'bg-emerald-500' : ticket.Status === 'InProgress' ? 'bg-amber-500' : 'bg-rose-500'}`} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[10px] text-slate-400">TKT-{ticket.TicketID}</span><p className="text-sm font-medium">{ticket.Subject}</p><span className="rounded border px-1.5 py-0.5 text-[10px]">{ticket.Priority}</span></div><p className="mt-1 text-xs text-slate-600">{ticket.Message}</p><div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-500"><span className="inline-flex items-center gap-1"><User2 className="h-3 w-3" />{ticket.RequesterName}</span><span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{ticket.State || 'Unspecified'}</span><span>{ticket.Category}</span><span>{new Date(ticket.CreatedAt).toLocaleString('en-IN')}</span></div></div><select value={ticket.Status} onChange={(event) => void change(Number(ticket.TicketID), event.target.value)} className="rounded-lg border px-2 py-1.5 text-xs"><option value="Open">Open</option><option value="InProgress">In Progress</option><option value="Resolved">Resolved</option></select></div></li>)}{!filtered.length && <li className="p-12 text-center text-sm text-slate-500">No support tickets found.</li>}</ul>
    </section>
  </div>;
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof LifeBuoy }) { return <div className="rounded-2xl border bg-white p-4"><div className="flex justify-between text-xs text-slate-500"><span>{label}</span><Icon className="h-4 w-4" /></div><p className="mt-2 text-2xl font-semibold">{value}</p></div>; }
