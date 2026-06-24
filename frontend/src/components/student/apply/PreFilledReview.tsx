'use client';

import { User, Mail, Phone, BookOpen, CreditCard, Edit3, FileText } from 'lucide-react';
import type { StudentProfile } from '@/types';
import { useRouter } from 'next/navigation';

interface PreFilledReviewProps {
  profile: StudentProfile;
}

export default function PreFilledReview({ profile }: PreFilledReviewProps) {
  const router = useRouter();

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Review Your Application</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Your details have been pre-filled from your profile. Please review them.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Basic Details */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 relative group">
          <div className="flex items-center gap-2 text-slate-800 font-bold mb-4">
            <User size={18} className="text-[#5b2c6f]" /> Basic Details
          </div>
          <button 
            onClick={() => router.push('/student/profile?tab=personal')}
            className="absolute top-6 right-6 text-slate-400 hover:text-[#5b2c6f] transition-colors"
          >
            <Edit3 size={16} />
          </button>
          
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{profile.firstName} {profile.lastName}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DOB</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{profile.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gender</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{profile.gender || 'N/A'}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Address</p>
              <p className="text-sm font-medium text-slate-700 mt-0.5 leading-relaxed">{profile.address || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 relative group">
          <div className="flex items-center gap-2 text-slate-800 font-bold mb-4">
            <Phone size={18} className="text-[#2e86c1]" /> Contact Details
          </div>
          <button 
            onClick={() => router.push('/student/profile?tab=personal')}
            className="absolute top-6 right-6 text-slate-400 hover:text-[#2e86c1] transition-colors"
          >
            <Edit3 size={16} />
          </button>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Mail size={16} /></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                <p className="text-sm font-semibold text-slate-800">{profile.email || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Phone size={16} /></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile Number</p>
                <p className="text-sm font-semibold text-slate-800">{profile.phone || 'N/A'}</p>
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-2">
              Note: Changing contact details requires OTP verification in your profile settings.
            </p>
          </div>
        </div>

        {/* Academic Details */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 relative group">
          <div className="flex items-center gap-2 text-slate-800 font-bold mb-4">
            <BookOpen size={18} className="text-[#0e6251]" /> Academic Details
          </div>
          <button 
            onClick={() => router.push('/student/profile?tab=education')}
            className="absolute top-6 right-6 text-slate-400 hover:text-[#0e6251] transition-colors"
          >
            <Edit3 size={16} />
          </button>
          
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Degree</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{profile.currentDegree || 'N/A'} (Year {profile.yearOfStudy || 'N/A'})</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Institution</p>
              <p className="text-sm font-medium text-slate-700 mt-0.5">{profile.institutionName || profile.otherInstitutionName || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 relative group">
          <div className="flex items-center gap-2 text-slate-800 font-bold mb-4">
            <CreditCard size={18} className="text-[#f39c12]" /> Disbursement Details
          </div>
          <button 
            onClick={() => router.push('/student/profile?tab=bank')}
            className="absolute top-6 right-6 text-slate-400 hover:text-[#f39c12] transition-colors"
          >
            <Edit3 size={16} />
          </button>
          
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bank Name</p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">{profile.bankName || 'N/A'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account No.</p>
                <p className="text-sm font-mono font-semibold text-slate-800 mt-0.5">
                  {profile.bankAccountNumber ? `••••${profile.bankAccountNumber.slice(-4)}` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">IFSC Code</p>
                <p className="text-sm font-mono font-semibold text-slate-800 mt-0.5">{profile.ifscCode || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Details */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 relative group md:col-span-2">
          <div className="flex items-center gap-2 text-slate-800 font-bold mb-4">
            <FileText size={18} className="text-[#8e44ad]" /> Documents Uploaded
          </div>
          <button 
            onClick={() => router.push('/student/profile?tab=documents')}
            className="absolute top-6 right-6 text-slate-400 hover:text-[#8e44ad] transition-colors"
          >
            <Edit3 size={16} />
          </button>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">
              Your uploaded documents (Aadhaar, Income Proof, etc.) have been linked to this application.
            </p>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-sm text-amber-800 font-semibold">
                ⚠️ Re-check your documents in your profile. Once the audit team verifies everything, the screening process will begin.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
