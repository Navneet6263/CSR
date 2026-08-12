'use client';

import { Bell, CheckCheck, CircleAlert, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { notificationApi, type NotificationRow } from '@/lib/api';

export function NotificationCenter({ dark = false }: { dark?: boolean }) {
  const router = useRouter(); const ref = useRef<HTMLDivElement>(null); const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<NotificationRow[]>([]); const [error, setError] = useState('');
  const load = useCallback(() => notificationApi.list().then((response) => { setRows(response.data ?? []); setError(''); })
    .catch(() => setError('Notifications unavailable')), []);
  useEffect(() => { void load(); const timer = setInterval(() => void load(), 60_000);
    const visible = () => document.visibilityState === 'visible' && void load(); document.addEventListener('visibilitychange', visible);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', visible); }; }, [load]);
  useEffect(() => { const close = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close); }, []);
  const unread = rows.filter((row) => !row.IsRead).length;
  const select = async (row: NotificationRow) => { if (!row.IsRead) { await notificationApi.markRead(row.NotificationID);
    setRows((current) => current.map((item) => item.NotificationID === row.NotificationID ? { ...item, IsRead: true } : item)); }
    setOpen(false); if (row.ActionURL) router.push(row.ActionURL); };
  const readAll = async () => { await notificationApi.markAllRead(); setRows((current) => current.map((row) => ({ ...row, IsRead: true }))); };

  return <div ref={ref} className="relative"><button onClick={() => setOpen((value) => !value)} aria-label={`${unread} unread notifications`}
    className={`relative grid h-9 w-9 place-items-center rounded-xl border transition ${dark ? 'border-white/15 bg-white/5 text-white hover:bg-white/10' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
    <Bell size={16} />{unread ? <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-600 px-1 text-[8px] font-bold text-white">{Math.min(unread, 99)}</span> : null}</button>
    {open ? <div className="absolute right-0 top-full z-[70] mt-2 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
      <header className="flex items-center justify-between border-b p-4"><div><b className="text-sm">Notifications</b><p className="text-[10px] text-slate-500">{unread} unread · action updates first</p></div>
        {unread ? <button onClick={() => void readAll()} className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700"><CheckCheck size={13} />Mark all read</button> : null}</header>
      {error ? <p className="bg-rose-50 p-3 text-xs text-rose-700">{error}</p> : null}
      <div className="max-h-[420px] divide-y overflow-y-auto">{rows.slice(0, 20).map((row) => <button key={row.NotificationID} onClick={() => void select(row)}
        className={`flex w-full gap-3 p-4 text-left transition hover:bg-slate-50 ${row.IsRead ? '' : 'bg-amber-50/50'}`}>
        <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${row.RequiresAction ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
          {row.RequiresAction ? <CircleAlert size={15} /> : <Bell size={14} />}</span><span className="min-w-0 flex-1"><span className="block text-xs leading-relaxed text-slate-700">{row.Message}</span>
          <span className="mt-1 flex items-center gap-2 text-[9px] text-slate-400">{new Date(row.CreatedAt).toLocaleString('en-IN')}{row.ActionURL ? <ExternalLink size={9} /> : null}</span></span>
        {!row.IsRead ? <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-500" /> : null}</button>)}
        {!rows.length ? <p className="p-10 text-center text-xs text-slate-400">You are all caught up.</p> : null}</div>
    </div> : null}
  </div>;
}
