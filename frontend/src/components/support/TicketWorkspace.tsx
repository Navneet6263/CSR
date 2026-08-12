'use client';

import { CheckCircle2, Clock3, Loader2, MessageSquareText, PhoneCall, UserCheck, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { supportApi } from '@/lib/api';
import type { SupportTicket } from '@/types/support';

type Detail = { ticket: SupportTicket; events: Array<Record<string, unknown>>; contacts: Array<Record<string, unknown>> };
const value = (item: unknown, fallback = '—') => item == null || item === '' ? fallback : String(item);
const when = (item: unknown) => item ? new Date(String(item)).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

export function TicketWorkspace({ id, onClose, onChanged }: { id: number; onClose: () => void; onChanged: () => void }) {
  const [detail, setDetail] = useState<Detail | null>(null); const [mode, setMode] = useState<'note' | 'contact'>('note');
  const [message, setMessage] = useState(''); const [channel, setChannel] = useState('Phone'); const [outcome, setOutcome] = useState('Reached');
  const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  const load = useCallback(() => supportApi.ticket(id).then((response) => setDetail(response.data)).catch((reason: Error) => setError(reason.message)), [id]);
  useEffect(() => { void load(); }, [load]);
  const update = async (payload: Record<string, unknown>) => {
    if (!detail) return; setSaving(true); setError('');
    try { await supportApi.updateTicket(id, { ...payload, version: detail.ticket.Version }); await load(); onChanged(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Ticket could not be updated.'); }
    finally { setSaving(false); }
  };
  const add = async () => {
    if (message.trim().length < 3) return; setSaving(true); setError('');
    try { await supportApi.addEvent(id, mode === 'note' ? { type: 'InternalNote', message: message.trim() }
      : { type: 'Contact', message: message.trim(), channel, outcome }); setMessage(''); await load(); onChanged(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Activity could not be recorded.'); }
    finally { setSaving(false); }
  };

  return <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/35 backdrop-blur-sm" onClick={onClose}>
    <aside className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/95 px-5 py-4 backdrop-blur"><div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-amber-600">TKT-{id}</p><h2 className="text-lg font-bold">Ticket workspace</h2></div>
        <button onClick={onClose} className="rounded-lg border p-2" aria-label="Close"><X size={16} /></button></header>
      {!detail && !error ? <div className="grid h-96 place-items-center"><Loader2 className="animate-spin" /></div> : null}
      {error ? <p role="alert" className="m-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      {detail ? <div className="space-y-5 p-5 pb-20">
        <section className="rounded-2xl bg-slate-950 p-5 text-white"><div className="flex items-start justify-between gap-3"><div>
          <p className="text-[10px] text-white/50">{detail.ticket.RequesterName} · {detail.ticket.RequesterEmail}</p><h3 className="mt-1 text-xl font-bold">{detail.ticket.Subject}</h3></div>
          <span className="rounded-full bg-rose-500/20 px-2 py-1 text-[10px] font-bold text-rose-200">{detail.ticket.Priority}</span></div>
          <p className="mt-4 text-sm leading-relaxed text-white/70">{detail.ticket.Message}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-[10px]"><span className="rounded bg-white/10 px-2 py-1">{detail.ticket.Category}</span>
            <span className="rounded bg-white/10 px-2 py-1">{detail.ticket.Status}</span><span className="rounded bg-white/10 px-2 py-1">{detail.ticket.AssigneeName || 'Unassigned'}</span></div></section>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Info label="Opened" value={when(detail.ticket.CreatedAt)} /><Info label="Due" value={when(detail.ticket.DueAt)} />
          <Info label="State" value={detail.ticket.State || 'Not added'} /><Info label="Version" value={`v${detail.ticket.Version}`} />
        </section>

        <section className="rounded-2xl border p-4"><h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Control</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-3"><button disabled={saving} onClick={() => void update({ assignToMe: true })}
            className="inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold hover:bg-slate-50"><UserCheck size={14} />Assign to me</button>
            <select value={detail.ticket.Status} disabled={saving} onChange={(event) => void update({ status: event.target.value })}
              className="rounded-xl border px-3 py-2 text-xs font-bold"><option value="Open">Open</option><option value="InProgress">In progress</option>
              <option value="WaitingOnUser">Waiting on user</option><option value="Resolved">Resolved</option></select>
            <select value={detail.ticket.Priority} disabled={saving} onChange={(event) => void update({ priority: event.target.value })}
              className="rounded-xl border px-3 py-2 text-xs font-bold"><option>Low</option><option>Normal</option><option>High</option><option>Urgent</option></select></div></section>

        <section className="rounded-2xl border p-4"><div className="flex gap-2">{(['note', 'contact'] as const).map((item) => <button key={item} onClick={() => setMode(item)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${mode === item ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600'}`}>
          {item === 'note' ? <MessageSquareText size={13} /> : <PhoneCall size={13} />}{item === 'note' ? 'Internal note' : 'Log contact'}</button>)}</div>
          {mode === 'contact' ? <div className="mt-3 grid grid-cols-2 gap-2"><select value={channel} onChange={(event) => setChannel(event.target.value)} className="rounded-lg border px-2 py-2 text-xs">
            <option>Phone</option><option>InApp</option><option>Email</option><option>WhatsApp</option></select><select value={outcome} onChange={(event) => setOutcome(event.target.value)} className="rounded-lg border px-2 py-2 text-xs">
            <option>Reached</option><option>NoAnswer</option><option>MessageSent</option><option>CallbackRequested</option></select></div> : null}
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={4} maxLength={4000}
            placeholder={mode === 'note' ? 'Record context, guidance and next step…' : 'Record what was discussed; this does not send a message.'}
            className="mt-3 w-full rounded-xl border p-3 text-sm outline-none focus:border-amber-400" />
          <div className="mt-2 flex items-center justify-between"><span className="text-[10px] text-slate-400">{message.length}/4000 · audited</span>
            <button onClick={() => void add()} disabled={saving || message.trim().length < 3} className="rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 disabled:opacity-40">{saving ? 'Saving…' : 'Save activity'}</button></div></section>

        <section><div className="flex items-center justify-between"><h3 className="text-sm font-bold">Ticket timeline</h3><Clock3 size={15} className="text-slate-400" /></div>
          <div className="mt-3 space-y-2">{detail.events.map((event) => <div key={value(event.EventID)} className="flex gap-3 rounded-xl border p-3"><span className="mt-0.5 grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><CheckCircle2 size={14} /></span>
            <div><b className="text-xs">{value(event.EventType)}</b><p className="text-[11px] text-slate-600">{value(event.Message, `${value(event.FromValue)} → ${value(event.ToValue)}`)}</p>
              <span className="text-[9px] text-slate-400">{value(event.ActorName)} · {when(event.CreatedAt)}</span></div></div>)}
            {!detail.events.length ? <p className="rounded-xl border border-dashed p-8 text-center text-xs text-slate-400">No activity recorded yet.</p> : null}</div></section>
      </div> : null}
    </aside>
  </div>;
}

function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border bg-slate-50 p-3"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-xs font-semibold">{value}</p></div>; }
