'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import TopBar from '@/components/dashboard/TopBar';

import PreFilledReview from '@/components/student/apply/PreFilledReview';
import ConsentForm from '@/components/student/apply/ConsentForm';
import SuccessView from '@/components/student/apply/SuccessView';

import { studentApi, scholarshipApi, applicationApi } from '@/lib/api';
import type { StudentProfile, Scholarship } from '@/types';

type Step = 'review' | 'consent' | 'success';

export default function ApplyScholarshipPage() {
  const router = useRouter();
  const params = useParams();
  const scholarshipId = Number(params?.id);

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [step, setStep] = useState<Step>('review');
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (!scholarshipId) {
      router.push('/student');
      return;
    }

    Promise.allSettled([
      studentApi.getProfile(),
      scholarshipApi.getById(scholarshipId),
    ]).then(([profRes, schRes]) => {
      if (profRes.status === 'fulfilled' && profRes.value.data) {
        setProfile(profRes.value.data);
      } else {
        setError('Failed to load your profile. Please complete your profile first.');
      }

      if (schRes.status === 'fulfilled' && schRes.value.data) {
        setScholarship(schRes.value.data);
      } else {
        setError('Scholarship not found or inactive.');
      }
      setLoading(false);
    });
  }, [scholarshipId, router]);

  const handleSubmit = async () => {
    if (!agreed) return;
    setSubmitting(true);
    setError(null);

    try {
      // 1. Create the application (Draft)
      const createRes = await applicationApi.create(scholarshipId);
      const appId = createRes.data?.applicationId;
      if (!appId) throw new Error('Failed to generate application ID');

      // 2. Immediately submit it (locks it in for Auto-Match/Screening)
      await applicationApi.submit(appId);
      
      // Move to success step
      setStep('success');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit the application. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !profile || !scholarship) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] flex-col gap-4 text-center">
        <p className="text-red-500 font-bold max-w-md">{error}</p>
        <button onClick={() => router.push('/student')} className="px-6 py-2 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700">
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Hide the standard navigation wrapper during success state for a cleaner look
  if (step === 'success') {
    return (
      <div className="py-20">
        <SuccessView scholarship={scholarship} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in pb-20">
      <TopBar title={`Apply: ${scholarship.name}`} subtitle="Follow the steps to submit your application" />

      {/* Breadcrumb Steps */}
      <div className="flex items-center justify-center gap-4 py-4 mb-8">
        <div className={`flex items-center gap-2 font-bold text-sm transition-colors ${step === 'review' ? 'text-[#5b2c6f]' : 'text-emerald-600'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${step === 'review' ? 'bg-[#5b2c6f]' : 'bg-emerald-500'}`}>
            {step === 'consent' ? <CheckCircle size={14} /> : '1'}
          </span>
          Profile Review
        </div>
        <div className="w-16 h-1 rounded-full bg-slate-200">
          <div className={`h-full rounded-full transition-all duration-500 ${step === 'consent' ? 'bg-emerald-500 w-full' : 'w-0'}`} />
        </div>
        <div className={`flex items-center gap-2 font-bold text-sm transition-colors ${step === 'consent' ? 'text-[#5b2c6f]' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${step === 'consent' ? 'bg-[#5b2c6f]' : 'bg-slate-300'}`}>
            2
          </span>
          Terms & Consent
        </div>
      </div>

      <div className="clay-card p-6 md:p-10 border border-white/60 bg-white/70 min-h-[400px]">
        {step === 'review' && <PreFilledReview profile={profile} />}
        {step === 'consent' && <ConsentForm scholarship={scholarship} agreed={agreed} setAgreed={setAgreed} />}

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold border border-red-100 text-center">
            {error}
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between">
          {step === 'review' ? (
            <button 
              onClick={() => router.push('/student')}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 transition-all shadow-sm"
            >
              Cancel
            </button>
          ) : (
            <button 
              onClick={() => setStep('review')}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 transition-all shadow-sm disabled:opacity-50"
            >
              <ArrowLeft size={18} /> Back
            </button>
          )}

          {step === 'review' ? (
            <button 
              onClick={() => setStep('consent')}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#5b2c6f] to-[#2e86c1] text-white text-sm font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_8px_20px_rgba(91,44,111,0.2)]"
            >
              Next Step <ArrowRight size={18} />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={!agreed || submitting}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#0e6251] to-[#148f77] text-white text-sm font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_8px_20px_rgba(14,98,81,0.2)] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
              ) : (
                <>Submit Application <CheckCircle size={18} /></>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
