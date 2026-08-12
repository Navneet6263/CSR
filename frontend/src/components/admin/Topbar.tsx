'use client';

import { BarChart3, Wallet } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NotificationCenter } from '@/components/shared/NotificationCenter';

const names: Record<string, string> = { admin: 'Overview', pipeline: 'Pipeline control', analytics: 'Analytics',
  operations: 'Operations', users: 'User & access', communications: 'Communications', scholarships: 'Scholarships',
  reports: 'Reports', 'live-updates': 'Audit activity' };

export default function Topbar() {
  const pathname = usePathname(); const segment = pathname.split('/').filter(Boolean)[1] ?? 'admin';
  return <div className="sticky top-0 z-20 border-b border-slate-200/80 bg-slate-50/90 backdrop-blur">
    <div className="flex items-center gap-3 px-4 py-3.5 sm:px-6"><div className="min-w-0 flex-1"><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">Scholarship operations</p>
      <p className="truncate text-sm font-semibold text-slate-900">{names[segment] ?? 'Admin console'}</p></div>
      <Link href="/admin/reports" className="hidden items-center gap-2 rounded-lg border bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-slate-300 sm:inline-flex"><BarChart3 size={14} />Reports</Link>
      <NotificationCenter />
      <Link href="/admin/operations/payments" className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"><Wallet size={14} />
        <span className="hidden sm:inline">Payment queue</span></Link>
    </div>
  </div>;
}
