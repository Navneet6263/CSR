'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { studentApi } from '@/lib/api';
import type { StudentProfile } from '@/types';

interface CorporateTabProps {
  profile: StudentProfile;
  onUpdate: () => void;
}

export default function CorporateTab({ profile, onUpdate }: CorporateTabProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    statementOfPurpose: profile.statementOfPurpose || '',
    extracurricularActivities: profile.extracurricularActivities || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await studentApi.updateProfile(formData);
      setSuccess(true);
      onUpdate();
    } catch (err) {
      console.error(err);
      alert('Failed to update corporate details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Corporate & CSR Extras</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Stand out for private and corporate scholarships.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Statement of Purpose (SOP)</label>
          <p className="text-xs text-slate-500 mb-2">Write about your goals, why you need this scholarship, and how it will help you (Max 500 words).</p>
          <textarea 
            name="statementOfPurpose" value={formData.statementOfPurpose} onChange={handleChange} rows={6}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none shadow-sm resize-none custom-scrollbar"
            placeholder="I am applying for this scholarship because..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Extracurricular Activities & Achievements</label>
          <p className="text-xs text-slate-500 mb-2">List any sports, community service, or awards you have received.</p>
          <textarea 
            name="extracurricularActivities" value={formData.extracurricularActivities} onChange={handleChange} rows={4}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none shadow-sm resize-none custom-scrollbar"
            placeholder="1. Won state level debate competition&#10;2. Volunteer at local NGO..."
          />
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <div>
            {success && <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">✓ Saved successfully</span>}
          </div>
          <button 
            type="submit" disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#5b2c6f] to-[#2e86c1] text-white text-sm font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 shadow-[0_8px_20px_rgba(91,44,111,0.2)]"
          >
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
