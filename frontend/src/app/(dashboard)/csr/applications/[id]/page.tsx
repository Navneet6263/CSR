'use client';

import { ArrowLeft, Ban, Loader2, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { screeningApi } from '@/lib/api';

interface Detail { application: Record<string, unknown>; documents: Record<string, unknown>[]; backgroundChecks: Record<string, unknown>[]; decisions: Record<string, unknown>[] }
const value = (item: unknown) => item == null || item === '' ? '—' : String(item);
const money = (item: unknown) => `₹${Number(item ?? 0).toLocaleString('en-IN')}`;

export default function ApplicationReview() {
  const id = Number(useParams<{ id: string }>().id); const router = useRouter();
  const [detail, setDetail] = useState<Detail | null>(null); const [notes, setNotes] = useState('');
  const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  useEffect(() => { screeningApi.getCSRApplication(id).then((response) => setDetail(response.data as unknown as Detail)).catch((reason: Error) => setError(reason.message)); }, [id]);
  const decide = async (decision: 'Approve' | 'Decline') => {
    if (decision === 'Decline' && notes.trim().length < 5) { setError('A clear decline reason is required.'); return; }
    setSaving(true); setError('');
    try { await screeningApi.submitCSR(id, { decision, notes: notes.trim() || undefined }); router.push('/csr/approvals'); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Decision could not be recorded.'); }
    finally { setSaving(false); }
  };
  if (!detail && !error) return <div className="grid h-[60vh] place-items-center"><Loader2 className="animate-spin" /></div>;
  if (!detail) return <div className="rounded-2xl border bg-white p-10 text-center text-rose-600">{error}</div>;
  const app = detail.application;
  const fields: Array<[string, unknown]> = [['Category', app.Category], ['State', app.State], ['Institution', app.InstitutionName], ['Course', app.Course],
    ['Annual Family Income', money(app.AnnualFamilyIncome)], ['Previous Year Marks', app.PreviousYearMarks ? `${app.PreviousYearMarks}%` : '—'],
    ['10th Marks', app.TenthMarks ? `${app.TenthMarks}%` : '—'], ['12th Marks', app.TwelfthMarks ? `${app.TwelfthMarks}%` : '—'],
    ['Enrollment Year', app.EnrollmentYear], ['Current Semester / Year', app.CurrentSemesterOrYear], ['Tuition Fee', money(app.TuitionFee)]];
  return <div className="space-y-6 pb-28"><Link href="/csr/approvals" className="inline-flex items-center gap-1.5 text-sm text-slate-600"><ArrowLeft size={15} />Back to Approvals Queue</Link>
    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-pink-50 p-6"><p className="font-mono text-xs text-slate-500">APP-{value(app.ApplicationID)}</p>
      <h1 className="text-2xl font-bold">{value(app.FullName)}</h1><p className="text-sm text-slate-600">{value(app.ScholarshipName)} · {value(app.Status)}</p></div>
    {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    <section className="rounded-2xl border border-pink-100 bg-white p-6"><h2 className="mb-4 border-b pb-3 font-bold">Applicant & Academic Summary</h2>
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3">{fields.map(([label, field]) => <div key={String(label)}><p className="text-[11px] uppercase tracking-wider text-slate-500">{label}</p><p className="font-semibold">{value(field)}</p></div>)}</div></section>
    <div className="grid gap-5 md:grid-cols-2"><section className="rounded-2xl border bg-white p-5"><h2 className="font-bold">Document Verification</h2><ul className="mt-3 divide-y">{detail.documents.map((doc) => <li key={value(doc.DocumentType)} className="flex justify-between py-2 text-sm"><span>{value(doc.DocumentType)}</span><b>{value(doc.Status)}</b></li>)}</ul></section>
      <section className="rounded-2xl border bg-white p-5"><h2 className="font-bold">Background Checks</h2><ul className="mt-3 divide-y">{detail.backgroundChecks.map((check) => <li key={value(check.CheckType)} className="flex justify-between py-2 text-sm"><span>{value(check.CheckType)}</span><b>{value(check.Result)}</b></li>)}</ul></section></div>
    <section className="rounded-2xl border bg-white p-5"><label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Decision notes</label><textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={1000} rows={3} className="mt-2 w-full rounded-xl border p-3 text-sm" placeholder="Optional for approval; required for decline" /></section>
    <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/95"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"><div><p className="text-[11px] uppercase text-slate-500">Required Funding</p><p className="text-2xl font-bold text-emerald-700">{money(app.ScholarshipAmount)}</p></div>
      <div className="flex gap-3"><button disabled={saving} onClick={() => decide('Decline')} className="inline-flex items-center gap-2 rounded-xl border-2 border-rose-200 px-5 py-2.5 text-sm font-bold text-rose-600"><Ban size={16} />Decline</button>
        <button disabled={saving} onClick={() => decide('Approve')} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white"><Wallet size={16} />Approve Funding</button></div></div></div>
  </div>;
}
