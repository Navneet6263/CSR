import { FileText, CheckCircle, Clock, GraduationCap } from 'lucide-react';

interface StatsCardsProps {
  total: number;
  approved: number;
  pending: number;
  matched: number;
}

const stats = [
  { key: 'total', label: 'Total Applications', icon: FileText, color: 'text-[#5b2c6f]', bg: 'bg-[#5b2c6f]/5' },
  { key: 'approved', label: 'Approved', icon: CheckCircle, color: 'text-[#0e6251]', bg: 'bg-[#0e6251]/5' },
  { key: 'pending', label: 'Pending', icon: Clock, color: 'text-[#2e86c1]', bg: 'bg-[#2e86c1]/5' },
  { key: 'matched', label: 'Matched Scholarships', icon: GraduationCap, color: 'text-[#f39c12]', bg: 'bg-[#f39c12]/5' },
] as const;

export default function StatsCards({ total, approved, pending, matched }: StatsCardsProps) {
  const values: Record<string, number> = { total, approved, pending, matched };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.key}
            className="clay-card p-5 flex items-start gap-4 transition-transform duration-200 hover:scale-[1.02]"
          >
            <div className={`p-3 rounded-2xl ${stat.bg}`}>
              <Icon size={22} className={stat.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {values[stat.key]}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {stat.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
