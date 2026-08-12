'use client';

import { Radio, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '@/lib/api/admin';
import { mapAuditEvent, type AuditEventView, type AuditTone } from '@/lib/auditPresentation';

const bar: Record<AuditTone, string> = { ok: 'bg-emerald-500', warn: 'bg-amber-500', info: 'bg-slate-400', danger: 'bg-rose-500' };
const pill: Record<AuditTone, string> = { ok: 'bg-emerald-50 text-emerald-700 border-emerald-200', warn: 'bg-amber-50 text-amber-700 border-amber-200', info: 'bg-slate-50 text-slate-600 border-slate-200', danger: 'bg-rose-50 text-rose-700 border-rose-200' };

export default function LiveUpdatesPage() {
  const [events, setEvents] = useState<AuditEventView[]>([]); const [query, setQuery] = useState(''); const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const load = () => adminApi.getAuditEvents().then((response) => {
      if (active) { setEvents((response.data ?? []).map(mapAuditEvent)); setError(''); }
    }).catch((reason: Error) => active && setError(reason.message));
    void load(); const timer = window.setInterval(load, 10_000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);
  const filtered = useMemo(() => events.filter((event) => `${event.actor} ${event.role} ${event.action} ${event.target}`.toLowerCase().includes(query.toLowerCase())), [events, query]);
  return <div className="space-y-5"><header><h1 className="flex items-center gap-2 text-[22px] font-semibold">Live Updates
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />LIVE</span></h1>
    <p className="text-sm text-slate-500">Recent immutable activity from the platform audit log.</p></header>
    {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    <div className="rounded-xl border bg-white"><div className="flex items-center gap-2 border-b px-4 py-3"><Radio className="h-4 w-4" /><p className="text-sm font-medium">Activity Stream</p><span className="text-xs text-slate-400">· {filtered.length} events</span>
      <div className="relative ml-auto"><Search className="absolute left-2 top-2 h-3.5 w-3.5 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search audit events…" className="h-8 w-56 rounded-lg border bg-slate-50 pl-7 pr-2 text-xs" /></div></div>
      <ul className="divide-y">{filtered.map((event) => <li key={event.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
        <span className={`h-2 w-2 rounded-full ${bar[event.tone]}`} /><span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-[11px] font-semibold">{event.actor.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>
        <div className="min-w-0 flex-1"><p className="truncate text-sm"><b>{event.actor}</b> <span className="text-slate-500">{event.action}</span> <b>{event.target}</b></p><p className="text-[11px] text-slate-400">{event.role}</p></div>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] ${pill[event.tone]}`}>{event.tone}</span><span className="w-36 text-right text-[11px] text-slate-400">{event.time}</span>
      </li>)}{!filtered.length && <li className="p-10 text-center text-sm text-slate-400">No audit events found.</li>}</ul>
    </div>
  </div>;
}
