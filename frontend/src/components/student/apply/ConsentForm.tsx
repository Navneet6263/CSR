'use client';

import { ShieldCheck } from 'lucide-react';
import type { Scholarship } from '@/types';

interface ConsentFormProps {
  scholarship: Scholarship;
  agreed: boolean;
  setAgreed: (val: boolean) => void;
}

export default function ConsentForm({ scholarship, agreed, setAgreed }: ConsentFormProps) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8 max-w-3xl mx-auto">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Terms & Consent</h2>
        <p className="text-sm font-medium text-slate-500 mt-2 leading-relaxed">
          Please read and accept the terms to complete your application for the <br/>
          <strong className="text-slate-700">{scholarship.name}</strong>.
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 text-sm text-slate-600 leading-relaxed h-[300px] overflow-y-auto custom-scrollbar">
        <p>
          By submitting this application, I hereby declare that all the information provided by me in the application form is true, complete, and correct to the best of my knowledge and belief.
        </p>
        <p>
          I understand that in the event of any information being found false or incorrect at any stage, my candidature/scholarship is liable to be cancelled/terminated without any notice.
        </p>
        <p>
          I grant explicit consent to <strong>{scholarship.sponsorName}</strong> and the TalentBridge platform to access, process, and verify my identity (Aadhaar), academic records, and financial documents for the sole purpose of evaluating my eligibility for this scholarship program.
        </p>
        <p>
          I also agree that if I am selected for the scholarship, the funds will be disbursed directly to the bank account provided in my profile, and I will utilise the funds strictly for academic purposes (tuition fees, books, living expenses related to education).
        </p>
      </div>

      <label className="flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all hover:bg-slate-50 border-slate-200">
        <div className="mt-1 flex items-center h-5">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-5 h-5 text-emerald-600 bg-slate-100 border-slate-300 rounded focus:ring-emerald-500 focus:ring-2 cursor-pointer"
          />
        </div>
        <div className="text-sm">
          <span className="font-bold text-slate-800 block mb-1">I accept the Terms and Conditions</span>
          <span className="text-slate-500 font-medium leading-relaxed block">
            I confirm that I have read the consent declaration and agree to share my data for verification.
          </span>
        </div>
      </label>
    </div>
  );
}
