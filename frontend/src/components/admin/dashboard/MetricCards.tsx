'use client';

import { IndianRupee, TrendingUp, Users, AlertCircle } from 'lucide-react';

export default function MetricCards({ metrics }: { metrics: any }) {
  if (!metrics) return null;

  const cards = [
    {
      title: 'Total Fund Disbursed',
      value: `₹${metrics.financials.fundDisbursed.toLocaleString()}`,
      subtitle: `out of ₹${metrics.financials.totalBudget.toLocaleString()}`,
      icon: IndianRupee,
      trend: '+12%',
      trendUp: true,
      accent: 'emerald',
    },
    {
      title: 'Funds in Pipeline',
      value: `₹${metrics.financials.fundsInPipeline.toLocaleString()}`,
      subtitle: 'Awaiting final CSR approval',
      icon: TrendingUp,
      trend: '+5%',
      trendUp: true,
      accent: 'blue',
    },
    {
      title: 'Total Applications',
      value: metrics.funnel.applied.toLocaleString(),
      subtitle: `${metrics.funnel.approved} fully approved`,
      icon: Users,
      trend: '+18%',
      trendUp: true,
      accent: 'indigo',
    },
    {
      title: 'Action Required',
      value: (metrics.alerts.heldApplications + metrics.alerts.stuckAtBGCheck).toString(),
      subtitle: `${metrics.alerts.heldApplications} on hold, ${metrics.alerts.stuckAtBGCheck} stuck in BG check`,
      icon: AlertCircle,
      trend: 'Requires Attention',
      trendUp: false,
      accent: 'rose',
    },
  ];

  const getColorClass = (accent: string, type: 'bg' | 'text' | 'border') => {
    const map: Record<string, any> = {
      emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
      rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
    };
    return map[accent][type];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Icon size={14} strokeWidth={2.5} className="text-slate-400" />
                <p className="text-[11px] font-bold uppercase tracking-wider">{card.title}</p>
              </div>
              <div className="text-slate-300">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-auto">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{card.value}</h3>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${card.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {card.trend}
              </span>
            </div>
            <div className="mt-2 text-xs font-medium text-slate-400">
              {card.subtitle}
            </div>
          </div>
        );
      })}
    </div>
  );
}
