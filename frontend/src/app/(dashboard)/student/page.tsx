'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, ArrowRight, Calendar, CheckCircle, Edit3 } from 'lucide-react';
import StatsCards from '@/components/student/StatsCards';
import StatusTimeline from '@/components/student/StatusTimeline';
import TopBar from '@/components/dashboard/TopBar';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { ReUploadAlert } from '@/components/student/ReUploadAlert';
import { authApi, applicationApi, scholarshipApi } from '@/lib/api';
import { mapScholarship, mapApplication } from '@/lib/mappers';
import type { Application, Scholarship, ApplicationStatus } from '@/types';

const statusColors: Record<string, string> = {
  Draft: 'bg-slate-100 text-slate-600',
  Submitted: 'bg-[#2e86c1]/10 text-[#2e86c1]',
  AutoMatched: 'bg-[#5b2c6f]/10 text-[#5b2c6f]',
  CSRApproved: 'bg-[#0e6251]/10 text-[#0e6251]',
  ScreeningRejected: 'bg-[#c0392b]/10 text-[#c0392b]',
  PaymentCompleted: 'bg-[#0e6251]/10 text-[#0e6251]',
};

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ fullName: string } | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = authApi.getUser();
    if (!u) { router.push('/login'); return; }
    setUser(u);

    Promise.allSettled([
      applicationApi.getMy(),
      scholarshipApi.getAll('status=Active'),
    ]).then(([appsRes, schRes]) => {
      if (appsRes.status === 'fulfilled') {
        const rawApps = appsRes.value.data || [];
        setApps(rawApps.map((a: Record<string, unknown>) => mapApplication(a)));
      }
      if (schRes.status === 'fulfilled') {
        const raw = schRes.value.data?.scholarships || [];
        setScholarships(raw.map((s) => mapScholarship(s as Record<string, unknown>)));
      }
      setLoading(false);
    });
  }, [router]);

  const stats = {
    total: apps.length,
    approved: apps.filter((a) => ['CSRApproved', 'PaymentCompleted'].includes(a.status)).length,
    pending: apps.filter((a) => !['CSRApproved', 'PaymentCompleted', 'ScreeningRejected', 'CSRDeclined', 'Cancelled'].includes(a.status)).length,
    matched: apps.filter((a) => a.status === 'AutoMatched').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const activeAppStatus = (apps[0]?.status || 'Draft') as ApplicationStatus;

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      <TopBar title={`Welcome back, ${user?.fullName || 'Student'}`} subtitle="Here's your scholarship overview for today" />
      <ReUploadAlert />
      
      {/* 1. Stats Row */}
      <StatsCards {...stats} />

      {/* 2. Application Journey Timeline */}
      <div className="clay-card p-6 border border-white/60 bg-white/70">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-800">Application Journey</h2>
            <p className="text-xs text-slate-500 mt-0.5">Tracking your most recent application</p>
          </div>
          {apps.length > 0 && (
            <button 
              onClick={() => router.push('/student/applications')} 
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              View past journeys
            </button>
          )}
        </div>
        <StatusTimeline currentStatus={activeAppStatus} />
      </div>

      {/* 3. Middle Section: Applications vs Scholarships */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* My Applications */}
        <div className="clay-card p-6 border border-white/60 bg-white/70 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-bold text-slate-800">My applications</h2>
            {apps.length > 3 && (
              <button onClick={() => router.push('/student/applications')} className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">See all</button>
            )}
          </div>
          
          {apps.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
              <p className="text-sm font-semibold text-slate-600 mb-2">Apply for another scholarship</p>
              <p className="text-xs text-slate-400">We found great matches for your profile</p>
            </div>
          ) : (
            <div className="space-y-3">
              {apps.slice(0, 3).map((app) => (
                <div key={app.applicationId} className="p-4 rounded-2xl bg-white border border-slate-100 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-50">
                      <GraduationCap size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{app.scholarshipName}</p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${statusColors[app.status] || 'bg-slate-100 text-slate-600'}`}>
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => router.push('/student/scholarships')}
                className="w-full mt-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm font-semibold text-slate-600"
              >
                + Apply for another scholarship
              </button>
            </div>
          )}
        </div>

        {/* Open Scholarships */}
        <div className="clay-card p-6 border border-white/60 bg-white/70 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-bold text-slate-800">Open scholarships for you</h2>
            <button onClick={() => router.push('/student/scholarships')} className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">View all</button>
          </div>
          
          <div className="space-y-3">
            {scholarships.slice(0, 2).map((s) => (
              <div key={s.scholarshipId} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{s.name}</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{s.sponsorName}</p>
                  </div>
                  <span className="text-sm font-bold text-slate-700">₹{s.perStudentAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">95% Match</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 text-[10px] font-medium border border-slate-100">Engineering</span>
                </div>
                <button onClick={() => router.push(`/student/apply/${s.scholarshipId}`)} className="mt-1 w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors">
                  Apply now
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. Bottom Section: Complete Profile vs Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Complete Profile Tasks */}
        <div className="clay-card p-6 border border-white/60 bg-white/70">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-bold text-slate-800">Complete your profile</h2>
            <button onClick={() => router.push('/student/profile')} className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1">
              <Edit3 size={12} /> Edit
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3">
              <div className="text-emerald-500"><CheckCircle size={18} /></div>
              <div>
                <p className="text-xs font-bold text-slate-700">Personal details</p>
                <p className="text-[10px] text-slate-400">Completed</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3">
              <div className="text-emerald-500"><CheckCircle size={18} /></div>
              <div>
                <p className="text-xs font-bold text-slate-700">Education info</p>
                <p className="text-[10px] text-slate-400">Completed</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3">
              <div className="text-emerald-500"><CheckCircle size={18} /></div>
              <div>
                <p className="text-xs font-bold text-slate-700">Bank details</p>
                <p className="text-[10px] text-slate-400">Completed</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 opacity-50">
              <div className="text-slate-300 border-2 border-slate-200 rounded-full w-4 h-4" />
              <div>
                <p className="text-xs font-bold text-slate-700">Verify identity</p>
                <p className="text-[10px] text-slate-400">Pending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Announcements / Notifications */}
        <div className="clay-card p-6 border border-white/60 bg-white/70">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-bold text-slate-800">Company Announcements</h2>
            <button className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">View all</button>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              <div>
                <p className="text-xs font-medium text-slate-700 leading-relaxed">
                  The Tata STEM Grant 2026 is now open for applications. Complete your profile to apply!
                </p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase">Today</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-medium text-slate-700 leading-relaxed">
                  Your application for Reliance Foundation has been approved!
                </p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase">2 days ago</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
