'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, FileText, ArrowRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { screeningApi } from '@/lib/api/screening';
import { ScreeningApplicationRow } from '@/types/domain';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function ScreenerHistoryPage() {
  const [history, setHistory] = useState<ScreeningApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await screeningApi.getHistory();
      if (res.success && res.data) {
        setHistory(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 mb-1">Screening History</h1>
          <p className="text-slate-500 text-sm font-medium">View applications you have previously screened and decided upon.</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-slate-200">
          <ShieldCheck size={32} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-700 mb-1">History is currently empty</h3>
          <p className="text-slate-500 text-sm font-medium">You haven't screened any applications yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {history.map((app) => {
              const isApproved = app.status === 'ScreeningApproved' || app.status === 'CSRApproved' || app.status === 'FundDisbursed';
              return (
                <div key={app.applicationId} 
                  className="group flex flex-col md:flex-row items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isApproved ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {isApproved ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    </div>
                    <div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">{app.studentName}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span className="text-slate-500 font-medium flex items-center gap-1"><Clock size={12}/> {new Date(app.submissionDate).toLocaleDateString()}</span>
                      <span className="text-slate-600 font-medium">{app.scholarshipName}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isApproved ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'}`}>
                        {isApproved ? 'Approved' : 'Rejected'}
                      </span>
                      <span className="text-slate-400 font-medium ml-2 border-l border-slate-200 pl-3">
                        Evaluated by <span className="font-bold text-slate-600">You</span>
                      </span>
                    </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 ml-auto md:ml-0 flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Requested Amount</div>
                      <div className="text-sm font-bold text-slate-800">₹{app.scholarshipAmount?.toLocaleString() || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
