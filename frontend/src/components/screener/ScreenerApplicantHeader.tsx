'use client';

import { FileText, MapPin, GraduationCap, Calendar } from 'lucide-react';

export default function ScreenerApplicantHeader({ application }: { application: any }) {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-slate-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex gap-6 items-center">
          <div className="w-20 h-20 rounded-2xl bg-white shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,1)] border border-slate-50 flex items-center justify-center shrink-0">
            <span className="text-4xl font-black text-[#2e86c1]">{application.FullName.charAt(0)}</span>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 mb-2">{application.FullName}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-bold">
              <span className="flex items-center gap-1.5"><FileText size={16} className="text-[#2e86c1]" /> App ID: {application.ApplicationID}</span>
              <span className="flex items-center gap-1.5"><MapPin size={16} className="text-rose-500" /> {application.City}, {application.State}</span>
              <span className="flex items-center gap-1.5"><GraduationCap size={16} className="text-emerald-500" /> {application.Course}</span>
              <span className="flex items-center gap-1.5"><Calendar size={16} className="text-amber-500" /> Applied: {new Date(application.SubmissionDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Scholarship Match</div>
          <div className="text-xl font-black text-[#2e86c1]">{application.ScholarshipName}</div>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-sm font-bold shadow-sm">
            ₹{application.ScholarshipAmount.toLocaleString()} Requested
          </div>
        </div>
      </div>
    </div>
  );
}
