'use client';

import { Building2, ShieldCheck } from 'lucide-react';

interface StepBankProps {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

export default function StepBank({ data, onChange, errors }: StepBankProps) {
  const ifscValid = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.bankIFSC || '');
  const accountMatch = data.bankAccountNo && data.bankAccountConfirm
    && data.bankAccountNo === data.bankAccountConfirm;

  return (
    <div className="clay-card p-6 space-y-5 animate-card-entrance">
      <h3 className="text-lg font-bold text-slate-800">Bank Details</h3>
      <p className="text-sm text-slate-400">For scholarship disbursement</p>

      <div className="p-3 rounded-2xl bg-[#2e86c1]/5 border border-[#2e86c1]/10 flex items-start gap-3">
        <ShieldCheck size={18} className="text-[#2e86c1] mt-0.5 shrink-0" />
        <p className="text-xs text-slate-500">Your bank information is encrypted and stored securely. It will only be used for scholarship payments.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">Bank Account Number</label>
          <input type="text" value={data.bankAccountNo || ''}
            onChange={(e) => onChange('bankAccountNo', e.target.value.replace(/\D/g, ''))}
            placeholder="Enter account number"
            className="w-full px-4 py-3 bg-white/60 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 border border-white/60 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.04),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-[#5b2c6f]/20 transition-all tracking-wider"
          />
          {errors.bankAccountNo && <p className="text-xs text-[#c0392b] mt-1">{errors.bankAccountNo}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">Re-enter Account Number</label>
          <input type="text" value={data.bankAccountConfirm || ''}
            onChange={(e) => onChange('bankAccountConfirm', e.target.value.replace(/\D/g, ''))}
            placeholder="Confirm account number"
            className={`w-full px-4 py-3 bg-white/60 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 border shadow-[inset_2px_2px_4px_rgba(0,0,0,0.04),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-[#5b2c6f]/20 transition-all tracking-wider ${
              data.bankAccountConfirm
                ? accountMatch ? 'border-[#0e6251]/30' : 'border-[#c0392b]/30'
                : 'border-white/60'
            }`}
          />
          {data.bankAccountConfirm && !accountMatch && (
            <p className="text-xs text-[#c0392b] mt-1">Account numbers do not match</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">IFSC Code</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Building2 size={16} />
            </div>
            <input type="text" value={data.bankIFSC || ''} maxLength={11}
              onChange={(e) => onChange('bankIFSC', e.target.value.toUpperCase())}
              placeholder="e.g., SBIN0001234"
              className="w-full pl-10 pr-4 py-3 bg-white/60 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 border border-white/60 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.04),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-[#5b2c6f]/20 transition-all uppercase tracking-wider"
            />
          </div>
          {data.bankIFSC && !ifscValid && data.bankIFSC.length > 3 && (
            <p className="text-xs text-[#f39c12] mt-1">IFSC format: 4 letters + 0 + 6 alphanumeric</p>
          )}
          {errors.bankIFSC && <p className="text-xs text-[#c0392b] mt-1">{errors.bankIFSC}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">Bank Name</label>
          <input type="text" value={data.bankName || ''}
            onChange={(e) => onChange('bankName', e.target.value)}
            placeholder="e.g., State Bank of India"
            className="w-full px-4 py-3 bg-white/60 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 border border-white/60 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.04),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-[#5b2c6f]/20 transition-all"
          />
          {errors.bankName && <p className="text-xs text-[#c0392b] mt-1">{errors.bankName}</p>}
        </div>
      </div>
    </div>
  );
}
