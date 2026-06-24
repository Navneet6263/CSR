'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { studentApi, institutionApi } from '@/lib/api';
import type { StudentProfile, Institution } from '@/types';

interface EducationTabProps {
  profile: StudentProfile;
  onUpdate: () => void;
}

export default function EducationTab({ profile, onUpdate }: EducationTabProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  
  const [formData, setFormData] = useState({
    institutionId: profile.institutionId ? String(profile.institutionId) : '',
    currentDegree: profile.currentDegree || '',
    yearOfStudy: profile.yearOfStudy ? String(profile.yearOfStudy) : '',
    cgpaOrPercentage: profile.cgpaOrPercentage ? String(profile.cgpaOrPercentage) : '',
  });

  useEffect(() => {
    institutionApi.getAll().then(res => setInstitutions(res.data || []));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await studentApi.updateProfile({
        institutionId: formData.institutionId ? parseInt(formData.institutionId) : undefined,
        course: formData.currentDegree,
        enrollmentYear: formData.yearOfStudy ? parseInt(formData.yearOfStudy) : undefined,
      });
      setSuccess(true);
      onUpdate();
    } catch (err) {
      console.error(err);
      alert('Failed to update education details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Education Background</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Provide your current academic details to match with scholarships.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Institution / College</label>
            <select 
              name="institutionId"
              value={formData.institutionId}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none transition-all shadow-sm appearance-none"
            >
              <option value="">Select your institution</option>
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Current Degree</label>
            <select 
              name="currentDegree"
              value={formData.currentDegree}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none transition-all shadow-sm appearance-none"
            >
              <option value="">Select degree</option>
              <option value="B.Tech">B.Tech</option>
              <option value="B.Sc">B.Sc</option>
              <option value="B.Com">B.Com</option>
              <option value="B.A">B.A</option>
              <option value="M.Tech">M.Tech</option>
              <option value="MBA">MBA</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Year of Study</label>
            <select 
              name="yearOfStudy"
              value={formData.yearOfStudy}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none transition-all shadow-sm appearance-none"
            >
              <option value="">Select year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
              <option value="5">5th Year</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">CGPA / Percentage</label>
            <input 
              type="number" 
              step="0.01"
              name="cgpaOrPercentage"
              value={formData.cgpaOrPercentage}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none transition-all shadow-sm"
              placeholder="e.g. 8.5 or 85.0"
            />
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
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
