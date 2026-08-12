'use client';

import { LogOut, ShieldAlert } from 'lucide-react';
import { authApi } from '@/lib/api';

export default function AgentDashboard() {
  return <main className="grid min-h-screen place-items-center bg-slate-50 p-6"><section className="w-full max-w-lg rounded-3xl border bg-white p-8 text-center shadow-xl shadow-slate-900/5">
    <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-amber-700"><ShieldAlert size={25} /></span>
    <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">Legacy access</p><h1 className="mt-2 text-2xl font-bold">Agent programme is not enabled</h1>
    <p className="mt-3 text-sm leading-relaxed text-slate-500">Public Agent registration and student assignment are disabled. This account cannot access student records or submit applications.</p>
    <button onClick={() => void authApi.logout()} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white"><LogOut size={15} />Return to sign in</button>
  </section></main>;
}
