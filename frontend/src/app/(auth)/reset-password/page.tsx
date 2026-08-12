'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, KeyRound } from 'lucide-react';
import { authApi } from '@/lib/api';

function ResetForm() {
  const token = useSearchParams().get('token') ?? ''; const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState(''); const [error, setError] = useState('');
  const [saving, setSaving] = useState(false); const [done, setDone] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!token) { setError('Reset token is missing. Request a new link.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setSaving(true); setError('');
    try { await authApi.resetPassword({ token, newPassword: password }); setDone(true); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Password could not be reset.'); }
    finally { setSaving(false); }
  }
  if (done) return <div className="space-y-5 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" /><h1 className="text-2xl font-bold">Password reset</h1><p className="text-sm text-slate-500">Your existing sessions were revoked. Sign in with the new password.</p><Link href="/login" className="inline-flex rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">Sign in</Link></div>;
  return <form onSubmit={submit} className="space-y-5"><div><KeyRound className="mb-3 h-8 w-8 text-slate-700" /><h1 className="text-2xl font-bold">Choose a new password</h1><p className="mt-1 text-sm text-slate-500">Use 10+ characters with uppercase, lowercase, number, and symbol.</p></div>{error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}<label className="block text-sm font-medium">New password<input type="password" autoComplete="new-password" minLength={10} maxLength={100} required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-12 w-full rounded-xl border px-4" /></label><label className="block text-sm font-medium">Confirm password<input type="password" autoComplete="new-password" minLength={10} maxLength={100} required value={confirm} onChange={(event) => setConfirm(event.target.value)} className="mt-2 h-12 w-full rounded-xl border px-4" /></label><button disabled={saving} className="h-12 w-full rounded-xl bg-slate-900 font-semibold text-white disabled:opacity-50">{saving ? 'Resetting…' : 'Reset password'}</button></form>;
}

export default function ResetPasswordPage() {
  return <main className="grid min-h-screen place-items-center bg-slate-50 px-4"><div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm"><Suspense fallback={<p>Loading…</p>}><ResetForm /></Suspense></div></main>;
}
