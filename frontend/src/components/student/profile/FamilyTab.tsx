'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { studentApi } from '@/lib/api';
import type { StudentProfile } from '@/types';

interface FamilyTabProps {
  profile: StudentProfile;
  onUpdate: () => void;
}

export default function FamilyTab({ profile, onUpdate }: FamilyTabProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fatherName: profile.fatherName || '',
    fatherOccupation: profile.fatherOccupation || '',
    motherName: profile.motherName || '',
    motherOccupation: profile.motherOccupation || '',
    annualFamilyIncome: profile.annualFamilyIncome || '',
    familySize: profile.familySize || '',
    religion: profile.religion || '',
    isDisabled: profile.isDisabled || false,
    disabilityPercentage: profile.disabilityPercentage || '',
    domicileState: profile.domicileState || '',
    domicileDistrict: profile.domicileDistrict || '',
    casteCertificateNumber: profile.casteCertificateNumber || '',
    casteCertificateIssueDate: profile.casteCertificateIssueDate ? new Date(profile.casteCertificateIssueDate).toISOString().split('T')[0] : '',
    domicileCertificateNumber: profile.domicileCertificateNumber || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await studentApi.updateProfile({
        ...formData,
        annualFamilyIncome: formData.annualFamilyIncome ? Number(formData.annualFamilyIncome) : undefined,
        familySize: formData.familySize ? Number(formData.familySize) : undefined,
        disabilityPercentage: formData.disabilityPercentage ? Number(formData.disabilityPercentage) : undefined,
      });
      setSuccess(true);
      onUpdate();
    } catch (err) {
      console.error(err);
      alert('Failed to update family details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Family & Demographics</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Details about your parents, income, and special status.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Parents Information */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Parents Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Father's Name</label>
              <input 
                type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none transition-all shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Father's Occupation</label>
              <input 
                type="text" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none transition-all shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mother's Name</label>
              <input 
                type="text" name="motherName" value={formData.motherName} onChange={handleChange} required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none transition-all shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mother's Occupation</label>
              <input 
                type="text" name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Economic Details */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Economic Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Annual Family Income (₹)</label>
              <input 
                type="number" name="annualFamilyIncome" value={formData.annualFamilyIncome} onChange={handleChange} required min="0"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none transition-all shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Total Family Members</label>
              <input 
                type="number" name="familySize" value={formData.familySize} onChange={handleChange} required min="1" max="20"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Demographics & Status */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Demographics & Special Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Religion</label>
              <select 
                name="religion" value={formData.religion} onChange={handleChange} required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none transition-all shadow-sm"
              >
                <option value="">Select Religion</option>
                <option value="Hindu">Hindu</option>
                <option value="Muslim">Muslim</option>
                <option value="Christian">Christian</option>
                <option value="Sikh">Sikh</option>
                <option value="Buddhist">Buddhist</option>
                <option value="Jain">Jain</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center h-full gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 cursor-pointer">
                <input 
                  type="checkbox" name="isDisabled" checked={formData.isDisabled} onChange={handleChange}
                  className="w-5 h-5 rounded border-slate-300 text-[#5b2c6f] focus:ring-[#5b2c6f]"
                />
                Is Physically Disabled?
              </label>
            </div>

            {formData.isDisabled && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Disability Percentage (%)</label>
                <input 
                  type="number" name="disabilityPercentage" value={formData.disabilityPercentage} onChange={handleChange} required min="0" max="100"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none transition-all shadow-sm"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Caste Certificate Number</label>
              <input 
                type="text" name="casteCertificateNumber" value={formData.casteCertificateNumber} onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none transition-all shadow-sm"
                placeholder="If applicable (SC/ST/OBC)"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Caste Cert Issue Date</label>
              <input 
                type="date" name="casteCertificateIssueDate" value={formData.casteCertificateIssueDate} onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Domicile */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Domicile Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Domicile State</label>
              <input 
                type="text" name="domicileState" value={formData.domicileState} onChange={handleChange} required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none transition-all shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Domicile District</label>
              <input 
                type="text" name="domicileDistrict" value={formData.domicileDistrict} onChange={handleChange} required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none transition-all shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Domicile Certificate Number</label>
              <input 
                type="text" name="domicileCertificateNumber" value={formData.domicileCertificateNumber} onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none transition-all shadow-sm"
                placeholder="For State Scholarships"
              />
            </div>
          </div>
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
