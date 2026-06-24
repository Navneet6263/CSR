'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Eye } from 'lucide-react';
import TopBar from '@/components/dashboard/TopBar';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { scholarshipApi } from '@/lib/api';
import { mapScholarship } from '@/lib/mappers';
import type { Scholarship } from '@/types';
import Link from 'next/link';

const statusBadge: Record<string, string> = {
  Active: 'bg-[#0e6251]/10 text-[#0e6251]',
  Inactive: 'bg-slate-100 text-slate-500',
  Closed: 'bg-[#c0392b]/10 text-[#c0392b]',
};

export default function AdminScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    scholarshipApi.getAll()
      .then((res) => {
        const raw = res.data?.scholarships || [];
        setScholarships(raw.map((s) => mapScholarship(s as Record<string, unknown>)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TopBar title="Manage Scholarships" subtitle={`${scholarships.length} scholarships total`} />

      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-[#5b2c6f] to-[#2e86c1] clay-button hover:shadow-lg transition-all">
          <Plus size={16} /> New Scholarship
        </button>
      </div>

      <div className="clay-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Sponsor</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Budget</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Per Student</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Open</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Close</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scholarships.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-400">
                    No scholarships found. Create your first one!
                  </td>
                </tr>
              ) : (
                scholarships.map((s) => (
                  <tr key={s.scholarshipId} className="border-b border-slate-50 hover:bg-white/40 transition-colors cursor-pointer">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">{s.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{s.sponsorName}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">₹{s.totalBudget.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">₹{s.perStudentAmount.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">{new Date(s.applicationOpenDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">{new Date(s.applicationCloseDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-3 py-1 rounded-xl ${statusBadge[s.status] || 'bg-slate-100 text-slate-500'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 rounded-xl text-slate-400 hover:text-[#5b2c6f] hover:bg-[#5b2c6f]/5 transition-colors" title="Edit">
                          <Pencil size={14} />
                        </button>
                        <Link href={`/admin/scholarships/${s.scholarshipId}/rules`}
                          className="p-2 rounded-xl text-slate-400 hover:text-[#2e86c1] hover:bg-[#2e86c1]/5 transition-colors" title="View Rules"
                        >
                          <Eye size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
