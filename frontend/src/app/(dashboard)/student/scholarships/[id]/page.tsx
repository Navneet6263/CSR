'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, IndianRupee, Calendar, Users, Building, 
  CheckCircle2, FileText, AlertCircle, ShieldCheck
} from 'lucide-react';
import TopBar from '@/components/dashboard/TopBar';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { scholarshipApi, studentApi } from '@/lib/api';
import { mapScholarship } from '@/lib/mappers';
import type { Scholarship } from '@/types';
import { calculateProfileCompletion } from '@/lib/profileUtils';

export default function ScholarshipDetailPage() {
  const router = useRouter();
  const params = useParams();
  const scholarshipId = Number(params?.id);

  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!scholarshipId) {
      router.push('/student/scholarships');
      return;
    }

    const fetchDetails = async () => {
      try {
        const [schRes, profRes] = await Promise.all([
          scholarshipApi.getById(scholarshipId),
          studentApi.getProfile()
        ]);
        if (schRes.data) setScholarship(mapScholarship(schRes.data as any));
        if (profRes.data) setProfile(profRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [scholarshipId, router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[70vh]"><LoadingSpinner size="lg" /></div>;
  }

  if (!scholarship) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <AlertCircle size={48} className="text-red-400" />
        <p className="text-lg font-bold text-slate-800">Scholarship not found</p>
        <button onClick={() => router.push('/student/scholarships')} className="text-emerald-600 font-bold hover:underline">Return to Catalog</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      <TopBar title="Scholarship Details" subtitle="Review the criteria and terms before applying" />

      {/* Back Button */}
      <button 
        onClick={() => router.push('/student/scholarships')}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Catalog
      </button>

      {/* Header Card */}
      <div className="clay-card p-6 md:p-10 border border-white/60 bg-white/70 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#5b2c6f]/5 to-[#2e86c1]/5 rounded-bl-full -z-10" />
        
        <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider rounded-xl border border-emerald-100 mb-6">
          {scholarship.status}
        </span>
        
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 leading-tight mb-4">{scholarship.name}</h1>
        
        <div className="flex items-center gap-3 text-slate-600 mb-8">
          <Building size={20} className="text-[#2e86c1]" />
          <span className="font-semibold text-lg">{scholarship.sponsorName}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Grant Amount</p>
            <div className="flex items-center gap-2 text-slate-800 font-black text-lg">
              <IndianRupee size={16} className="text-emerald-500" />
              {scholarship.perStudentAmount.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Deadline</p>
            <div className="flex items-center gap-2 text-slate-800 font-black text-lg">
              <Calendar size={16} className="text-blue-500" />
              {new Date(scholarship.applicationCloseDate).toLocaleDateString()}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Slots</p>
            <div className="flex items-center gap-2 text-slate-800 font-black text-lg">
              <Users size={16} className="text-amber-500" />
              {scholarship.maxApplicants || 'Unlimited'}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Budget</p>
            <div className="flex items-center gap-2 text-slate-800 font-black text-lg">
              <IndianRupee size={16} className="text-[#5b2c6f]" />
              {(scholarship.totalBudget / 100000).toFixed(1)}L
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Details & Terms */}
        <div className="md:col-span-2 space-y-6">
          <div className="clay-card p-6 border border-white/60 bg-white/70">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-[#5b2c6f]" /> About the Program
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium text-sm">
              {scholarship.description || 'This scholarship is aimed at providing financial assistance to meritorious and deserving students from economically weaker sections. The grant covers tuition fees, living expenses, and academic resources.'}
            </p>
          </div>

          <div className="clay-card p-6 border border-white/60 bg-white/70">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-600" /> Terms & Conditions
            </h2>
            <ul className="space-y-3 text-sm font-medium text-slate-600">
              <li className="flex gap-3">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                Funds must be utilized exclusively for academic purposes.
              </li>
              <li className="flex gap-3">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                The applicant must not be a recipient of any other major corporate scholarship for the same academic year.
              </li>
              <li className="flex gap-3">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                Periodic academic progress reports may be requested by the sponsor.
              </li>
              <li className="flex gap-3">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                Any false information provided will lead to immediate cancellation and potential recovery of funds.
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Apply CTA */}
        <div className="md:col-span-1">
          <div className="clay-card p-6 border border-white/60 bg-white/70 sticky top-24">
            <h3 className="font-bold text-slate-800 mb-2">Ready to apply?</h3>
            <p className="text-xs font-medium text-slate-500 mb-6">
              Make sure your profile is 100% complete and all documents are uploaded before applying.
            </p>

            {profile && calculateProfileCompletion(profile) < 100 ? (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs font-bold text-amber-700 flex items-center gap-2 mb-2">
                  <AlertCircle size={14} /> Profile Incomplete ({calculateProfileCompletion(profile)}%)
                </p>
                <p className="text-[10px] text-amber-600 mb-3">You must complete your profile before applying for any scholarship.</p>
                <button 
                  onClick={() => router.push('/student/profile')}
                  className="w-full py-2 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg hover:bg-amber-200 transition-colors"
                >
                  Complete Profile
                </button>
              </div>
            ) : null}
            
            <button 
              onClick={() => router.push(`/student/apply/${scholarshipId}`)}
              disabled={profile && calculateProfileCompletion(profile) < 100}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#5b2c6f] to-[#2e86c1] text-white font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-[0_8px_20px_rgba(91,44,111,0.2)]"
            >
              Start Application
            </button>
            
            <p className="text-center text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-wider">
              Takes ~2 minutes
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
