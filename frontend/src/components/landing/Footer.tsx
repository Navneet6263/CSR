import Link from 'next/link';
import Image from 'next/image';
import { LockKeyhole, Mail, ShieldCheck } from 'lucide-react';

const links = [
  { label: 'Open scholarships', href: '#scholarships' }, { label: 'How it works', href: '#process' },
  { label: 'Eligibility check', href: '#apply' }, { label: 'Privacy safeguards', href: '#trust' },
];

export function Footer() {
  return <footer className="border-t border-border bg-slate-950 text-slate-300"><div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div className="grid gap-10 md:grid-cols-[1.3fr_0.8fr_1fr]"><section><div className="flex items-center gap-2.5"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white p-1"><Image src="/brand-mark.svg" alt="" width={40} height={40} /></span><div><p className="font-bold text-white">Shikshavritti</p><p className="text-[11px]">CSR Scholarship Platform</p></div></div>
      <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">One application journey with controlled document review, independent verification and auditable scholarship disbursement.</p></section>
      <section><h2 className="text-sm font-bold text-white">Explore</h2><ul className="mt-4 space-y-2.5">{links.map((item) => <li key={item.href}><a href={item.href} className="text-sm hover:text-white">{item.label}</a></li>)}</ul></section>
      <section><h2 className="text-sm font-bold text-white">Privacy &amp; support</h2><div className="mt-4 space-y-3 text-sm"><Link href="/privacy" target="_blank" className="flex items-center gap-2 hover:text-white"><ShieldCheck size={15} />Privacy Policy</Link><Link href="/privacy#terms" target="_blank" className="flex items-center gap-2 hover:text-white"><LockKeyhole size={15} />User Agreement</Link><a href="mailto:privacy@shikshavritti.org" className="flex items-center gap-2 hover:text-white"><Mail size={15} />privacy@shikshavritti.org</a></div></section>
    </div><div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><p>© 2026 Shikshavritti. All rights reserved.</p><p>Policy Version 1.0 · Effective January 2024</p></div>
  </div></footer>;
}
