'use client';

import { IndianRupee, Users, Sparkles } from 'lucide-react';

interface StepIncomeProps {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
  matchedCount?: number;
}

export default function StepIncome({ data, onChange, errors, matchedCount = 0 }: StepIncomeProps) {
  const formatCurrency = (val: string) => {
    const num = parseInt(val);
    if (isNaN(num)) return '';
    return num.toLocaleString('en-IN');
  };

  return (
    <div className="clay-card p-6 space-y-5 animate-card-entrance">
      <h3 className="text-lg font-bold text-slate-800">Family Income</h3>
      <p className="text-sm text-slate-400">This helps us match you with eligible scholarships</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">Annual Family Income</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <IndianRupee size={16} />
            </div>
            <input type="number" value={data.annualFamilyIncome || ''}
              onChange={(e) => onChange('annualFamilyIncome', e.target.value)}
              placeholder="e.g., 300000"
              className="w-full pl-10 pr-4 py-3 bg-white/60 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 border border-white/60 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.04),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-[#5b2c6f]/20 transition-all"
            />
          </div>
          {data.annualFamilyIncome && (
            <p className="text-xs text-slate-400 mt-1">₹ {formatCurrency(data.annualFamilyIncome)} per year</p>
          )}
          {errors.annualFamilyIncome && <p className="text-xs text-[#c0392b] mt-1">{errors.annualFamilyIncome}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">Family Size</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Users size={16} />
            </div>
            <input type="number" value={data.familySize || ''} min={1} max={20}
              onChange={(e) => onChange('familySize', e.target.value)}
              placeholder="Number of family members"
              className="w-full pl-10 pr-4 py-3 bg-white/60 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 border border-white/60 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.04),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-[#5b2c6f]/20 transition-all"
            />
          </div>
          {errors.familySize && <p className="text-xs text-[#c0392b] mt-1">{errors.familySize}</p>}
        </div>
      </div>

      {data.annualFamilyIncome && (
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-[#0e6251]/5 to-[#148f77]/5 border border-[#0e6251]/10 flex items-center gap-3">
          <Sparkles size={20} className="text-[#0e6251]" />
          <div>
            <p className="text-sm font-semibold text-[#0e6251]">
              You match {matchedCount} scholarship{matchedCount !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Based on your income and profile data</p>
          </div>
        </div>
      )}
    </div>
  );
}
