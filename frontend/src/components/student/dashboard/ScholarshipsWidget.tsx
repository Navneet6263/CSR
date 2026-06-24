'use client';

import { ArrowRight, Sparkles, Building, Banknote } from 'lucide-react';
import type { Scholarship } from '@/types';
import { useRouter } from 'next/navigation';

interface ScholarshipsWidgetProps {
  scholarships: Scholarship[];
}

export default function ScholarshipsWidget({ scholarships }: ScholarshipsWidgetProps) {
  const router = useRouter();

  if (!scholarships || scholarships.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-center items-center h-full min-h-[250px] text-center">
        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
          <Sparkles size={24} />
        </div>
        <h3 className="font-bold text-slate-800 mb-2">No Matches Yet</h3>
        <p className="text-sm text-slate-500 max-w-[200px]">Complete your profile to get personalized scholarship recommendations.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            AI Matches <Sparkles size={18} className="text-purple-500" />
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Recommended for you</p>
        </div>
        <button className="text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full transition-colors">
          Browse All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2">
        <div className="space-y-4">
          {scholarships.slice(0, 3).map((s, idx) => {
            // Fake match percentage based on index for demo purposes
            const matchPercent = 95 - (idx * 4); 
            
            return (
              <div key={s.scholarshipId} className="group p-5 rounded-2xl bg-white border border-slate-100 hover:border-purple-200 hover:shadow-[0_8px_20px_rgba(168,85,247,0.08)] transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                    {matchPercent}% Match
                  </div>
                  <button 
                    onClick={() => router.push('/student/apply')}
                    className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-purple-600 group-hover:text-white transition-colors"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
                
                <h3 className="font-bold text-slate-800 text-sm mb-3 line-clamp-2 leading-snug group-hover:text-purple-700 transition-colors">
                  {s.name}
                </h3>
                
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Building size={14} className="text-slate-400" />
                    <span className="truncate max-w-[100px]">{s.sponsorName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Banknote size={14} className="text-slate-400" />
                    <span>₹{s.perStudentAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
