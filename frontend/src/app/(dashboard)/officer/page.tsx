'use client';

import { useEffect, useState } from 'react';
import { verificationApi } from '@/lib/api';
import { ShieldCheck, Shield, ArrowRight } from 'lucide-react';
import type { BGCheckApplicationRow } from '@/types/domain';
import { TopNav } from '@/components/officer/TopNav';
import { StatsCards } from '@/components/officer/StatsCards';
import Link from 'next/link';

export default function OfficerQueue() {
  const [applications, setApplications] = useState<BGCheckApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const res = await verificationApi.getPendingBGChecks();
      setApplications(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  return (
    <div className="min-h-[calc(100vh-100px)] pb-10">
      <TopNav />
      
      <div className="mx-auto max-w-6xl">
        <StatsCards />

        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Background Check Queue</h1>
            <p className="mt-2 text-slate-500">
              Applications awaiting physical verification (Identity, Address, Income).
            </p>
          </div>
          <div className="flex gap-3">
            <div className="glass flex items-center gap-2 rounded-xl bg-white/50 px-4 py-2 shadow-sm border border-white">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-slate-800">{applications.length} Pending</span>
            </div>
          </div>
        </div>

        <div className="glass overflow-hidden rounded-2xl bg-white/50 shadow-sm border border-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-white/60 bg-white/40 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Application</th>
                  <th className="px-6 py-4 font-semibold">Student Name</th>
                  <th className="px-6 py-4 font-semibold">Contact</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/60">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                        <ShieldCheck className="h-8 w-8 text-blue-500" />
                      </div>
                      <p className="text-base font-semibold text-slate-800">Queue is empty</p>
                      <p className="mt-1 text-slate-500">All verifications have been completed.</p>
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.applicationId} className="transition-colors hover:bg-white/60">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-slate-800">
                          APP-{app.applicationId.toString().padStart(4, '0')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{app.studentName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-600">{app.studentEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/officer/verify/${app.applicationId}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow"
                        >
                          Verify <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
