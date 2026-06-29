'use client';

import { Suspense, useMemo, useState, useTransition, useEffect } from "react";
import { HandHeart, Download, FileText } from "lucide-react";
import CSRMetrics from "@/components/admin/csr/CSRMetrics";
import ApprovalQueueTable, { type CSRStudent } from "@/components/admin/csr/ApprovalQueueTable";
import ImpactDonut from "@/components/admin/csr/ImpactDonut";
import CSRActivity from "@/components/admin/csr/CSRActivity";
import AuthorizeBar from "@/components/admin/csr/AuthorizeBar";
import { adminApi } from '@/lib/api/admin';
import LoadingSpinner from '@/components/shared/LoadingSpinner';


const COLLEGES = ["IIT Bombay", "BITS Pilani", "NIT Trichy", "IIIT Hyderabad", "Anna University", "Delhi Tech University", "VIT Vellore", "MNIT Jaipur"];
const COURSES = ["B.Tech CSE", "B.Tech ECE", "MBBS", "B.Sc Physics", "B.Tech Mech", "B.Com Hons", "BDS", "B.Tech AI/ML"];
const CATS: CSRStudent["category"][] = ["SC", "ST", "OBC", "GEN", "EWS"];
const NAMES = ["Ananya Sharma", "Karthik Nair", "Meera Joshi", "Rahul Verma", "Divya Patel", "Aman Gupta", "Priya Reddy", "Suresh Pillai", "Kavya Iyer", "Rohan Mehta", "Sneha Das", "Aditya Singh"];

function seed(n: number): CSRStudent[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `STU-${5000 + i}`,
    name: NAMES[i % NAMES.length] + (i >= NAMES.length ? ` ${Math.floor(i / NAMES.length) + 1}` : ""),
    college: COLLEGES[i % COLLEGES.length],
    course: COURSES[i % COURSES.length],
    gpa: +(7.2 + ((i * 37) % 28) / 10).toFixed(1),
    amount: [40000, 50000, 60000, 75000][i % 4],
    score: +(7 + ((i * 53) % 30) / 10).toFixed(1),
    category: CATS[i % CATS.length],
  }));
}

const ROWS = seed(120);

const IMPACT = [
  { name: "Engineering", value: 4200000, color: "#0f172a" },
  { name: "Medical", value: 2800000, color: "#475569" },
  { name: "Sciences", value: 1600000, color: "#94a3b8" },
  { name: "Commerce", value: 900000, color: "#cbd5e1" },
  { name: "Arts", value: 500000, color: "#e2e8f0" },
];

export default function CSRDashboard() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [optimisticRows, setOptimisticRows] = useState<CSRStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetchPipeline();
  }, []);

  const fetchPipeline = async () => {
    try {
      const res = await adminApi.getPipeline('csr');
      if (res.success && res.data?.data?.length > 0) {
        const mappedQueue = res.data.data.map((app: any, i: number) => ({
          id: `APP-${app.applicationId}`,
          name: app.studentName,
          college: app.scholarshipName, // mapping scholarship here
          course: COURSES[i % COURSES.length], // mock fallback
          gpa: +(7.2 + ((i * 37) % 28) / 10).toFixed(1), // mock fallback
          amount: parseFloat(app.scholarshipAmount) || 50000,
          score: +(7 + ((i * 53) % 30) / 10).toFixed(1), // mock fallback
          category: CATS[i % CATS.length], // mock fallback
        }));
        setOptimisticRows(mappedQueue);
      } else {
        setOptimisticRows(ROWS);
      }
    } catch (err) {
      console.error(err);
      setOptimisticRows(ROWS);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };
  const toggleAll = () => {
    if (selected.size === optimisticRows.length) setSelected(new Set());
    else setSelected(new Set(optimisticRows.map((r) => r.id)));
  };

  const selectedAmount = useMemo(
    () => optimisticRows.filter((r) => selected.has(r.id)).reduce((s, r) => s + r.amount, 0),
    [selected, optimisticRows],
  );

  const authorize = () => {
    setPending(true);
    // Optimistic: remove authorized rows immediately
    startTransition(() => {
      setOptimisticRows((rows) => rows.filter((r) => !selected.has(r.id)));
      setSelected(new Set());
    });
    setTimeout(() => setPending(false), 600);
  };

  if (loading) return <div className="h-full flex items-center justify-center min-h-[50vh]"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-5 pb-24">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-slate-400">Role Dashboard</div>
          <h1 className="mt-1 flex items-center gap-2 truncate text-xl sm:text-2xl font-semibold text-slate-900">
            <HandHeart className="h-5 w-5 text-slate-500" /> CSR Partner Console
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 truncate">Tata CSR Foundation · FY 2026 · Reviewing Batch #403</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
            <FileText className="h-3.5 w-3.5" /> Impact Report
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </header>

      <Suspense fallback={<div className="h-24 animate-pulse rounded-2xl bg-slate-100" />}>
        <CSRMetrics committed={20000000} disbursed={11800000} pending={selectedAmount || 4800000} students={264} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-[1.85fr_1fr] gap-4">
        <ApprovalQueueTable rows={optimisticRows} selected={selected} onToggle={toggle} onToggleAll={toggleAll} />

        <div className="space-y-4">
          <ImpactDonut slices={IMPACT} />
          <CSRActivity />
        </div>
      </div>

      <AuthorizeBar
        count={selected.size}
        amount={selectedAmount}
        onClear={() => setSelected(new Set())}
        onAuthorize={authorize}
        pending={pending}
      />
    </div>
  );
}
