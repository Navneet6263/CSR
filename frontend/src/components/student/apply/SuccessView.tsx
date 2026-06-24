'use client';

import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Scholarship } from '@/types';

interface SuccessViewProps {
  scholarship: Scholarship;
}

export default function SuccessView({ scholarship }: SuccessViewProps) {
  const router = useRouter();

  return (
    <div className="animate-in zoom-in-95 duration-700 text-center py-10 max-w-2xl mx-auto">
      <div className="relative inline-block mb-8">
        <div className="absolute inset-0 bg-emerald-400 blur-2xl opacity-40 animate-pulse rounded-full" />
        <div className="relative bg-gradient-to-br from-emerald-400 to-teal-500 w-24 h-24 rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-white">
          <CheckCircle2 size={48} />
        </div>
      </div>
      
      <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Application Submitted!</h2>
      <p className="text-lg text-slate-500 font-medium mb-8 leading-relaxed">
        Your application for the <strong className="text-slate-800">{scholarship.name}</strong> has been successfully submitted to the review queue.
      </p>

      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-10 text-left space-y-4 shadow-sm">
        <h3 className="font-bold text-slate-800">What happens next?</h3>
        <ul className="space-y-3 text-sm font-medium text-slate-600">
          <li className="flex gap-3">
            <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">1</span>
            Our AI engine will run an automated eligibility match.
          </li>
          <li className="flex gap-3">
            <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">2</span>
            A document reviewer will audit your uploaded documents.
          </li>
          <li className="flex gap-3">
            <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 text-xs font-bold">3</span>
            You will be notified here and via email regarding the screening outcome.
          </li>
        </ul>
      </div>

      <button 
        onClick={() => router.push('/student')}
        className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(30,41,59,0.3)]"
      >
        Go to Dashboard <ArrowRight size={18} />
      </button>
    </div>
  );
}
