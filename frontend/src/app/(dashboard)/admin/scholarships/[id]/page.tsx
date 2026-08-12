'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Calendar, Download, GraduationCap, Pause, Play, Wallet } from 'lucide-react';
import { adminApi, scholarshipApi } from '@/lib/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

type Row = Record<string, any>;
const money = (value: number) => `₹${value.toLocaleString('en-IN')}`;

export default function ManageScholarship() {
  const id = Number(useParams<{ id: string }>().id); const [data, setData] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  const load = useCallback(async () => { try { const response = await adminApi.getScholarshipOverview(id); setData(response.data); setError(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Scholarship could not be loaded.'); }
    finally { setLoading(false); } }, [id]);
  useEffect(() => { void load(); }, [load]);
  const statusCounts = useMemo(() => data?.statusCounts ?? {}, [data]); const scholarship = data?.scholarship ?? {};
  const totalBudget = Number(scholarship.TotalBudget ?? 0); const disbursed = Number(data?.disbursed ?? 0);
  const reserved = Number(data?.reserved ?? 0); const remaining = Math.max(0, totalBudget - disbursed - reserved);
  const seats = Number(scholarship.MaxApplicants ?? 0); const filled = Number(data?.applicationCount ?? 0);
  const pct = seats ? Math.min(100, Math.round((filled / seats) * 100)) : 0;
  const approved = useMemo(() => ['CSRApproved', 'PaymentPending', 'PaymentInitiated', 'PaymentCompleted']
    .reduce((sum, status) => sum + Number(statusCounts[status] ?? 0), 0), [statusCounts]);

  async function toggleStatus() {
    setSaving(true); try { await scholarshipApi.update(id, { status: scholarship.Status === 'Active' ? 'Inactive' : 'Active' }); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Status could not be updated.'); }
    finally { setSaving(false); }
  }
  function exportSummary() {
    const rows = [['Metric', 'Value'], ['Applications', filled], ['Approved', approved], ['Disbursed', disbursed], ['Reserved', reserved]];
    const blob = new Blob([rows.map((row) => row.join(',')).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url;
    anchor.download = `scholarship-${id}-summary.csv`; anchor.click(); URL.revokeObjectURL(url);
  }
  if (loading) return <div className="grid min-h-80 place-items-center"><LoadingSpinner size="lg" /></div>;
  if (!data) return <p className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-700">{error}</p>;

  return <div className="mx-auto max-w-7xl space-y-5">
    <Link href="/admin/scholarships" className="inline-flex items-center gap-1 text-xs text-slate-500"><ArrowLeft className="h-3.5 w-3.5" />All Scholarships</Link>
    {error && <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    <header className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-900 text-white"><GraduationCap className="h-4 w-4" /></div><div><h1 className="text-2xl font-semibold">{scholarship.Name}</h1><p className="text-xs text-slate-500">{scholarship.SponsorName} · {scholarship.Status} · Closes {new Date(scholarship.ApplicationCloseDate).toLocaleDateString('en-IN')}</p></div></div><div className="flex gap-2"><button onClick={exportSummary} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs"><Download className="h-3.5 w-3.5" />Export</button><button disabled={saving || scholarship.Status === 'Closed'} onClick={toggleStatus} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">{scholarship.Status === 'Active' ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}{scholarship.Status === 'Active' ? 'Pause' : 'Activate'}</button><Link href={`/admin/scholarships/${id}/rules`} className="rounded-lg bg-slate-900 px-3 py-2 text-xs text-white">Edit Rules</Link></div></header>

    <div className="grid grid-cols-2 gap-4 md:grid-cols-4"><Metric label="Budget" value={money(totalBudget)} icon={<Wallet className="h-4 w-4" />} /><Metric label="Disbursed" value={money(disbursed)} /><Metric label="Reserved" value={money(reserved)} /><Metric label="Remaining" value={money(remaining)} /></div>
    <div className="grid gap-4 lg:grid-cols-3"><div className="space-y-4 lg:col-span-2"><Card title="Fund Utilization"><div className="flex h-3 overflow-hidden rounded-full bg-slate-100"><div className="bg-emerald-500" style={{ width: `${totalBudget ? disbursed / totalBudget * 100 : 0}%` }} /><div className="bg-amber-400" style={{ width: `${totalBudget ? reserved / totalBudget * 100 : 0}%` }} /></div><p className="mt-3 text-xs text-slate-500">Green: disbursed · Amber: reserved · Remaining available</p></Card>
      <Card title="Eligibility Rules"><ul className="divide-y">{(data.rules ?? []).map((rule: Row) => <li key={rule.RuleID} className="flex flex-wrap gap-2 py-2.5 text-sm"><b>{rule.RuleType}</b><span>{rule.Operator}</span><span>{rule.ValueList || [rule.ValueMin, rule.ValueMax].filter(Boolean).join(' – ')}</span></li>)}{!data.rules?.length && <li className="py-4 text-sm text-slate-500">No eligibility rules configured.</li>}</ul></Card>
      <Card title="Recent Audit"><ul className="divide-y">{(data.recentAudit ?? []).map((event: Row, index: number) => <li key={`${event.CreatedAt}-${index}`} className="py-2.5 text-sm"><b>{event.Action}</b><span className="ml-2 text-xs text-slate-500">{event.ActorName || 'System'} · {new Date(event.CreatedAt).toLocaleString('en-IN')}</span></li>)}{!data.recentAudit?.length && <li className="py-4 text-sm text-slate-500">No scholarship audit events.</li>}</ul></Card></div>
      <div className="space-y-4"><Card title="Seats"><div className="text-3xl font-semibold">{filled}<span className="text-lg text-slate-400">/{seats || '∞'}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-slate-900" style={{ width: `${pct}%` }} /></div></Card><Card title="Live Application Status"><ul className="space-y-2 text-sm"><li className="flex justify-between"><span>Applications</span><b>{filled}</b></li><li className="flex justify-between"><span>Approved</span><b>{approved}</b></li>{Object.entries(statusCounts).map(([status, count]) => <li key={status} className="flex justify-between text-xs text-slate-500"><span>{status}</span><span>{Number(count)}</span></li>)}</ul></Card><Card title="Schedule"><p className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4" />{new Date(scholarship.ApplicationOpenDate).toLocaleDateString('en-IN')} – {new Date(scholarship.ApplicationCloseDate).toLocaleDateString('en-IN')}</p></Card></div></div>
  </div>;
}

function Metric({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) { return <div className="rounded-xl border bg-white p-4"><div className="flex justify-between text-[10px] uppercase tracking-widest text-slate-500"><span>{label}</span>{icon}</div><p className="mt-2 text-xl font-semibold">{value}</p></div>; }
function Card({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-xl border bg-white"><h2 className="border-b px-4 py-2.5 text-sm font-semibold">{title}</h2><div className="p-4">{children}</div></section>; }
