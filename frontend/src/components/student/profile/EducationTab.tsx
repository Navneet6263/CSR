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
    course: profile.course || '',
    currentSemesterOrYear: profile.currentSemesterOrYear || '',
    enrollmentYear: profile.enrollmentYear ? String(profile.enrollmentYear) : '',
    admissionRegistrationNo: profile.admissionRegistrationNo || '',
    
    previousYearMarks: profile.previousYearMarks || '',
    
    tenthBoardName: profile.tenthBoardName || '',
    tenthPassingYear: profile.tenthPassingYear || '',
    tenthMarks: profile.tenthMarks || '',
    
    twelfthBoardName: profile.twelfthBoardName || '',
    twelfthPassingYear: profile.twelfthPassingYear || '',
    twelfthMarks: profile.twelfthMarks || '',

    isHosteller: profile.isHosteller || false,
    distanceFromHome: profile.distanceFromHome || '',
    
    hasGapYear: profile.hasGapYear || false,
    gapYearExplanation: profile.gapYearExplanation || '',

    receivedPreviousScholarship: profile.receivedPreviousScholarship || false,
    previousScholarshipName: profile.previousScholarshipName || '',
    previousScholarshipAmount: profile.previousScholarshipAmount || '',
    previousScholarshipYear: profile.previousScholarshipYear || '',
  });

  useEffect(() => {
    institutionApi.getAll().then(res => setInstitutions(res.data || []));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await studentApi.updateProfile({
        institutionId: formData.institutionId ? parseInt(formData.institutionId) : undefined,
        course: formData.course,
        currentSemesterOrYear: formData.currentSemesterOrYear,
        enrollmentYear: formData.enrollmentYear ? parseInt(formData.enrollmentYear) : undefined,
        admissionRegistrationNo: formData.admissionRegistrationNo,
        
        previousYearMarks: formData.previousYearMarks ? Number(formData.previousYearMarks) : undefined,
        
        tenthBoardName: formData.tenthBoardName,
        tenthPassingYear: formData.tenthPassingYear ? parseInt(formData.tenthPassingYear) : undefined,
        tenthMarks: formData.tenthMarks ? Number(formData.tenthMarks) : undefined,
        
        twelfthBoardName: formData.twelfthBoardName,
        twelfthPassingYear: formData.twelfthPassingYear ? parseInt(formData.twelfthPassingYear) : undefined,
        twelfthMarks: formData.twelfthMarks ? Number(formData.twelfthMarks) : undefined,

        isHosteller: formData.isHosteller,
        distanceFromHome: formData.distanceFromHome ? Number(formData.distanceFromHome) : undefined,
        
        hasGapYear: formData.hasGapYear,
        gapYearExplanation: formData.gapYearExplanation,

        receivedPreviousScholarship: formData.receivedPreviousScholarship,
        previousScholarshipName: formData.previousScholarshipName,
        previousScholarshipAmount: formData.previousScholarshipAmount ? Number(formData.previousScholarshipAmount) : undefined,
        previousScholarshipYear: formData.previousScholarshipYear ? parseInt(formData.previousScholarshipYear) : undefined,
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
        <p className="text-sm font-medium text-slate-500 mt-1">Provide your previous and current academic details.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Past Academics */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Previous Qualifications (10th & 12th)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">10th Board Name</label>
              <input 
                type="text" name="tenthBoardName" value={formData.tenthBoardName} onChange={handleChange} required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">10th Passing Year</label>
              <input 
                type="number" name="tenthPassingYear" value={formData.tenthPassingYear} onChange={handleChange} required min="1990" max="2100"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">10th Marks (%)</label>
              <input 
                type="number" step="0.01" name="tenthMarks" value={formData.tenthMarks} onChange={handleChange} required min="0" max="100"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">12th Board Name</label>
              <input 
                type="text" name="twelfthBoardName" value={formData.twelfthBoardName} onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">12th Passing Year</label>
              <input 
                type="number" name="twelfthPassingYear" value={formData.twelfthPassingYear} onChange={handleChange} min="1990" max="2100"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">12th Marks (%)</label>
              <input 
                type="number" step="0.01" name="twelfthMarks" value={formData.twelfthMarks} onChange={handleChange} min="0" max="100"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Current Academics */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Current Degree / Course</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Institution / College</label>
              <select 
                name="institutionId" value={formData.institutionId} onChange={handleChange} required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none shadow-sm appearance-none"
              >
                <option value="">Select your institution</option>
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Current Degree (Course)</label>
              <select 
                name="course" value={formData.course} onChange={handleChange} required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none shadow-sm appearance-none"
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
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Semester / Year of Study</label>
              <select 
                name="currentSemesterOrYear" value={formData.currentSemesterOrYear} onChange={handleChange} required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none shadow-sm appearance-none"
              >
                <option value="">Select year/semester</option>
                <option value="1st Semester">1st Semester</option>
                <option value="2nd Semester">2nd Semester</option>
                <option value="3rd Semester">3rd Semester</option>
                <option value="4th Semester">4th Semester</option>
                <option value="5th Semester">5th Semester</option>
                <option value="6th Semester">6th Semester</option>
                <option value="7th Semester">7th Semester</option>
                <option value="8th Semester">8th Semester</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Admission / Reg No.</label>
              <input 
                type="text" name="admissionRegistrationNo" value={formData.admissionRegistrationNo} onChange={handleChange} required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none shadow-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Enrollment Year</label>
              <input 
                type="number" name="enrollmentYear" value={formData.enrollmentYear} onChange={handleChange} required min="2010" max="2030"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none shadow-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Previous Year Marks (%)</label>
              <input 
                type="number" step="0.01" name="previousYearMarks" value={formData.previousYearMarks} onChange={handleChange} required min="0" max="100"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Accommodation & Gap Year */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Accommodation & Academic Gaps</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center h-full gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 cursor-pointer">
                <input 
                  type="checkbox" name="isHosteller" checked={formData.isHosteller} onChange={handleChange}
                  className="w-5 h-5 rounded border-slate-300 text-[#5b2c6f] focus:ring-[#5b2c6f]"
                />
                Are you a Hosteller? (Hostel / PG)
              </label>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Distance From Home (in KM)</label>
              <input 
                type="number" step="0.1" name="distanceFromHome" value={formData.distanceFromHome} onChange={handleChange} min="0"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center h-full gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 cursor-pointer">
                <input 
                  type="checkbox" name="hasGapYear" checked={formData.hasGapYear} onChange={handleChange}
                  className="w-5 h-5 rounded border-slate-300 text-[#5b2c6f] focus:ring-[#5b2c6f]"
                />
                Do you have a Gap Year in your studies?
              </label>
            </div>
            {formData.hasGapYear && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Reason for Gap Year</label>
                <input 
                  type="text" name="gapYearExplanation" value={formData.gapYearExplanation} onChange={handleChange} required
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none shadow-sm"
                  placeholder="e.g. Medical reasons, Preparation for competitive exams"
                />
              </div>
            )}
          </div>
        </div>

        {/* Previous Scholarships */}
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Previous Scholarships</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 cursor-pointer w-fit">
                <input 
                  type="checkbox" name="receivedPreviousScholarship" checked={formData.receivedPreviousScholarship} onChange={handleChange}
                  className="w-5 h-5 rounded border-slate-300 text-[#5b2c6f] focus:ring-[#5b2c6f]"
                />
                Have you received any other scholarship previously?
              </label>
            </div>
            
            {formData.receivedPreviousScholarship && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Scholarship Name</label>
                  <input 
                    type="text" name="previousScholarshipName" value={formData.previousScholarshipName} onChange={handleChange} required
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Amount Received (₹)</label>
                  <input 
                    type="number" name="previousScholarshipAmount" value={formData.previousScholarshipAmount} onChange={handleChange} required min="0"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Year</label>
                  <input 
                    type="number" name="previousScholarshipYear" value={formData.previousScholarshipYear} onChange={handleChange} required min="2010" max="2030"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#5b2c6f]/20 focus:border-[#5b2c6f] outline-none shadow-sm"
                  />
                </div>
              </div>
            )}
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
