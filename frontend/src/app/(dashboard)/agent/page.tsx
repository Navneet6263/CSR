'use client';

import { Users, UserPlus, TrendingUp } from 'lucide-react';
import TopBar from '@/components/dashboard/TopBar';

export default function AgentDashboard() {
  const stats = [
    { label: 'Registered', value: '—', icon: Users, color: '#5b2c6f' },
    { label: 'Submitted', value: '—', icon: UserPlus, color: '#2e86c1' },
    { label: 'Approval Rate', value: '—', icon: TrendingUp, color: '#0e6251' },
  ];

  return (
    <div className="space-y-6 animate-card-entrance">
      <TopBar title="Agent Dashboard" subtitle="Register students and track application progress" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="clay-card p-6 flex items-center gap-4">
            <div className="p-3 rounded-2xl" style={{ backgroundColor: `${color}15` }}>
              <Icon size={24} style={{ color }} />
            </div>
            <div>
              <p className="text-sm text-slate-500">{label}</p>
              <p className="text-2xl font-bold text-slate-800">{value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="clay-card p-8 text-center text-slate-500">
        <p className="text-sm">Bulk CSV registration and commission tracking connect to the Agent API endpoints.</p>
      </div>
    </div>
  );
}
