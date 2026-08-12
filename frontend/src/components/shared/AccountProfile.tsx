'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { KeyRound, Mail, ShieldCheck, User } from 'lucide-react';
import { authApi } from '@/lib/api';
import type { AuthUser } from '@/types';

export default function AccountProfile({ title }: { title: string }) {
  const [user, setUser] = useState<AuthUser | null>(null); const [error, setError] = useState('');
  useEffect(() => { authApi.restoreSession().then(setUser).catch(() => setError('Account could not be loaded.')); }, []);
  if (error) return <p className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-700">{error}</p>;
  if (!user) return <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />;
  const initials = user.fullName.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  return <div className="mx-auto max-w-5xl space-y-6">
    <header><p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Account</p><h1 className="mt-1 text-3xl font-bold text-slate-900">{title}</h1></header>
    <div className="grid gap-6 lg:grid-cols-3"><section className="rounded-2xl border bg-white p-6 shadow-sm"><div className="grid h-20 w-20 place-items-center rounded-2xl bg-slate-900 text-2xl font-bold text-white">{initials}</div><h2 className="mt-4 text-xl font-bold">{user.fullName}</h2><p className="text-sm text-slate-500">{user.role}</p><span className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"><ShieldCheck className="h-3.5 w-3.5" />Authenticated</span></section>
      <section className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm lg:col-span-2"><h2 className="text-lg font-bold">Account details</h2><Row icon={<User />} label="User ID" value={`U-${user.userId}`} /><Row icon={<Mail />} label="Email" value={user.email} /><Row icon={<ShieldCheck />} label="Access role" value={user.role} /><div className="border-t pt-4"><Link href="/change-password" className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"><KeyRound className="h-4 w-4" />Change password</Link><p className="mt-2 text-xs text-slate-500">Changing the password revokes every active session.</p></div></section></div>
  </div>;
}

function Row({ icon, label, value }: { icon: React.ReactElement; label: string; value: string }) { return <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">{<span className="text-slate-500 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>}<div><p className="text-[10px] uppercase tracking-wider text-slate-400">{label}</p><p className="text-sm font-medium text-slate-800">{value}</p></div></div>; }
