import { Building2 } from 'lucide-react';

export function PaymentDetailRow({ icon: Icon, label, value, mono, pill }: {
  icon: typeof Building2; label: string; value: string; mono?: boolean; pill?: 'success' | 'warn';
}) {
  return <div className="flex items-center justify-between gap-3 border-b border-navy-100/70 py-2 last:border-0">
    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-navy-500"><Icon size={14}/>{label}</div>
    {pill ? <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${pill === 'success' ? 'bg-success-500 text-white' : 'bg-amber-500 text-white'}`}>{value}</span>
      : <div className={`min-w-0 truncate text-right text-navy-900 ${mono ? 'font-mono text-sm font-bold' : 'text-sm font-semibold'}`}>{value}</div>}
  </div>;
}
