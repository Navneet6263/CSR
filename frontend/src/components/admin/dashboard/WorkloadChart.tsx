'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { MoreHorizontal } from 'lucide-react';

export default function WorkloadChart({ workload }: { workload: any }) {
  if (!workload) return null;

  const data = [
    { name: 'Docs', value: workload.docCheckers, color: '#1e293b' },
    { name: 'BG', value: workload.bgCheckers, color: '#94a3b8' },
    { name: 'Screen', value: workload.screeners, color: '#cbd5e1' },
    { name: 'CSR', value: workload.csrPartners, color: '#f1f5f9' },
  ];

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm h-96 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-slate-500">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>
          <h3 className="text-[11px] font-bold uppercase tracking-widest">Role Workload</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded">Daily ▾</span>
          <MoreHorizontal size={16} className="text-slate-400 cursor-pointer hover:text-slate-800 transition-colors ml-1" />
        </div>
      </div>
      
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#cbd5e1', fontWeight: 600 }} />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px', padding: '8px 12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              itemStyle={{ color: '#fff', fontWeight: 'bold' }}
              labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
