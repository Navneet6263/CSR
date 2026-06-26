'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { screeningApi } from '@/lib/api/screening';
import { ScreeningApplicationRow } from '@/types/domain';
import { FileText, ArrowRight, Clock, ShieldCheck, Filter } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function ScreenerDashboard() {
  const [applications, setApplications] = useState<ScreeningApplicationRow[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appRes, statsRes] = await Promise.all([
        screeningApi.getPendingScreening(),
        screeningApi.getStats()
      ]);
      
      if (appRes.success && appRes.data) {
        setApplications(appRes.data);
      }
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-800 mb-2">Screening Queue</h1>
          <p className="text-slate-500 font-medium">Review fully verified applications and make final decisions for CSR funding.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="bg-white px-5 py-3 rounded-2xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center gap-3">
            <div className="text-2xl font-black text-slate-400">{stats?.totalReviewed || 0}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Total<br/>Reviewed</div>
          </div>
          <div className="bg-white px-5 py-3 rounded-2xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center gap-3">
            <div className="text-2xl font-black text-emerald-500">{stats?.approved || 0}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Total<br/>Approved</div>
          </div>
          <div className="bg-white px-5 py-3 rounded-2xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center gap-3">
            <div className="text-2xl font-black text-rose-500">{stats?.rejected || 0}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">Total<br/>Rejected</div>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] border border-amber-100 flex items-center gap-4">
            <div className="text-3xl font-black text-amber-500">{stats?.pending || applications.length}</div>
            <div className="text-xs text-amber-600 font-bold uppercase tracking-wider leading-tight">Pending<br/>Review</div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between p-2 bg-white/50 backdrop-blur-md border border-white/50 rounded-2xl shadow-sm">
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white text-[#2e86c1] rounded-xl text-sm font-bold shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,1)]">
            <Filter size={16} /> All Pending
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-[#2e86c1] hover:bg-white rounded-xl text-sm font-bold transition-all">
            High Priority
          </button>
        </div>
      </div>

      {/* Queue List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {applications.length === 0 ? (
          <div className="text-center py-16">
            <ShieldCheck size={32} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-700 mb-1">Queue is empty</h3>
            <p className="text-slate-500 text-sm font-medium">There are no pending applications to screen right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {applications.map((app) => (
              <div key={app.applicationId} 
                className="group flex flex-col md:flex-row items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => router.push(`/screener/evaluate/${app.applicationId}`)}
              >
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{app.studentName}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span className="text-slate-500 font-medium flex items-center gap-1"><Clock size={12}/> {new Date(app.submissionDate).toLocaleDateString()}</span>
                      <span className="text-slate-600 font-medium">{app.scholarshipName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 border border-emerald-200">
                        BG Verified
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 ml-auto md:ml-0 flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Requested Amount</div>
                    <div className="text-sm font-bold text-slate-800">₹{app.scholarshipAmount?.toLocaleString() || 'N/A'}</div>
                  </div>
                  <div className="text-slate-300 group-hover:text-blue-500 transition-colors">
                    <ArrowRight size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
