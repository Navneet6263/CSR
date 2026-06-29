'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Plus, GraduationCap, Users, Wallet, Calendar } from "lucide-react";
import { apiClient } from '@/lib/api';
import { mockScholarships } from '@/lib/mockData';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

function inr(n: number) {
  return "₹ " + n.toLocaleString("en-IN");
}

export default function ScholarshipsListPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    try {
      const res = await apiClient<any[]>('/scholarships/active');
      if (res.success && res.data && res.data.length > 0) {
        setPrograms(res.data);
      } else {
        setPrograms(mockScholarships);
      }
    } catch (err) {
      console.error(err);
      setPrograms(mockScholarships);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
            Scholarships
          </h1>
          <p className="text-[13px] text-slate-500">
            Manage active programs, drafts and eligibility configurations.
          </p>
        </div>
        <Link
          href="/admin/scholarships/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 shrink-0"
        >
          <Plus className="h-4 w-4" />
          New Scholarship
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {programs.map((p) => {
          const pct = p.seats > 0 ? Math.round((p.filled / p.seats) * 100) : 0;
          return (
            <div key={p.name} className="rounded-2xl border border-slate-200/80 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-900 text-white shrink-0">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <span
                  className={
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider " +
                    (p.status === "Live"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600")
                  }
                >
                  {p.status}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-900 truncate">{p.name}</h3>
              <p className="text-[12px] text-slate-500 truncate">{p.sponsor || "Corporate Sponsor"}</p>

              <div className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
                <Stat icon={<Wallet className="h-3.5 w-3.5" />} label="Budget" value={inr(p.budget || 5000000)} />
                <Stat icon={<Users className="h-3.5 w-3.5" />} label="Seats" value={`${p.filled || 0}/${p.seats || 100}`} />
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Filled</span>
                  <span className="tabular-nums">{pct}%</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-slate-900 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Closes {p.closes || "31 Dec 2026"}
                </span>
                <Link
                  href={`/admin/scholarships/${p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
                  className="text-slate-900 font-medium hover:underline"
                >
                  Manage →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-2.5">
      <div className="flex items-center gap-1 text-slate-500">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-0.5 text-sm font-semibold text-slate-900 tabular-nums truncate">{value}</p>
    </div>
  );
}
