'use client';

import { ArrowRight, CheckCircle2, Clock, XCircle, FileText } from 'lucide-react';
import type { Application } from '@/types';
import { useRouter } from 'next/navigation';

interface ActiveApplicationWidgetProps {
  application?: Application;
}

const statusSteps = [
  { key: 'Draft', label: 'Draft' },
  { key: 'Submitted', label: 'Submitted' },
  { key: 'AutoMatched', label: 'Matched' },
  { key: 'Screening', label: 'Screening' },
  { key: 'CSRApproved', label: 'Approved' },
  { key: 'PaymentCompleted', label: 'Funded' },
];

const getStatusIndex = (status: string) => {
  if (['ScreeningRejected', 'CSRDeclined'].includes(status)) return 3; // roughly screening phase
  return statusSteps.findIndex(s => s.key === status);
};

export default function ActiveApplicationWidget({ application }: ActiveApplicationWidgetProps) {
  const router = useRouter();

  if (!application) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-center items-center h-full min-h-[250px] text-center">
        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
          <FileText size={24} />
        </div>
        <h3 className="font-bold text-slate-800 mb-2">No Active Applications</h3>
        <p className="text-sm text-slate-500 mb-6 max-w-[200px]">You haven't started any scholarship applications yet.</p>
        <button onClick={() => router.push('/student/apply')} className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm">
          Browse Scholarships
        </button>
      </div>
    );
  }

  const currentIndex = getStatusIndex(application.status);
  const isRejected = ['ScreeningRejected', 'CSRDeclined'].includes(application.status);

  return (
    <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Active Focus</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Your most recent application</p>
        </div>
        <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
          View All <ArrowRight size={14} />
        </button>
      </div>

      <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-1 line-clamp-1" title={application.scholarshipName}>
          {application.scholarshipName}
        </h3>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">
          Applied on {new Date(application.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Compact Stepper */}
      <div className="flex-1 flex flex-col justify-center px-2">
        <div className="relative flex justify-between items-center w-full">
          {/* Background Line */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full z-0"></div>
          
          {/* Progress Line */}
          <div 
            className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 rounded-full z-0 transition-all duration-1000 ${isRejected ? 'bg-red-500' : 'bg-emerald-500'}`}
            style={{ width: `${Math.max(0, (currentIndex / (statusSteps.length - 1)) * 100)}%` }}
          ></div>

          {/* Steps */}
          {statusSteps.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isError = isCurrent && isRejected;

            return (
              <div key={step.key} className="relative z-10 flex flex-col items-center gap-2 group">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs transition-all duration-500 shadow-sm ${
                  isError ? 'bg-red-500 shadow-red-500/30' :
                  isCompleted || isCurrent ? 'bg-emerald-500 shadow-emerald-500/30' : 
                  'bg-white border-2 border-slate-200 text-slate-400'
                } ${isCurrent && !isError ? 'ring-4 ring-emerald-50 scale-110' : ''}`}>
                  {isError ? <XCircle size={16} /> :
                   isCompleted ? <CheckCircle2 size={16} /> : 
                   isCurrent ? <Clock size={16} className="animate-pulse" /> : 
                   (idx + 1)}
                </div>
                <span className={`absolute -bottom-6 text-[10px] sm:text-xs font-bold whitespace-nowrap transition-colors ${
                  isError ? 'text-red-600' :
                  isCurrent ? 'text-emerald-700' : 
                  isCompleted ? 'text-slate-700' : 'text-slate-400'
                }`}>
                  {isError ? 'Rejected' : step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
