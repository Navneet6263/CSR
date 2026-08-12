'use client';

import { Bell, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { TopNav } from '@/components/reviewer/TopNav';

export default function SettingsPage() {
  const controls = [
    { icon: Bell, title: 'Action notifications', description: 'New assignments, returned cases and corrections appear in the notification centre.', status: 'Active' },
    { icon: ShieldCheck, title: 'Independent review control', description: 'Your document decisions are stored with your user ID, request ID and timestamp.', status: 'Enforced' },
    { icon: LockKeyhole, title: 'Sensitive data minimisation', description: 'Bank, Aadhaar and unrelated profile fields stay hidden from document review.', status: 'Enforced' },
  ];
  return <div className="min-h-screen bg-bg pb-16 text-fg"><TopNav /><main className="mx-auto mt-8 max-w-[1600px] px-6"><div className="max-w-3xl space-y-6">
    <header><p className="text-xs font-mono uppercase tracking-widest text-primary">Account controls</p><h1 className="mt-2 text-3xl font-display font-bold">Settings & security</h1>
      <p className="mt-1 text-sm text-fg-subtle">Only controls that are currently enforced are shown here.</p></header>
    <section className="glass divide-y divide-border">{controls.map((item) => <div key={item.title} className="flex items-start gap-4 p-5"><span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><item.icon size={17} /></span>
      <div className="min-w-0 flex-1"><h2 className="text-sm font-semibold">{item.title}</h2><p className="mt-1 text-xs leading-relaxed text-fg-subtle">{item.description}</p></div>
      <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-[9px] font-semibold uppercase text-primary">{item.status}</span></div>)}</section>
    <section className="glass p-6"><div className="flex items-start gap-3"><KeyRound className="mt-0.5 text-primary" size={18} /><div><h2 className="font-display font-semibold">Password</h2>
      <p className="mt-1 text-xs text-fg-subtle">Changing your password revokes active sessions and requires a fresh sign-in.</p><Link href="/change-password" className="mt-4 inline-flex rounded-lg border border-border-strong bg-surface px-4 py-2 text-sm hover:border-primary/50">Change password</Link></div></div></section>
  </div></main></div>;
}
