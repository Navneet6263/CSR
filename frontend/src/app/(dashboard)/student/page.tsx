'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, ArrowRight, Calendar } from 'lucide-react';
import StatsCards from '@/components/student/StatsCards';
import StatusTimeline from '@/components/student/StatusTimeline';
import TopBar from '@/components/dashboard/TopBar';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { ReUploadAlert } from '@/components/student/ReUploadAlert';
import { authApi, applicationApi, scholarshipApi } from '@/lib/api';
import { mapScholarship } from '@/lib/mappers';
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
      if (appsRes.status === 'fulfilled') setApps(appsRes.value.data || []);
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

  return (
    <div className="space-y-6 animate-card-entrance">
      <TopBar title={`Welcome back, ${user?.fullName || 'Student'} 👋`} subtitle="Here&apos;s your scholarship overview" />
      <ReUploadAlert />
      <StatsCards {...stats} />

      {apps.length > 0 && (
        <div className="clay-card p-6">
          <h2 className="text-base font-bold text-slate-800 mb-4">Latest Application Status</h2>
          <StatusTimeline currentStatus={(apps[0]?.status || 'Draft') as ApplicationStatus} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="clay-card p-6">
          <h2 className="text-base font-bold text-slate-800 mb-4">My Applications</h2>
          {apps.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No applications yet. Start by applying!</p>
          ) : (
            <div className="space-y-3">
              {apps.slice(0, 5).map((app) => (
                <div key={app.applicationId} role="button" tabIndex={0}
                  className="clickable-card p-4 rounded-2xl bg-white/50 border border-white/40 flex items-center justify-between"
                  onClick={() => router.push('/student/apply')}
                  onKeyDown={(e) => e.key === 'Enter' && router.push('/student/apply')}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#5b2c6f]/5">
                      <GraduationCap size={18} className="text-[#5b2c6f]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{app.scholarshipName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Calendar size={12} className="text-slate-400" />
                        <span className="text-xs text-slate-400">{new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-xl ${statusColors[app.status] || 'bg-slate-100 text-slate-600'}`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="clay-card p-6">
          <h2 className="text-base font-bold text-slate-800 mb-4">Available Scholarships</h2>
          {scholarships.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No scholarships available right now.</p>
          ) : (
            <div className="space-y-3">
              {scholarships.slice(0, 4).map((s) => (
                <div key={s.scholarshipId}
                  className="clickable-card p-4 rounded-2xl bg-white/50 border border-white/40 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{s.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">₹{s.perStudentAmount.toLocaleString('en-IN')} • {s.sponsorName}</p>
                  </div>
                  <button type="button" onClick={() => router.push('/student/apply')}
                    className="clickable clay-button p-2 rounded-xl bg-gradient-to-r from-[#5b2c6f] to-[#2e86c1] text-white hover:scale-105 active:scale-95">
                    <ArrowRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
