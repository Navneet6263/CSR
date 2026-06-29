'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api/admin';
import { ApplicationRow } from '@/types/domain';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Lock, Unlock, Clock, FileText, IndianRupee, ShieldAlert } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function RolePipelinePage() {
  const params = useParams();
  const role = params.role as 'reviewer' | 'bgchecker' | 'screener' | 'csr';
  
  const [pipeline, setPipeline] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);

  const roleTitles = {
    'reviewer': 'Document Checkers Queue',
    'bgchecker': 'Background Checkers Queue',
    'screener': 'Screening Officers Queue',
    'csr': 'CSR Partners Queue',
  };

  useEffect(() => {
    fetchPipeline();
  }, [role]);

  const fetchPipeline = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPipeline(role);
      if (res.success && res.data) {
        setPipeline(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleHold = async (appId: number, currentHoldStatus: boolean) => {
    try {
      const newStatus = !currentHoldStatus;
      const res = await adminApi.toggleHold(appId, newStatus, newStatus ? 'Administrative review required' : undefined);
      if (res.success) {
        fetchPipeline(); // Refresh the list
      }
    } catch (err) {
      console.error('Error toggling hold', err);
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-1">{roleTitles[role]}</h1>
          <p className="text-sm font-medium text-slate-500">Monitor pending applications waiting for action by this team.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg border border-slate-200">
          <span className="text-sm font-bold text-slate-600">{pipeline.length} Files Pending</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        {pipeline.length === 0 ? (
          <div className="text-center py-16">
            <FileText size={32} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-700 mb-1">Queue is Empty</h3>
            <p className="text-slate-500 text-sm font-medium">No applications are currently pending in this stage.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pipeline.map((app) => (
              <div key={app.applicationId} className={`group flex flex-col md:flex-row items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors ${app.isHeldByAdmin ? 'bg-rose-50/30' : ''}`}>
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${app.isHeldByAdmin ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                    {app.isHeldByAdmin ? <Lock size={18} /> : <FileText size={18} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-slate-800">{app.studentName}</h3>
                      {app.isHeldByAdmin && (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <ShieldAlert size={12} /> Held
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span className="text-slate-500 font-medium flex items-center gap-1"><Clock size={12}/> {new Date(app.submissionDate).toLocaleDateString()}</span>
                      <span className="text-slate-600 font-medium">{app.scholarshipName}</span>
                      <span className="text-slate-400 font-medium ml-2 border-l border-slate-200 pl-3">
                        ID: #{app.applicationId}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 ml-auto md:ml-0 flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Requested</div>
                    <div className="text-sm font-bold text-slate-800">₹{app.scholarshipAmount?.toLocaleString() || 'N/A'}</div>
                  </div>
                  <button
                    onClick={() => handleToggleHold(app.applicationId, app.isHeldByAdmin)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all shadow-sm ${
                      app.isHeldByAdmin 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                        : 'bg-white text-rose-600 border-rose-200 hover:bg-rose-50'
                    }`}
                  >
                    {app.isHeldByAdmin ? <Unlock size={16} /> : <Lock size={16} />}
                    <span className="hidden sm:inline">{app.isHeldByAdmin ? 'Release Hold' : 'Place on Hold'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
