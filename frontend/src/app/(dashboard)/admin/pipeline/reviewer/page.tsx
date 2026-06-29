'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import {
  FileCheck2,
  Clock,
  XCircle,
  Users,
  ArrowUpRight,
  CircleDot,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AgentPerformance, { type AgentPerf } from "@/components/admin/AgentPerformance";
import SLAPill from "@/components/admin/SLAPill";
import { getSLALevel, SLA_STYLES } from "@/lib/sla";
import { adminApi } from '@/lib/api/admin';
import { mockReviewerQueue } from '@/lib/mockData';
import LoadingSpinner from '@/components/shared/LoadingSpinner';


const KPIS = [
  { label: "In Queue", value: "248", delta: "+12 today", icon: Clock },
  { label: "Verified Today", value: "186", delta: "+8.4%", icon: FileCheck2 },
  { label: "Rejected Today", value: "23", delta: "−2.1%", icon: XCircle },
  { label: "Active Checkers", value: "14", delta: "of 18", icon: Users },
];

const CHECKERS: AgentPerf[] = [
  { name: "Rohan Mehta", pending: 6, done: 42, accuracy: 98, avgTime: "12m", status: "online" },
  { name: "Priya Iyer", pending: 4, done: 38, accuracy: 96, avgTime: "14m", status: "online" },
  { name: "Arjun Kapoor", pending: 9, done: 31, accuracy: 92, avgTime: "21m", status: "online" },
  { name: "Sneha Rao", pending: 3, done: 27, accuracy: 99, avgTime: "11m", status: "idle" },
  { name: "Vikram Singh", pending: 11, done: 24, accuracy: 89, avgTime: "28m", status: "offline" },
];

export default function ReviewerDashboard() {
  const [queue, setQueue] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 10;

  useEffect(() => {
    fetchPipeline();
  }, [page]);

  const fetchPipeline = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPipeline('reviewer', page, limit);
      if (res.success && res.data?.data?.length > 0) {
        const mappedQueue = res.data.data.map((app: any) => ({
          id: `APP-${app.applicationId}`,
          name: app.studentName,
          college: app.scholarshipName,
          assigned: "Unassigned",
          waiting: "15m",
        }));
        setQueue(mappedQueue);
        setTotal(res.data.total);
      } else {
        setQueue(mockReviewerQueue);
        setTotal(mockReviewerQueue.length);
      }
    } catch (err) {
      console.error(err);
      setQueue(mockReviewerQueue);
      setTotal(mockReviewerQueue.length);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400">Role Dashboard</div>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">Document Checkers</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Live overview of document verification team and queue.
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
        <div className="lg:col-span-5">
          <AgentPerformance agents={CHECKERS} />
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm lg:col-span-7 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 shrink-0">
            <div className="text-[10px] uppercase tracking-widest text-slate-400">Live Queue · SLA ({total} items)</div>
            <div className="flex items-center gap-3 text-[10px] text-slate-400">
              <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />On track</span>
              <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />At risk</span>
              <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" />Breached</span>
            </div>
          </div>
          <div className="divide-y divide-slate-100 flex-1 relative min-h-[300px]">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                <LoadingSpinner size="md" />
              </div>
            ) : null}
            {queue.map((q) => {
              const lvl = getSLALevel(q.waiting);
              const rowCls = SLA_STYLES[lvl].row;
              return (
                <Link
                  key={q.id}
                  href={`/admin/pipeline/reviewer/${q.id}`}
                  className={`group flex items-center gap-3 px-5 py-3 transition hover:bg-slate-50 ${rowCls}`}
                >
                  <CircleDot className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500" strokeWidth={1.75} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">{q.name}</span>
                      <span className="text-xs text-slate-400">{q.id}</span>
                    </div>
                    <div className="truncate text-xs text-slate-500">{q.college} · {q.assigned}</div>
                  </div>
                  <SLAPill waiting={q.waiting} />
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 transition group-hover:text-slate-900" strokeWidth={1.75} />
                </Link>
              );
            })}
          </div>
          
          {/* Pagination Controls */}
          <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between bg-slate-50 rounded-b-xl mt-auto">
            <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button 
                disabled={page <= 1 || loading}
                onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                disabled={page >= totalPages || loading}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
