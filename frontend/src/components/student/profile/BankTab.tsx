'use client';

import { useState } from 'react';
import { Save, ShieldCheck } from 'lucide-react';
import { studentApi } from '@/lib/api';
import type { StudentProfile } from '@/types';

interface BankTabProps {
  profile: StudentProfile;
  onUpdate: () => void;
}

export default function BankTab({ profile, onUpdate }: BankTabProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    bankAccountNo: profile.bankAccountNo || '',
    bankIFSC: profile.bankIFSC || '',
    bankName: profile.bankName || '',
    isAadhaarLinkedToBank: profile.isAadhaarLinkedToBank || false,
    isEKYCVerified: profile.isEKYCVerified || false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await studentApi.updateProfile({
        bankAccountNo: formData.bankAccountNo,
        bankIFSC: formData.bankIFSC,
        bankName: formData.bankName,
        isAadhaarLinkedToBank: formData.isAadhaarLinkedToBank,
        isEKYCVerified: formData.isEKYCVerified,
      });
      setSuccess(true);
      onUpdate();
    } catch (err) {
      console.error(err);
      alert('Failed to update bank details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Bank Details</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Your account information for scholarship disbursement.</p>
      </div>

      <div className="mb-8 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
        <div className="text-emerald-600 mt-0.5"><ShieldCheck size={20} /></div>
        <div>
          <h4 className="text-sm font-bold text-emerald-800">Secure Encrypted Data</h4>
          <p className="text-xs font-medium text-emerald-600/80 mt-0.5 leading-relaxed">
            Your bank details are stored with bank-grade encryption and are only used for direct scholarship fund transfers. We will never share this with third parties.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Account Number</label>
            <input 
              type="text" 
              name="bankAccountNo"
              value={formData.bankAccountNo}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none transition-all shadow-sm tracking-widest font-mono"
              placeholder="e.g. 123456789012"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">IFSC Code</label>
            <input 
              type="text" 
              name="bankIFSC"
              value={formData.bankIFSC}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none transition-all shadow-sm uppercase font-mono tracking-wider"
              placeholder="e.g. SBIN0001234"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Bank Name</label>
            <input 
              type="text" 
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none transition-all shadow-sm"
              placeholder="e.g. State Bank of India"
            />
          </div>

          <div className="space-y-4 md:col-span-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl mt-2">
            <h3 className="text-sm font-bold text-slate-800 mb-2">Government Scholarship Mandates (NPCI)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center h-full gap-3 bg-white p-3 rounded-xl border border-slate-200 cursor-pointer shadow-sm">
                <input 
                  type="checkbox" name="isAadhaarLinkedToBank" checked={formData.isAadhaarLinkedToBank} onChange={handleChange}
                  className="w-5 h-5 rounded border-slate-300 text-[#5b2c6f] focus:ring-[#5b2c6f]"
                />
                Is Aadhaar Linked to this Bank Account? (NPCI Mapping)
              </label>
              
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center h-full gap-3 bg-white p-3 rounded-xl border border-slate-200 cursor-pointer shadow-sm">
                <input 
                  type="checkbox" name="isEKYCVerified" checked={formData.isEKYCVerified} onChange={handleChange}
                  className="w-5 h-5 rounded border-slate-300 text-[#5b2c6f] focus:ring-[#5b2c6f]"
                />
                Is Bank eKYC Verified?
              </label>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">* These are mandatory for DBT (Direct Benefit Transfer) government scholarships.</p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <div>
            {success && <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">✓ Saved successfully</span>}
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#5b2c6f] to-[#2e86c1] text-white text-sm font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 shadow-[0_8px_20px_rgba(91,44,111,0.2)]"
          >
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
            {loading ? 'Saving...' : 'Securely Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
