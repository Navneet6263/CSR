'use client';

import { useState, useEffect } from 'react';
import { GraduationCap, ArrowLeft, ExternalLink, Calendar, Search, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/dashboard/TopBar';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import StatusTimeline from '@/components/student/StatusTimeline';
import { applicationApi } from '@/lib/api';
import { mapApplication } from '@/lib/mappers';
import type { Application } from '@/types';

const statusColors: Record<string, string> = {
  Draft: 'bg-slate-100 text-slate-600 border-slate-200',
  Submitted: 'bg-blue-50 text-blue-600 border-blue-200',
  AutoMatched: 'bg-[#5b2c6f]/10 text-[#5b2c6f] border-[#5b2c6f]/20',
  CSRApproved: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  ScreeningRejected: 'bg-red-50 text-red-600 border-red-200',
  PaymentCompleted: 'bg-emerald-50 text-emerald-600 border-emerald-200',
};

const statusDescriptions: Record<string, string> = {
  Draft: 'Application is incomplete. Please finish and submit.',
  Submitted: 'Submitted successfully. Awaiting initial screening.',
  AutoMatched: 'You have been auto-matched! Awaiting document audit.',
  CSRApproved: 'Approved by the sponsor. Payment processing next.',
  ScreeningRejected: 'Unfortunately, your application did not meet the criteria.',
  PaymentCompleted: 'Funds have been disbursed to your bank account.',
};

export default function MyApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    applicationApi.getMy()
      .then(res => {
        if (res.data) {
          const mapped = res.data.map((a: any) => mapApplication(a));
          setApplications(mapped);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredApps = applications.filter(a => 
    a.scholarshipName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center min-h-[70vh]"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      <TopBar title="My Applications" subtitle="Track the status of all your scholarship applications" />

      {/* Back Button & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button 
          onClick={() => router.push('/student')}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/60 border border-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5b2c6f]/20 text-sm"
            />
          </div>
          <button className="p-2 bg-white/60 border border-white rounded-xl text-slate-500 hover:text-slate-800 shadow-sm transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Application List */}
      <div className="grid grid-cols-1 gap-4 mt-6">
        {filteredApps.length === 0 ? (
          <div className="clay-card p-12 text-center border border-white/60 bg-white/70">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap size={28} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">No applications found</h3>
            <p className="text-slate-500 font-medium mb-6">You haven't applied to any scholarships matching your search.</p>
            <button 
              onClick={() => router.push('/student/scholarships')}
              className="px-6 py-2.5 bg-slate-800 text-white font-bold text-sm rounded-xl hover:bg-slate-700 transition-colors"
            >
              Browse Scholarships
            </button>
          </div>
        ) : (
          filteredApps.map((app) => (
            <div key={app.applicationId} className="clay-card p-6 border border-white/60 bg-white/70 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col gap-6 group">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shrink-0">
                    <GraduationCap size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 mb-1 group-hover:text-[#5b2c6f] transition-colors">
                      {app.scholarshipName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        Applied: {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded-md">
                        ID: #{app.applicationId}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-2 md:min-w-[200px]">
                  <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-xl border ${statusColors[app.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {app.status}
                  </span>
                  <p className="text-[10px] font-medium text-slate-400 text-right max-w-[220px]">
                    {statusDescriptions[app.status] || 'Processing your application.'}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-4 md:border-t-0 md:pt-0 md:border-l md:pl-6 shrink-0 flex items-center">
                  <button 
                    onClick={() => router.push(`/student/scholarships/${app.scholarshipId}`)}
                    className="flex items-center justify-center gap-2 w-full md:w-auto px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:text-[#5b2c6f] hover:border-[#5b2c6f]/30 hover:bg-slate-50 transition-colors"
                  >
                    View Details <ExternalLink size={16} />
                  </button>
                </div>
              </div>

              {/* Journey Timeline for this specific application */}
              <div className="mt-6 pt-6 border-t border-slate-100/60">
                <p className="text-xs font-bold text-slate-800 mb-4 px-2 uppercase tracking-wider">Application Journey</p>
                <StatusTimeline currentStatus={app.status as any} />
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
