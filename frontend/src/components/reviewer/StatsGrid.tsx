'use client';

import { AlertTriangle, CheckCircle2, Inbox, RotateCcw } from 'lucide-react';

export interface ReviewerStats { pendingReview?: number; approvedToday?: number; rejectedToday?: number; overdue?: number; }

export function StatsGrid({ stats }: { stats: ReviewerStats }) {
  const items = [
    { label: 'Pending Queue', value: stats.pendingReview ?? 0, icon: Inbox, accent: 'primary' },
    { label: 'Verified Today', value: stats.approvedToday ?? 0, icon: CheckCircle2, accent: 'success' },
    { label: 'Re-uploads Requested', value: stats.rejectedToday ?? 0, icon: RotateCcw, accent: 'warn' },
    { label: 'Past 48h SLA', value: stats.overdue ?? 0, icon: AlertTriangle, accent: 'danger' },
  ];
  const accentMap: Record<string, string> = {
    primary: 'text-primary bg-primary/10 border-primary/30',
    success: 'text-success bg-success/10 border-success/30',
    warn: 'text-warn bg-warn/10 border-warn/30',
    danger: 'text-danger bg-danger/10 border-danger/30',
  };
  return <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
    {items.map((item) => <div key={item.label} className="glass group relative overflow-hidden p-5">
      <div className="flex items-start justify-between"><div>
        <div className="text-xs font-mono uppercase tracking-wider text-fg-subtle">{item.label}</div>
        <div className="mt-3 text-3xl font-display font-bold tabular-nums">{item.value}</div>
      </div><div className={`grid h-10 w-10 place-items-center rounded-lg border ${accentMap[item.accent]}`}>
        <item.icon className="h-4 w-4" />
      </div></div>
    </div>)}
  </div>;
}
