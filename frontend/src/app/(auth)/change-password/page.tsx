'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';
import { authApi } from '@/lib/api';

const fields = [
  { name: 'currentPassword', label: 'Temporary/current password', hint: 'Password provided for this staff account' },
  { name: 'newPassword', label: 'New private password', hint: 'Minimum 10 characters' },
  { name: 'confirmPassword', label: 'Confirm new password', hint: 'Enter the same private password again' },
] as const;

export default function ChangePasswordPage() {
  const [mounted, setMounted] = useState(false); const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  useEffect(() => { setMounted(true); const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; }; }, []);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (form.newPassword !== form.confirmPassword) { setError('New passwords do not match.'); return; }
    setSaving(true); setError('');
    try { await authApi.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword }); window.location.href = '/login'; }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Password could not be changed.'); }
    finally { setSaving(false); }
  }
  if (!mounted) return null;
  return createPortal(<main className="fixed inset-0 z-[9999] grid min-h-dvh place-items-center overflow-y-auto bg-slate-950/65 p-4 backdrop-blur-md sm:p-6">
    <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-3xl border border-white/30 bg-white/95 p-6 shadow-2xl sm:p-8">
      <div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-900 text-white"><KeyRound size={21} /></span><div><h1 className="text-2xl font-bold text-slate-950">Create your private password</h1><p className="mt-1 text-sm leading-5 text-slate-500">Confirm the temporary password, then replace it before entering the portal.</p></div></div>
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800"><ShieldCheck size={16} />Your new password is never shown to an administrator.</div>
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      <div className="space-y-4">{fields.map(({ name, label, hint }) => <label key={name} className="block text-sm font-semibold text-slate-800">{label}<span className="relative mt-2 block"><input type={visible[name] ? 'text' : 'password'} autoComplete={name === 'currentPassword' ? 'current-password' : 'new-password'} required minLength={name === 'currentPassword' ? 1 : 10} maxLength={100} value={form[name]} onChange={(event) => setForm((value) => ({ ...value, [name]: event.target.value }))} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-11 outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-100" /><button type="button" onClick={() => setVisible((value) => ({ ...value, [name]: !value[name] }))} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100" aria-label={`${visible[name] ? 'Hide' : 'Show'} ${label}`}>{visible[name] ? <EyeOff size={17} /> : <Eye size={17} />}</button></span><span className="mt-1 block text-[10px] font-normal text-slate-500">{hint}</span></label>)}</div>
      <button disabled={saving} className="h-12 w-full rounded-xl bg-slate-900 font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-50">{saving ? 'Changing…' : 'Save password & continue'}</button>
    </form>
  </main>, document.body);
}
