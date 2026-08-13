'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, Clock3, Megaphone, Pencil, Plus, Trash2, X } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { invalidatePublicPortalCache } from '@/lib/publicPortalCache';

type Announcement = {
  AnnouncementID: number; Title: string; Message: string; Audience: 'All' | 'Students' | 'Staff';
  Status: 'Draft' | 'Published'; CreatedAt: string; PublishedAt?: string | null; ExpiresAt?: string | null;
  CreatedByName?: string | null;
};
type FormState = { title: string; message: string; audience: Announcement['Audience']; status: Announcement['Status']; expiresAt: string };

const emptyForm: FormState = { title: '', message: '', audience: 'All', status: 'Published', expiresAt: '' };
const dateInput = (value?: string | null) => value ? String(value).slice(0, 10) : '';
const dateTime = (value?: string | null) => value ? new Date(value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '—';

function stateOf(item: Announcement) {
  if (item.Status === 'Draft') return { label: 'DRAFT', style: 'bg-slate-100 text-slate-600' };
  if (item.ExpiresAt && new Date(item.ExpiresAt).getTime() <= Date.now()) return { label: 'EXPIRED', style: 'bg-amber-50 text-amber-700' };
  if (item.Audience === 'Staff') return { label: 'STAFF ONLY', style: 'bg-violet-50 text-violet-700' };
  return { label: 'LIVE NOW', style: 'bg-emerald-50 text-emerald-700' };
}

export default function LandingNotifications() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  const load = useCallback(() => adminApi.getAnnouncements().then((response) => setItems((response.data ?? []) as Announcement[]))
    .catch((reason: Error) => setError(reason.message)), []);
  useEffect(() => { void load(); }, [load]);

  const counts = useMemo(() => items.reduce((total, item) => {
    const state = stateOf(item).label;
    if (state === 'LIVE NOW') total.live += 1; else if (state === 'DRAFT') total.draft += 1; else if (state === 'EXPIRED') total.expired += 1;
    return total;
  }, { live: 0, draft: 0, expired: 0 }), [items]);
  const ordered = useMemo(() => [...items].sort((a, b) => {
    const rank = (item: Announcement) => stateOf(item).label === 'LIVE NOW' ? 0 : stateOf(item).label === 'DRAFT' ? 1 : 2;
    return rank(a) - rank(b) || new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime();
  }), [items]);

  function reset() { setEditingId(null); setForm(emptyForm); setError(''); }
  function edit(item: Announcement) {
    setEditingId(item.AnnouncementID);
    setForm({ title: item.Title, message: item.Message, audience: item.Audience, status: item.Status, expiresAt: dateInput(item.ExpiresAt) });
    setError(''); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  async function save() {
    if (!form.title.trim() || !form.message.trim()) { setError('Headline and message are required.'); return; }
    setSaving(true); setError('');
    const payload = { ...form, title: form.title.trim(), message: form.message.trim(),
      expiresAt: form.expiresAt ? new Date(`${form.expiresAt}T23:59:59+05:30`).toISOString() : undefined };
    try {
      if (editingId) await adminApi.updateAnnouncement(editingId, payload); else await adminApi.createAnnouncement(payload);
      invalidatePublicPortalCache(); reset(); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Announcement could not be saved.'); }
    finally { setSaving(false); }
  }
  async function archive(item: Announcement) {
    if (!window.confirm(`Delete “${item.Title}”? It will be removed from the landing page and retained only in the audit log.`)) return;
    try { await adminApi.archiveAnnouncement(item.AnnouncementID); invalidatePublicPortalCache(); if (editingId === item.AnnouncementID) reset(); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Announcement could not be deleted.'); }
  }

  return <div className="space-y-5">
    <section className="grid gap-3 sm:grid-cols-3">
      {[['Live on landing', counts.live, 'border-emerald-200 bg-emerald-50 text-emerald-800'], ['Drafts', counts.draft, 'border-slate-200 bg-white text-slate-700'], ['Expired', counts.expired, 'border-amber-200 bg-amber-50 text-amber-800']].map(([label, count, style]) =>
        <div key={String(label)} className={`rounded-2xl border p-4 ${style}`}><p className="text-[11px] font-bold uppercase tracking-wider">{label}</p><p className="mt-1 text-2xl font-bold">{count}</p></div>)}
    </section>

    <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
      <section className="h-fit rounded-2xl border bg-white p-5 xl:sticky xl:top-24">
        <div className="mb-4 flex items-center justify-between"><h3 className="flex items-center gap-2 text-sm font-semibold"><Megaphone className="h-4 w-4" />{editingId ? 'Edit Announcement' : 'New Announcement'}</h3>
          {editingId && <button onClick={reset} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Cancel edit"><X className="h-4 w-4" /></button>}</div>
        {error && <p role="alert" className="mb-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}
        <div className="space-y-3">
          <label className="block text-xs font-medium text-slate-600">Headline<input value={form.title} maxLength={180} onChange={(event) => setForm((value) => ({ ...value, title: event.target.value }))} placeholder="Important update" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" /></label>
          <label className="block text-xs font-medium text-slate-600">Message<textarea value={form.message} maxLength={2000} onChange={(event) => setForm((value) => ({ ...value, message: event.target.value }))} rows={4} placeholder="Message shown on the public homepage" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" /></label>
          <div className="grid grid-cols-2 gap-2"><label className="text-xs font-medium text-slate-600">Audience<select value={form.audience} onChange={(event) => setForm((value) => ({ ...value, audience: event.target.value as FormState['audience'] }))} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"><option value="All">Everyone</option><option value="Students">Students</option><option value="Staff">Staff only</option></select></label>
            <label className="text-xs font-medium text-slate-600">Status<select value={form.status} onChange={(event) => setForm((value) => ({ ...value, status: event.target.value as FormState['status'] }))} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"><option value="Published">Published</option><option value="Draft">Draft</option></select></label></div>
          <label className="block text-xs font-medium text-slate-600">Expiry date <span className="font-normal text-slate-400">(optional)</span><input type="date" value={form.expiresAt} onChange={(event) => setForm((value) => ({ ...value, expiresAt: event.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" /></label>
          <p className="rounded-lg bg-slate-50 p-2.5 text-[11px] leading-5 text-slate-500">Published “Everyone” and “Students” notices run on the landing page. “Staff only” goes to staff notifications, not the public banner.</p>
          <button disabled={saving} onClick={() => void save()} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-xs font-medium text-white disabled:opacity-50"><Plus className="h-4 w-4" />{saving ? 'Saving…' : editingId ? 'Save Changes' : form.status === 'Published' ? 'Publish Now' : 'Save Draft'}</button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border bg-white xl:col-span-2">
        <header className="border-b px-5 py-4"><div className="flex items-center justify-between"><div><h3 className="text-sm font-semibold">Landing announcements</h3><p className="text-xs text-slate-500">Live notices are shown first · {items.length} records</p></div>{counts.live > 0 && <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">{counts.live} RUNNING</span>}</div></header>
        <ul className="divide-y">{ordered.map((item) => { const state = stateOf(item); return <li key={item.AnnouncementID} className={state.label === 'LIVE NOW' ? 'bg-emerald-50/30 p-4' : 'p-4'}>
          <div className="flex items-start gap-3"><span className={`mt-0.5 rounded-full px-2 py-1 text-[9px] font-bold ${state.style}`}>{state.label}</span><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-900">{item.Title}</p><p className="mt-1 text-xs leading-5 text-slate-600">{item.Message}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500"><span>{item.Audience}</span><span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Published: {dateTime(item.PublishedAt)}</span><span className="flex items-center gap-1"><Clock3 className="h-3 w-3" />Expires: {dateTime(item.ExpiresAt)}</span>{item.CreatedByName && <span>By {item.CreatedByName}</span>}</div></div>
            <div className="flex shrink-0 items-center gap-1"><button onClick={() => edit(item)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label={`Edit ${item.Title}`}><Pencil className="h-4 w-4" /></button><button onClick={() => void archive(item)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${item.Title}`}><Trash2 className="h-4 w-4" /></button></div></div>
        </li>; })}{!items.length && <li className="p-10 text-center text-sm text-slate-500">No database announcements. The landing banner will stay hidden.</li>}</ul>
      </section>
    </div>
  </div>;
}
