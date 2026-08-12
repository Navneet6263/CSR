'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bell, Send, Users } from 'lucide-react';
import { adminApi } from '@/lib/api';

const audiences = [
  ['AllStudents', 'All active students'], ['PendingDocuments', 'Pending document review'],
  ['Approved', 'Approved for payment'], ['Funded', 'Funded recipients'],
] as const;

export default function StudentNotifications() {
  const [audience, setAudience] = useState('AllStudents'); const [title, setTitle] = useState(''); const [message, setMessage] = useState('');
  const [history, setHistory] = useState<Record<string, any>[]>([]); const [error, setError] = useState(''); const [sending, setSending] = useState(false);
  const load = useCallback(() => adminApi.getBroadcasts().then((response) => setHistory(response.data ?? [])).catch((reason: Error) => setError(reason.message)), []);
  useEffect(() => { void load(); }, [load]);
  async function send() {
    if (!title.trim() || !message.trim()) { setError('Title and message are required.'); return; }
    setSending(true); setError('');
    try { await adminApi.sendBroadcast({ audience, title: title.trim(), message: message.trim() }); setTitle(''); setMessage(''); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Notification could not be sent.'); }
    finally { setSending(false); }
  }
  return <div className="grid grid-cols-1 gap-5 xl:grid-cols-3"><section className="rounded-2xl border bg-white p-5 xl:col-span-2"><h3 className="mb-4 flex items-center gap-2 text-sm font-semibold"><Send className="h-4 w-4" />Compose In-App Notification</h3>{error && <p role="alert" className="mb-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}<div className="space-y-4"><div><label className="flex items-center gap-1 text-xs text-slate-500"><Users className="h-3 w-3" />Audience</label><div className="mt-2 flex flex-wrap gap-2">{audiences.map(([id, label]) => <button key={id} onClick={() => setAudience(id)} className={`rounded-full border px-3 py-1.5 text-xs ${audience === id ? 'border-slate-900 bg-slate-900 text-white' : ''}`}>{label}</button>)}</div></div><input value={title} maxLength={180} onChange={(event) => setTitle(event.target.value)} placeholder="Notification title" className="w-full rounded-lg border px-3 py-2 text-sm" /><textarea value={message} maxLength={2000} onChange={(event) => setMessage(event.target.value)} rows={5} placeholder="Message" className="w-full rounded-lg border px-3 py-2 text-sm" /><div className="flex items-center justify-between border-t pt-3"><span className="inline-flex items-center gap-1 text-xs text-slate-500"><Bell className="h-3.5 w-3.5" />In-app delivery</span><button disabled={sending} onClick={() => void send()} className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white disabled:opacity-50">{sending ? 'Sending…' : 'Send Notification'}</button></div></div></section>
    <section className="rounded-2xl border bg-white"><h3 className="border-b px-5 py-4 text-sm font-semibold">Recent Sends</h3><ul className="divide-y">{history.map((item) => <li key={item.BroadcastID} className="p-4"><p className="text-sm font-medium">{item.Title}</p><p className="mt-1 text-xs text-slate-500">{item.Audience} · {Number(item.RecipientCount).toLocaleString('en-IN')} recipients</p><p className="mt-1 text-[11px] text-slate-400">{new Date(item.CreatedAt).toLocaleString('en-IN')}</p></li>)}{!history.length && <li className="p-8 text-center text-sm text-slate-500">No broadcasts sent.</li>}</ul></section></div>;
}
