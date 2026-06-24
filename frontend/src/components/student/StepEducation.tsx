'use client';

import { useState } from 'react';
import type { Institution } from '@/types';

interface StepEducationProps {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
  institutions: Institution[];
}

export default function StepEducation({ data, onChange, errors, institutions }: StepEducationProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => String(currentYear - i));
  const [showOtherInput, setShowOtherInput] = useState(data.institutionId === 'other');

  const handleInstitutionChange = (value: string) => {
    if (value === 'other') {
      setShowOtherInput(true);
      onChange('institutionId', 'other');
      onChange('otherInstitutionName', '');
    } else {
      setShowOtherInput(false);
      onChange('institutionId', value);
      onChange('otherInstitutionName', '');
    }
  };

  return (
    <div className="clay-card p-6 space-y-5 animate-card-entrance">
      <h3 className="text-lg font-bold text-slate-800">Education Details</h3>
      <p className="text-sm text-slate-400">Your academic information</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">Course / Program</label>
          <input value={data.course || ''} onChange={(e) => onChange('course', e.target.value)}
            placeholder="e.g., B.Tech Computer Science"
            className="w-full px-4 py-3 bg-white/60 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 border border-white/60 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.04),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-[#5b2c6f]/20 transition-all"
          />
          {errors.course && <p className="text-xs text-[#c0392b] mt-1">{errors.course}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">Institution</label>
          <select value={showOtherInput ? 'other' : data.institutionId || ''}
            onChange={(e) => handleInstitutionChange(e.target.value)}
            className="w-full px-4 py-3 bg-white/60 rounded-2xl text-sm text-slate-800 border border-white/60 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.04),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-[#5b2c6f]/20 transition-all"
          >
            <option value="">Select your institution...</option>
            {institutions.map((inst: any) => {
              const id = inst.institutionId || inst.InstitutionID;
              const name = inst.name || inst.Name;
              const district = inst.district || inst.District;
              const state = inst.state || inst.State;
              return (
                <option key={id} value={id}>
                  {name} — {district}, {state}
                </option>
              );
            })}
            <option value="other" className="font-semibold text-[#5b2c6f]">Other (Enter Manually)</option>
          </select>
          {errors.institutionId && <p className="text-xs text-[#c0392b] mt-1">{errors.institutionId}</p>}
        </div>

        {showOtherInput && (
          <div className="animate-card-entrance">
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Institution Name</label>
            <input value={data.otherInstitutionName || ''} 
              onChange={(e) => onChange('otherInstitutionName', e.target.value)}
              placeholder="Enter your institution name"
              className="w-full px-4 py-3 bg-white/60 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 border border-white/60 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.04),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-[#5b2c6f]/20 transition-all"
            />
            {errors.otherInstitutionName && <p className="text-xs text-[#c0392b] mt-1">{errors.otherInstitutionName}</p>}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">Enrollment Year</label>
          <select value={data.enrollmentYear || ''}
            onChange={(e) => onChange('enrollmentYear', e.target.value)}
            className="w-full px-4 py-3 bg-white/60 rounded-2xl text-sm text-slate-800 border border-white/60 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.04),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-[#5b2c6f]/20 transition-all"
          >
            <option value="">Select year...</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          {errors.enrollmentYear && <p className="text-xs text-[#c0392b] mt-1">{errors.enrollmentYear}</p>}
        </div>
      </div>
    </div>
  );
}
