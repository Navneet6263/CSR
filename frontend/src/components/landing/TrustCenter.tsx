import Link from 'next/link';
import { ArrowRight, EyeOff, FileCheck2, ShieldCheck, UserRoundCheck } from 'lucide-react';

const safeguards = [
  { Icon: EyeOff, title: 'Sensitive fields stay masked', text: 'Bank and identity information is restricted to authorized workflow roles.' },
  { Icon: UserRoundCheck, title: 'Independent verification', text: 'Document, field, screening and finance decisions remain separately accountable.' },
  { Icon: FileCheck2, title: 'Every decision is traceable', text: 'Status changes, returns, overrides and payment controls retain an audit history.' },
];

export function TrustCenter() {
  return <section id="trust" className="content-auto border-y border-emerald-100 bg-emerald-50/60 py-14 sm:py-18"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="grid gap-8 lg:grid-cols-[0.85fr_1.5fr] lg:items-center"><div><p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700"><ShieldCheck size={15} />Privacy by workflow</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Your application is evidence, not a product.</h2><p className="mt-3 text-sm leading-6 text-slate-600">We do not use applicant data for advertising. Access is role-based and limited to scholarship processing, verification, support and disbursement.</p>
      <Link href="/privacy" target="_blank" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:underline">Read the User Agreement &amp; Privacy Policy <ArrowRight size={15} /></Link></div>
      <div className="grid gap-3 sm:grid-cols-3">{safeguards.map(({ Icon, title, text }) => <article key={title} className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"><Icon className="h-6 w-6 text-emerald-700" /><h3 className="mt-4 font-bold text-slate-950">{title}</h3><p className="mt-2 text-xs leading-5 text-slate-600">{text}</p></article>)}</div>
    </div></div></section>;
}
