import { ArrowRight, CheckCircle2, ClipboardCheck, XCircle } from 'lucide-react';
import Link from 'next/link';
import type { ScreeningApplicationRow } from '@/types/domain';

export function ScreeningActivity({ rows }: { rows: ScreeningApplicationRow[] }) {
  return <section className="glass-card p-5"><div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[0.25em] text-gold">Decision trail</p><h2 className="mt-1 text-base font-semibold text-text">Recent decisions</h2></div><Link href="/screener/history" className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand">View all <ArrowRight size={11} /></Link></div>
    <div className="mt-4 space-y-2">{rows.slice(0, 5).map((row) => <Link key={row.applicationId} href={`/screener/evaluate/${row.applicationId}`} className="flex gap-3 rounded-lg p-2 hover:bg-brand/5"><span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${row.decision === 'Approve' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>{row.decision === 'Approve' ? <CheckCircle2 size={15} /> : <XCircle size={15} />}</span><span className="min-w-0"><b className="block truncate text-xs text-text">{row.studentName}</b><span className="block truncate text-[9px] text-text-dim">APP-{row.applicationId} · {row.decision ?? row.status}</span><span className="mt-0.5 block text-[9px] text-text-dim">{row.decisionAt ? dateTime(row.decisionAt) : 'Decision recorded'}</span></span></Link>)}
      {!rows.length ? <div className="py-8 text-center"><ClipboardCheck className="mx-auto text-text-dim" size={20} /><p className="mt-2 text-xs text-text-dim">No decisions recorded yet.</p></div> : null}</div>
  </section>;
}

export function ScreeningControlsGuide() {
  return <section className="glass-card p-5"><p className="text-[10px] uppercase tracking-[0.25em] text-gold">Control standard</p><h2 className="mt-1 text-base font-semibold text-text">Before a decision</h2><div className="mt-4 space-y-3">{['Confirm every submitted document is verified', 'Read all three background-check findings', 'Compare applicant evidence with scholarship rules', 'Record a specific, audit-ready rationale'].map((text, index) => <div key={text} className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-brand/10 text-[9px] font-semibold text-brand">0{index + 1}</span><p className="text-[10px] leading-relaxed text-text-muted">{text}</p></div>)}</div></section>;
}
function dateTime(value: string) { return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }); }
