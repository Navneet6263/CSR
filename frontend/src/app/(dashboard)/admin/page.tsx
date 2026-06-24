'use client';

import Link from 'next/link';
import { GraduationCap, ClipboardList, BarChart3 } from 'lucide-react';
import TopBar from '@/components/dashboard/TopBar';

const cards = [
  { href: '/admin/scholarships', title: 'Scholarships', desc: 'Manage programs & eligibility rules', icon: GraduationCap, color: '#5b2c6f' },
  { href: '/admin/funnel', title: 'Funnel Analysis', desc: 'Stage bottlenecks & SLA violations', icon: BarChart3, color: '#2e86c1' },
  { href: '/admin/reports', title: 'Reports', desc: 'SLA, funnel, and audit exports', icon: ClipboardList, color: '#0e6251' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6 animate-card-entrance">
      <TopBar title="Admin Console" subtitle="Configure rules, manage stages, and monitor SLA" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map(({ href, title, desc, icon: Icon, color }) => (
          <Link key={href} href={href} className="clickable-card clay-card p-6 block group">
            <div className="p-3 rounded-2xl w-fit mb-4" style={{ backgroundColor: `${color}15` }}>
              <Icon size={28} style={{ color }} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#5b2c6f] transition-colors">{title}</h3>
            <p className="text-sm text-slate-500 mt-2">{desc}</p>
          </Link>
        ))}
      </div>
      <div className="clay-card p-6">
        <h2 className="text-base font-bold text-slate-800 mb-4">Lifecycle Funnel</h2>
        <div className="flex flex-wrap gap-2 text-xs font-medium">
          {['Registered', 'Applied', 'AutoMatched', 'DocAudit', 'BGCheck', 'Screening', 'CSR', 'Funded'].map((s, i) => (
            <span key={s} className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-[#5b2c6f]/10 text-[#5b2c6f]">{s}</span>
              {i < 7 && <span className="text-slate-300">→</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
