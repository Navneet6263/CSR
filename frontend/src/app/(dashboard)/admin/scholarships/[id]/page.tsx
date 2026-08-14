'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Activity, ArrowLeft, Calendar, CalendarClock, CheckCircle2, Download, FilePenLine,
  GraduationCap, History, Megaphone, Pause, Play, ShieldCheck, Wallet, X,
} from 'lucide-react';
import { adminApi, scholarshipApi } from '@/lib/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { invalidatePublicPortalCache } from '@/lib/publicPortalCache';

type Row = Record<string, any>;
type PauseForm = { reason: string; resumeAt: string; publishNotice: boolean };
const emptyPause: PauseForm = { reason: '', resumeAt: '', publishNotice: true };
const money = (value: number) => `₹${value.toLocaleString('en-IN')}`;
const when = (value?: string | Date | null) => value ? new Date(value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Not scheduled';

function auditDetails(event: Row) {
  try {
    const value = typeof event.NewValue === 'string' ? JSON.parse(event.NewValue) : event.NewValue;
    if (!value) return '';
    return [value.reason, value.resumeAt ? `Resume: ${when(value.resumeAt)}` : '', value.publicNotice === true ? 'Public notice published' : '']
      .filter(Boolean).join(' · ');
  } catch { return ''; }
}

export default function ManageScholarship() {
  const id = Number(useParams<{ id: string }>().id);
  const [data, setData] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [pauseForm, setPauseForm] = useState<PauseForm>(emptyPause);

  const load = useCallback(async () => {
    try { const response = await adminApi.getScholarshipOverview(id); setData(response.data); setError(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Scholarship could not be loaded.'); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => { void load(); }, [load]);

  const statusCounts = useMemo(() => data?.statusCounts ?? {}, [data]);
  const scholarship = data?.scholarship ?? {};
  const totalBudget = Number(scholarship.TotalBudget ?? 0);
  const disbursed = Number(data?.disbursed ?? 0);
  const reserved = Number(data?.reserved ?? 0);
  const remaining = Math.max(0, totalBudget - disbursed - reserved);
  const seats = Number(scholarship.MaxApplicants ?? 0);
  const filled = Number(data?.applicationCount ?? 0);
  const pct = seats ? Math.min(100, Math.round((filled / seats) * 100)) : 0;
  const approved = useMemo(() => ['CSRApproved', 'PaymentPending', 'PaymentInitiated', 'PaymentCompleted']
    .reduce((sum, status) => sum + Number(statusCounts[status] ?? 0), 0), [statusCounts]);
  const contentPublished = scholarship.ContentStatus === 'Published';

  async function pauseProgram() {
    if (pauseForm.reason.trim().length < 10) { setError('Pause reason kam se kam 10 characters ka hona chahiye.'); return; }
    setSaving(true); setError(''); setNotice('');
    try {
      await scholarshipApi.pause(id, { reason: pauseForm.reason.trim(),
        resumeAt: pauseForm.resumeAt ? new Date(pauseForm.resumeAt).toISOString() : undefined,
        publishNotice: pauseForm.publishNotice });
      invalidatePublicPortalCache(); setPauseOpen(false); setPauseForm(emptyPause);
      setNotice('Scholarship paused. Students and public notice have been updated.'); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Scholarship could not be paused.'); }
    finally { setSaving(false); }
  }

  async function resumeProgram() {
    if (!window.confirm('Make this scholarship live now? The pause notice will be archived.')) return;
    setSaving(true); setError(''); setNotice('');
    try { await scholarshipApi.resume(id); invalidatePublicPortalCache(); setNotice('Scholarship is live again.'); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Scholarship could not be resumed.'); }
    finally { setSaving(false); }
  }

  async function activateInactive() {
    setSaving(true); setError('');
    try { await scholarshipApi.update(id, { status: 'Active' }); setNotice('Scholarship activated.'); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Scholarship could not be activated.'); }
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

  const paused = scholarship.Status === 'Paused';
  return <div className="mx-auto max-w-7xl space-y-5">
    <Link href="/admin/scholarships" className="inline-flex items-center gap-1 text-xs text-slate-500"><ArrowLeft className="h-3.5 w-3.5" />All Scholarships</Link>
    {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    {notice && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}

    <header className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-950 text-white"><GraduationCap className="h-5 w-5" /></div><div>
          <div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-semibold">{scholarship.Name}</h1><StatusBadge status={scholarship.Status} /></div>
          <p className="mt-1 text-xs text-slate-500">{scholarship.SponsorName} · Content {scholarship.ContentStatus || 'not started'} · Closes {new Date(scholarship.ApplicationCloseDate).toLocaleDateString('en-IN')}</p>
        </div></div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportSummary} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs"><Download className="h-3.5 w-3.5" />Export</button>
          {scholarship.Status === 'Active' && <button disabled={saving} onClick={() => setPauseOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-800"><Pause className="h-3.5 w-3.5" />Pause program</button>}
          {paused && <button disabled={saving} onClick={() => void resumeProgram()} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white"><Play className="h-3.5 w-3.5" />Resume now</button>}
          {scholarship.Status === 'Inactive' && <button title={!contentPublished ? 'Approve and publish content first' : undefined} disabled={saving || !contentPublished} onClick={() => void activateInactive()} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"><Play className="h-3.5 w-3.5" />Activate</button>}
          <Link href={`/admin/scholarships/${id}/rules`} className="rounded-lg border px-3 py-2 text-xs">Edit Rules</Link>
          <Link href={`/admin/scholarships/${id}/content`} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-3 py-2 text-xs text-white"><FilePenLine className="h-3.5 w-3.5" />Content Builder</Link>
        </div>
      </div>
    </header>

    {paused && <section className="rounded-2xl border border-orange-200 bg-orange-50 p-5 text-orange-950">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="flex items-center gap-2 text-sm font-bold"><Pause className="h-4 w-4" />Program is paused</p><p className="mt-2 max-w-3xl text-sm leading-6 text-orange-900/80">{scholarship.PauseReason}</p></div>
        <div className="rounded-xl border border-orange-200 bg-white/70 px-4 py-3 text-xs"><p className="font-bold uppercase tracking-wider">Automatic resume</p><p className="mt-1 flex items-center gap-1.5"><CalendarClock className="h-4 w-4" />{when(scholarship.ResumeAt)}</p><p className="mt-1 flex items-center gap-1.5"><Megaphone className="h-4 w-4" />Public notice {scholarship.PublishPauseNotice ? 'live' : 'off'}</p></div>
      </div>
    </section>}

    <div className="grid grid-cols-2 gap-4 md:grid-cols-4"><Metric label="Budget" value={money(totalBudget)} icon={<Wallet className="h-4 w-4" />} /><Metric label="Disbursed" value={money(disbursed)} /><Metric label="Reserved" value={money(reserved)} /><Metric label="Remaining" value={money(remaining)} /></div>
    <div className="grid gap-4 lg:grid-cols-3"><div className="space-y-4 lg:col-span-2">
      <Card title="Fund utilization" icon={<Activity className="h-4 w-4" />}><div className="flex h-3 overflow-hidden rounded-full bg-slate-100"><div className="bg-emerald-500" style={{ width: `${totalBudget ? disbursed / totalBudget * 100 : 0}%` }} /><div className="bg-amber-400" style={{ width: `${totalBudget ? reserved / totalBudget * 100 : 0}%` }} /></div><p className="mt-3 text-xs text-slate-500">Green: disbursed · Amber: reserved · Remaining available</p></Card>
      <Card title="Publishing workflow" icon={<ShieldCheck className="h-4 w-4" />}><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold">Content {scholarship.ContentStatus || 'not started'}</p><p className="mt-1 text-xs text-slate-500">Draft v{scholarship.DraftVersion || 0} · Published v{scholarship.PublishedVersion || '—'}</p></div><Link href={`/admin/scholarships/${id}/content`} className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white">Open review screen</Link></div></Card>
      <Card title="Eligibility rules" icon={<CheckCircle2 className="h-4 w-4" />}><ul className="divide-y">{(data.rules ?? []).map((rule: Row) => <li key={rule.RuleID} className="flex flex-wrap gap-2 py-2.5 text-sm"><b>{rule.RuleType}</b><span>{rule.Operator}</span><span>{rule.ValueList || [rule.ValueMin, rule.ValueMax].filter(Boolean).join(' – ')}</span></li>)}{!data.rules?.length && <li className="py-4 text-sm text-slate-500">No eligibility rules configured.</li>}</ul></Card>
      <Card title="Scholarship activity log" icon={<History className="h-4 w-4" />}><ul className="space-y-3">{(data.recentAudit ?? []).map((event: Row) => <li key={event.LogID} className="rounded-xl border bg-slate-50 p-3"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-sm font-semibold">{String(event.Action).toLowerCase().replaceAll('_', ' ')}</p><p className="mt-0.5 text-xs text-slate-500">{event.ActorName || 'System automation'} · {event.ActorRole || 'System'}</p></div><time className="text-[11px] text-slate-400">{when(event.CreatedAt)}</time></div>{auditDetails(event) && <p className="mt-2 rounded-lg bg-white p-2 text-xs leading-5 text-slate-600">{auditDetails(event)}</p>}{event.RequestID && <p className="mt-2 font-mono text-[9px] text-slate-400">Request {event.RequestID}</p>}</li>)}{!data.recentAudit?.length && <li className="py-4 text-sm text-slate-500">No scholarship audit events.</li>}</ul></Card>
    </div><div className="space-y-4">
      <Card title="Seats"><div className="text-3xl font-semibold">{filled}<span className="text-lg text-slate-400">/{seats || '∞'}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-slate-950" style={{ width: `${pct}%` }} /></div></Card>
      <Card title="Live application status"><ul className="space-y-2 text-sm"><li className="flex justify-between"><span>Applications</span><b>{filled}</b></li><li className="flex justify-between"><span>Approved</span><b>{approved}</b></li>{Object.entries(statusCounts).map(([status, count]) => <li key={status} className="flex justify-between text-xs text-slate-500"><span>{status}</span><span>{Number(count)}</span></li>)}</ul></Card>
      <Card title="Schedule" icon={<Calendar className="h-4 w-4" />}><p className="text-sm">{new Date(scholarship.ApplicationOpenDate).toLocaleDateString('en-IN')} – {new Date(scholarship.ApplicationCloseDate).toLocaleDateString('en-IN')}</p></Card>
    </div></div>

    {pauseOpen && <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-950/40 p-3 backdrop-blur-sm sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && setPauseOpen(false)}>
      <section role="dialog" aria-modal="true" aria-labelledby="pause-title" className="my-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]">
        <header className="flex shrink-0 items-start justify-between border-b p-4 sm:p-5"><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wider text-orange-700">Operational control</p><h2 id="pause-title" className="mt-1 break-words text-lg font-bold sm:text-xl">Pause {scholarship.Name}</h2><p className="mt-1 text-xs text-slate-500 sm:text-sm">Applications stop immediately. Existing applications remain safe.</p></div><button onClick={() => setPauseOpen(false)} aria-label="Close" className="ml-3 shrink-0 rounded-lg p-2 hover:bg-slate-100"><X className="h-4 w-4" /></button></header>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 sm:p-5">
          <label className="block text-sm font-semibold">Why are you pausing this scholarship?<textarea autoFocus rows={4} maxLength={1000} value={pauseForm.reason} onChange={(event) => setPauseForm((value) => ({ ...value, reason: event.target.value }))} placeholder="Example: Sponsor is reviewing the eligibility criteria and final seat allocation." className="mt-2 w-full rounded-xl border p-3 text-sm font-normal outline-none focus:border-orange-400" /><span className="mt-1 block text-right text-[10px] font-normal text-slate-400">{pauseForm.reason.length}/1000</span></label>
          <label className="block text-sm font-semibold">Automatically make it live on <span className="font-normal text-slate-400">(optional)</span><input type="datetime-local" min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)} value={pauseForm.resumeAt} onChange={(event) => setPauseForm((value) => ({ ...value, resumeAt: event.target.value }))} className="mt-2 w-full rounded-xl border px-3 py-2.5 font-normal" /><span className="mt-1 block text-xs font-normal text-slate-500">If blank, an admin must resume it manually.</span></label>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4"><input type="checkbox" checked={pauseForm.publishNotice} onChange={(event) => setPauseForm((value) => ({ ...value, publishNotice: event.target.checked }))} className="mt-1 h-4 w-4" /><span><b className="flex items-center gap-1.5 text-sm text-blue-950"><Megaphone className="h-4 w-4" />Publish student notice</b><span className="mt-1 block text-xs leading-5 text-blue-900/70">Show the reason and reopening date on both the public landing banner and student scholarship page.</span></span></label>
        </div>
        <footer className="flex shrink-0 flex-col-reverse gap-2 border-t bg-slate-50 p-3 sm:flex-row sm:justify-end sm:p-4"><button disabled={saving} onClick={() => setPauseOpen(false)} className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold">Cancel</button><button disabled={saving || pauseForm.reason.trim().length < 10} onClick={() => void pauseProgram()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"><Pause className="h-4 w-4" />{saving ? 'Pausing…' : 'Confirm pause'}</button></footer>
      </section>
    </div>}
  </div>;
}

function StatusBadge({ status }: { status: string }) { const style = status === 'Active' ? 'bg-emerald-50 text-emerald-700' : status === 'Paused' ? 'bg-orange-50 text-orange-700' : status === 'Closed' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'; return <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${style}`}>{status}</span>; }
function Metric({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) { return <div className="rounded-xl border bg-white p-4"><div className="flex justify-between text-[10px] uppercase tracking-widest text-slate-500"><span>{label}</span>{icon}</div><p className="mt-2 text-xl font-semibold">{value}</p></div>; }
function Card({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) { return <section className="rounded-xl border bg-white"><h2 className="flex items-center gap-2 border-b px-4 py-3 text-sm font-semibold">{icon}{title}</h2><div className="p-4">{children}</div></section>; }
