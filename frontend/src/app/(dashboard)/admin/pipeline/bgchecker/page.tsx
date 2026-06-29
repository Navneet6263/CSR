'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Clock4,
  CheckCircle2,
  ArrowUpRight,
  CircleDot,
} from "lucide-react";
import { adminApi } from '@/lib/api/admin';
import { mockBgCheckerQueue } from '@/lib/mockData';
import LoadingSpinner from '@/components/shared/LoadingSpinner';


const KPIS = [
  { label: "In Verification", value: "184", delta: "+14 today", icon: Clock4 },
  { label: "Cleared Today", value: "92", delta: "+6.1%", icon: CheckCircle2 },
  { label: "Flagged Today", value: "9", delta: "needs review", icon: ShieldAlert },
  { label: "Avg TAT", value: "2.4d", delta: "−0.3 vs last wk", icon: ShieldCheck },
];

const TEAM = [
  { name: "Amit Khanna", handled: 36, pending: 8, accuracy: 95, status: "online" },
  { name: "Pooja Reddy", handled: 32, pending: 5, accuracy: 97, status: "online" },
  { name: "Manish Tiwari", handled: 28, pending: 12, accuracy: 88, status: "online" },
  { name: "Ritu Saxena", handled: 24, pending: 4, accuracy: 99, status: "idle" },
  { name: "Deepak Yadav", handled: 19, pending: 7, accuracy: 91, status: "offline" },
];

const STATUS_STYLE: Record<string, string> = {
  address_pending: "bg-amber-50 text-amber-700 border-amber-200",
  college_pending: "bg-amber-50 text-amber-700 border-amber-200",
  in_review: "bg-blue-50 text-blue-700 border-blue-200",
  flagged: "bg-rose-50 text-rose-700 border-rose-200",
};

const DOT: Record<string, string> = {
  online: "bg-emerald-500",
  idle: "bg-amber-500",
  offline: "bg-slate-300",
};

export default function BgCheckerDashboard() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPipeline();
  }, []);

  const fetchPipeline = async () => {
    try {
      const res = await adminApi.getPipeline('bgchecker');
      if (res.success && res.data?.data?.length > 0) {
        const mappedQueue = res.data.data.map((app: any) => ({
          id: `APP-${app.applicationId}`,
          name: app.studentName,
          city: "India", // mock fallback
          assigned: "Unassigned", // mock fallback
          waiting: "10m",
          status: app.isHeldByAdmin ? 'flagged' : 'in_review',
        }));
        setQueue(mappedQueue);
      } else {
        setQueue(mockBgCheckerQueue);
      }
    } catch (err) {
      console.error(err);
      setQueue(mockBgCheckerQueue);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center min-h-[50vh]"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400">Role Dashboard</div>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">Background Checkers</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Field verification — address, college, financial and disciplinary checks.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          Live · syncing
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {KPIS.map((k) => (
          <div key={k.label} className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-widest text-slate-400">{k.label}</div>
              <k.icon className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.75} />
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{k.value}</div>
            <div className="mt-0.5 text-xs text-slate-500">{k.delta}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm lg:col-span-5">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <div className="text-[10px] uppercase tracking-widest text-slate-400">Field Team</div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400">Today</div>
          </div>
          <div className="divide-y divide-slate-100">
            {TEAM.map((c) => (
              <div key={c.name} className="flex items-center gap-3 px-5 py-3">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-700">
                  {c.name.split(" ").map((p) => p[0]).join("")}
                  <span className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-white ${DOT[c.status]}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-slate-900">{c.name}</div>
                  <div className="text-xs text-slate-500">{c.handled} handled · {c.pending} pending</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900">{c.accuracy}%</div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-400">accuracy</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm lg:col-span-7">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <div className="text-[10px] uppercase tracking-widest text-slate-400">Verification Queue</div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400">{queue.length} items</div>
          </div>
          <div className="divide-y divide-slate-100">
            {queue.map((q) => (
              <Link
                key={q.id}
                href={`/admin/pipeline/bgchecker/${q.id}`}
                className="group flex items-center gap-3 px-5 py-3 transition hover:bg-slate-50"
              >
                <CircleDot className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500" strokeWidth={1.75} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">{q.name}</span>
                    <span className="text-xs text-slate-400">{q.id}</span>
                  </div>
                  <div className="truncate text-xs text-slate-500">{q.city} · {q.assigned}</div>
                </div>
                <span className={`hidden rounded-full border px-2 py-0.5 text-[10px] font-medium md:inline ${STATUS_STYLE[q.status] || STATUS_STYLE['in_review']}`}>
                  {q.status.replace("_", " ")}
                </span>
                <div className="w-16 text-right text-xs text-slate-500">{q.waiting}</div>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 transition group-hover:text-slate-900" strokeWidth={1.75} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
