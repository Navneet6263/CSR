'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Send } from 'lucide-react';
import ApplicationStepper from '@/components/student/ApplicationStepper';
import StepPersonal from '@/components/student/StepPersonal';
import StepEducation from '@/components/student/StepEducation';
import StepIncome from '@/components/student/StepIncome';
import StepBank from '@/components/student/StepBank';
import StepDocuments from '@/components/student/StepDocuments';
import TopBar from '@/components/dashboard/TopBar';
import { authApi, institutionApi, studentApi } from '@/lib/api';
import type { Institution } from '@/types';

const STEPS = ['Personal', 'Education', 'Income', 'Bank', 'Documents'];

export default function ApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [documents, setDocuments] = useState<{ type: string; label: string; status: 'pending' | 'uploaded' | 'verified'; progress?: number }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const user = authApi.getUser();
    if (!user) { router.push('/login'); return; }
    setData((prev) => ({ ...prev, fullName: user.fullName || '' }));

    institutionApi.getAll()
      .then((res) => setInstitutions(res.data || []))
      .catch(() => {});

    studentApi.getProfile()
      .then((res) => {
        const p = res.data;
        if (p) {
          setData((prev) => ({
            ...prev,
            fullName: p.fullName || prev.fullName,
            dob: p.dob || '', gender: p.gender || '', category: p.category || '',
            address: p.address || '', city: p.city || '', state: p.state || '', pincode: p.pincode || '',
            course: p.course || '', institutionId: String(p.institutionId || ''),
            enrollmentYear: String(p.enrollmentYear || ''),
            annualFamilyIncome: String(p.annualFamilyIncome || ''),
            familySize: String(p.familySize || ''),
            bankAccountNo: p.bankAccountNo || '', bankIFSC: p.bankIFSC || '', bankName: p.bankName || '',
          }));
        }
      })
      .catch(() => {});
  }, [router]);

  const onChange = useCallback((field: string, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  const validateStep = (): boolean => {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (!data.dob) errs.dob = 'Date of birth is required';
      if (!data.gender) errs.gender = 'Select gender';
      if (!data.category) errs.category = 'Select category';
    } else if (step === 1) {
      if (!data.course) errs.course = 'Course is required';
      if (!data.institutionId) errs.institutionId = 'Select an institution';
    } else if (step === 2) {
      if (!data.annualFamilyIncome) errs.annualFamilyIncome = 'Income is required';
      if (!data.familySize) errs.familySize = 'Family size is required';
    } else if (step === 3) {
      if (!data.bankAccountNo) errs.bankAccountNo = 'Account number is required';
      if (data.bankAccountNo !== data.bankAccountConfirm) errs.bankAccountNo = 'Account numbers must match';
      if (!data.bankIFSC) errs.bankIFSC = 'IFSC code is required';
      if (!data.bankName) errs.bankName = 'Bank name is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleDocUpload = (docType: string) => {
    setDocuments((prev) => {
      const existing = prev.find((d) => d.type === docType);
      if (existing) {
        return prev.map((d) => d.type === docType ? { ...d, status: 'uploaded' as const, progress: 100 } : d);
      }
      return [...prev, { type: docType, label: docType, status: 'uploaded' as const, progress: 100 }];
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await studentApi.updateProfile({
        dob: data.dob, gender: data.gender, category: data.category,
        address: data.address, city: data.city, state: data.state, pincode: data.pincode,
        course: data.course, institutionId: Number(data.institutionId),
        enrollmentYear: Number(data.enrollmentYear),
        annualFamilyIncome: Number(data.annualFamilyIncome),
        familySize: Number(data.familySize),
        bankAccountNo: data.bankAccountNo, bankIFSC: data.bankIFSC, bankName: data.bankName,
      });
      router.push('/student');
    } catch {
      setErrors({ submit: 'Failed to submit. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <TopBar title="Apply for Scholarship" subtitle="Complete all steps to submit your application" />
      <ApplicationStepper currentStep={step} steps={STEPS} />

      {step === 0 && <StepPersonal data={data} onChange={onChange} errors={errors} />}
      {step === 1 && <StepEducation data={data} onChange={onChange} errors={errors} institutions={institutions} />}
      {step === 2 && <StepIncome data={data} onChange={onChange} errors={errors} matchedCount={3} />}
      {step === 3 && <StepBank data={data} onChange={onChange} errors={errors} />}
      {step === 4 && <StepDocuments documents={documents} onUpload={handleDocUpload} />}

      {errors.submit && (
        <div className="p-3 rounded-2xl bg-[#c0392b]/5 border border-[#c0392b]/10 text-sm text-[#c0392b] text-center">
          {errors.submit}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button onClick={handleBack} disabled={step === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium text-slate-600 bg-white/60 border border-white/60 shadow-[4px_4px_12px_rgba(0,0,0,0.06),-4px_-4px_12px_rgba(255,255,255,0.8)] hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {step < STEPS.length - 1 ? (
          <button onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-[#5b2c6f] to-[#2e86c1] clay-button hover:shadow-lg transition-all"
          >
            Next <ArrowRight size={16} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-[#0e6251] to-[#148f77] clay-button hover:shadow-lg transition-all disabled:opacity-60"
          >
            <Send size={16} /> {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        )}
      </div>
    </div>
  );
}
