import { ArrowRight, CheckCircle2, CircleAlert, History } from 'lucide-react';
import Link from 'next/link';
import type { OfficerLog } from '@/types/officer';

export function OfficerActivity({ rows }: { rows: OfficerLog[] }) {
  return <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
    <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-700">Your trail</p><h2 className="mt-1 text-base font-bold text-slate-900">Recent activity</h2></div>
      <Link href="/officer/history" className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-700">View all <ArrowRight size={12} /></Link></div>
    <div className="mt-4 space-y-3">{rows.slice(0, 5).map((row) => <Link href={`/officer/applications/${row.appId}`} key={row.logId} className="flex gap-3 rounded-xl p-2 transition hover:bg-slate-50">
      <div className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${row.status === 'Pass' ? 'bg-emerald-50 text-emerald-600' : row.status === 'Fail' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
        {row.status === 'Pass' ? <CheckCircle2 size={15} /> : <CircleAlert size={15} />}</div>
      <div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-800">{row.studentName}</p><p className="mt-0.5 text-[10px] text-slate-500">{label(row.actionType)} · {row.status}</p><p className="mt-0.5 text-[9px] text-slate-400">{dateTime(row.timestamp)}</p></div></Link>)}
      {!rows.length ? <div className="py-8 text-center"><History className="mx-auto text-slate-300" size={20} /><p className="mt-2 text-xs text-slate-400">No verification activity yet.</p></div> : null}</div>
  </section>;
}

export function VerificationProtocol() {
  return <section className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-sm">
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">Field protocol</p><h2 className="mt-1 text-base font-bold">Three-point verification</h2>
    <div className="mt-4 space-y-3">{[['01', 'Identity', 'Match identity and submitted records'], ['02', 'Address', 'Confirm declared residence and locality'], ['03', 'Income', 'Validate household income evidence']].map(([number, title, help]) => <div key={number} className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white/10 text-[10px] font-bold text-cyan-300">{number}</span><div><p className="text-xs font-semibold">{title}</p><p className="text-[10px] leading-relaxed text-slate-400">{help}</p></div></div>)}</div>
    <p className="mt-4 border-t border-white/10 pt-3 text-[10px] leading-relaxed text-slate-400">Record factual notes. Failed or inconclusive results require a reason and every update is audit logged.</p>
  </section>;
}

function label(value: string) { return value === 'IncomeVerification' ? 'Income verification' : value; }
function dateTime(value: string) { return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }); }
