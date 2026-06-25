'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { studentApi } from '@/lib/api';
import type { StudentProfile } from '@/types';

interface PersonalTabProps {
  profile: StudentProfile;
  onUpdate: () => void;
}

export default function PersonalTab({ profile, onUpdate }: PersonalTabProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    phone: profile.phone || '',
    dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '',
    gender: profile.gender || '',
    category: profile.category || '',
    aadharNumber: profile.aadharNumber || '',
    alternatePhone: profile.alternatePhone || '',
    address: profile.address || '',
    city: profile.city || '',
    state: profile.state || '',
    pincode: profile.pincode || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await studentApi.updateProfile({
        ...formData,
        dob: formData.dob ? new Date(formData.dob).toISOString() : undefined,
      });
      setSuccess(true);
      onUpdate(); // refresh parent state
    } catch (err) {
      console.error(err);
      alert('Failed to update personal details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Personal Details</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Basic identity and contact information.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Read-only Identity */}
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Account Identity (Cannot be changed)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Full Name</label>
              <div className="text-sm font-bold text-slate-800">{profile.fullName || 'N/A'}</div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Email Address</label>
              <div className="text-sm font-bold text-slate-800">{profile.email || 'N/A'}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Phone Number</label>
            <input 
              type="tel" name="phone" value={formData.phone} onChange={handleChange} required
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none transition-all shadow-sm"
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Alternate Phone (Parent)</label>
            <input 
              type="tel" name="alternatePhone" value={formData.alternatePhone} onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none shadow-sm"
              placeholder="+91 Parent's No."
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Aadhar Number</label>
            <input 
              type="text" name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} required maxLength={12}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none transition-all shadow-sm"
              placeholder="12-digit Aadhar"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Date of Birth</label>
            <input 
              type="date" name="dob" value={formData.dob} onChange={handleChange} required
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none transition-all shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Gender</label>
            <select 
              name="gender" value={formData.gender} onChange={handleChange} required
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none transition-all shadow-sm"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Category</label>
            <select 
              name="category" value={formData.category} onChange={handleChange} required
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none transition-all shadow-sm"
            >
              <option value="">Select Category</option>
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
            </select>
          </div>
        </div>

        <div className="space-y-6 pt-4 border-t border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Current Address</h3>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Address (Include Landmark)</label>
            <textarea 
              name="address" value={formData.address} onChange={handleChange} required rows={2}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none transition-all shadow-sm resize-none"
              placeholder="House No, Street, Landmark..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">City / District</label>
              <input 
                type="text" name="city" value={formData.city} onChange={handleChange} required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none transition-all shadow-sm"
                placeholder="City"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">State</label>
              <input 
                type="text" name="state" value={formData.state} onChange={handleChange} required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none transition-all shadow-sm"
                placeholder="State"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pincode</label>
              <input 
                type="text" name="pincode" value={formData.pincode} onChange={handleChange} required maxLength={6}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none transition-all shadow-sm"
                placeholder="Pincode"
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
