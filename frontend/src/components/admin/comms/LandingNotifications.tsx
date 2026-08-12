'use client';

import { useCallback, useEffect, useState } from 'react';
import { Calendar, Megaphone, Plus, Trash2 } from 'lucide-react';
import { adminApi } from '@/lib/api';

type Announcement = Record<string, any>;

export default function LandingNotifications() {
  const [items, setItems] = useState<Announcement[]>([]); const [form, setForm] = useState({ title: '', message: '', audience: 'All', status: 'Published', expiresAt: '' });
  const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  const load = useCallback(() => adminApi.getAnnouncements().then((response) => setItems(response.data ?? [])).catch((reason: Error) => setError(reason.message)), []);
  useEffect(() => { void load(); }, [load]);
  async function save() {
    if (!form.title.trim() || !form.message.trim()) { setError('Headline and message are required.'); return; }
    setSaving(true); setError('');
    try { await adminApi.createAnnouncement({ ...form, expiresAt: form.expiresAt ? new Date(`${form.expiresAt}T23:59:59Z`).toISOString() : undefined });
      setForm({ title: '', message: '', audience: 'All', status: 'Published', expiresAt: '' }); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Announcement could not be saved.'); }
    finally { setSaving(false); }
  }
  async function archive(id: number) { try { await adminApi.archiveAnnouncement(id); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Announcement could not be archived.'); } }

  return <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
    <section className="rounded-2xl border bg-white p-5"><h3 className="mb-4 flex items-center gap-2 text-sm font-semibold"><Megaphone className="h-4 w-4" />New Announcement</h3>
      {error && <p role="alert" className="mb-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}
      <div className="space-y-3"><input value={form.title} maxLength={180} onChange={(event) => setForm((value) => ({ ...value, title: event.target.value }))} placeholder="Headline" className="w-full rounded-lg border px-3 py-2 text-sm" /><textarea value={form.message} maxLength={2000} onChange={(event) => setForm((value) => ({ ...value, message: event.target.value }))} rows={4} placeholder="Announcement message" className="w-full rounded-lg border px-3 py-2 text-sm" /><div className="grid grid-cols-2 gap-2"><select value={form.audience} onChange={(event) => setForm((value) => ({ ...value, audience: event.target.value }))} className="rounded-lg border px-3 py-2 text-sm"><option value="All">All</option><option value="Students">Students</option><option value="Staff">Staff</option></select><select value={form.status} onChange={(event) => setForm((value) => ({ ...value, status: event.target.value }))} className="rounded-lg border px-3 py-2 text-sm"><option value="Published">Publish</option><option value="Draft">Draft</option></select></div><input type="date" value={form.expiresAt} onChange={(event) => setForm((value) => ({ ...value, expiresAt: event.target.value }))} className="w-full rounded-lg border px-3 py-2 text-sm" /><button disabled={saving} onClick={() => void save()} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-xs font-medium text-white disabled:opacity-50"><Plus className="h-4 w-4" />{saving ? 'Saving…' : form.status === 'Published' ? 'Publish' : 'Save Draft'}</button></div>
    </section>
    <section className="rounded-2xl border bg-white xl:col-span-2"><header className="border-b px-5 py-4"><h3 className="text-sm font-semibold">Announcements</h3><p className="text-xs text-slate-500">{items.length} database records</p></header><ul className="divide-y">{items.map((item) => <li key={item.AnnouncementID} className="flex items-start gap-3 p-4"><span className={`mt-1.5 h-2 w-2 rounded-full ${item.Status === 'Published' ? 'bg-emerald-500' : 'bg-slate-300'}`} /><div className="min-w-0 flex-1"><p className="text-sm font-medium">{item.Title}</p><p className="mt-1 text-xs text-slate-600">{item.Message}</p><p className="mt-2 flex items-center gap-1 text-[11px] text-slate-500"><Calendar className="h-3 w-3" />{item.Audience} · {item.Status} · {new Date(item.CreatedAt).toLocaleString('en-IN')}</p></div><button aria-label="Archive announcement" onClick={() => void archive(Number(item.AnnouncementID))} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button></li>)}{!items.length && <li className="p-10 text-center text-sm text-slate-500">No announcements created.</li>}</ul></section>
  </div>;
}
