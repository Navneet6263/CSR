'use client';

import { PiggyBank, Sparkles, TrendingUp, Users, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CityBarChart, GenderPieChart } from '@/components/csr/Charts';
import MetricCard from '@/components/csr/MetricCard';
import { authApi, screeningApi } from '@/lib/api';

interface Stats { sponsorName: string; totalFund: number; allocated: number; utilized: number; pending: number; approved: number; beneficiaries: number; stateDistribution: { label: string; count: number; amount: number }[]; genderDistribution: { label: string; count: number }[] }
const money = (value: number) => `₹${value.toLocaleString('en-IN')}`;

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null); const [error, setError] = useState('');
  const user = authApi.getUser();
  useEffect(() => { screeningApi.getCSRStats().then((response) => setStats(response.data as unknown as Stats)).catch((reason: Error) => setError(reason.message)); }, []);
  const total = stats?.totalFund ?? 0; const used = stats?.utilized ?? 0; const allocated = stats?.allocated ?? 0;
  return <div className="space-y-8"><section className="flex flex-wrap items-end justify-between gap-4"><div>
    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700"><Sparkles size={12} />Live Impact Overview</div>
    <h1 className="mt-3 text-3xl font-bold">Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}.</h1>
    <p className="mt-1 text-sm text-slate-600">Sponsor-scoped view for <b className="text-emerald-700">{stats?.sponsorName ?? 'your organization'}</b>.</p></div></section>
    {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"><MetricCard label="Total Fund" value={money(total)} sub="Configured sponsor envelope" icon={<Wallet size={20} />} tone="emerald" />
      <MetricCard label="Disbursed" value={money(used)} sub={`${total ? Math.round(used / total * 100) : 0}% utilized`} icon={<TrendingUp size={20} />} tone="pink" />
      <MetricCard label="Available Corpus" value={money(Math.max(0, total - allocated - used))} sub={`${money(allocated)} reserved`} icon={<PiggyBank size={20} />} tone="slate" />
      <MetricCard label="Beneficiaries" value={String(stats?.beneficiaries ?? 0)} sub="Approved students" icon={<Users size={20} />} tone="amber" /></section>
    <section className="grid gap-6 lg:grid-cols-5"><div className="lg:col-span-3"><CityBarChart data={stats?.stateDistribution ?? []} /></div><div className="lg:col-span-2"><GenderPieChart data={stats?.genderDistribution ?? []} /></div></section>
    <section className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-pink-50 p-6 shadow-sm"><div className="flex items-center justify-between gap-4"><div><h3 className="text-lg font-bold">{stats?.pending ?? 0} applications awaiting approval</h3>
      <p className="text-sm text-slate-600">Only applications assigned to your sponsor are shown.</p></div><Link href="/csr/approvals" className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white">Review Queue →</Link></div></section>
  </div>;
}
