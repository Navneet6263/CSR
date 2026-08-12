'use client';

import { Activity, ArrowLeft, CheckCircle2, Circle, FileText, GraduationCap, LifeBuoy, Loader2, LockKeyhole, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supportApi } from '@/lib/api';
import type { SupportStudentDetail } from '@/types/support';

type Tab = 'readiness' | 'applications' | 'documents' | 'support' | 'activity';
const tabs: Array<{ id: Tab; label: string; icon: typeof Activity }> = [
  { id: 'readiness', label: 'Profile readiness', icon: CheckCircle2 },
  { id: 'applications', label: 'Applications', icon: GraduationCap },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'support', label: 'Help history', icon: LifeBuoy },
  { id: 'activity', label: 'Activity', icon: Activity },
];
const text = (value: unknown, fallback = '—') => value == null || value === '' ? fallback : String(value);
const when = (value: unknown) => value ? new Date(String(value)).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

export default function SupportStudentRecord() {
  const id = Number(useParams<{ id: string }>().id); const [detail, setDetail] = useState<SupportStudentDetail | null>(null);
  const [tab, setTab] = useState<Tab>('readiness'); const [error, setError] = useState('');
  useEffect(() => { supportApi.student(id).then((response) => setDetail(response.data)).catch((reason: Error) => setError(reason.message)); }, [id]);
  if (!detail && !error) return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="animate-spin text-amber-600" /></div>;
  if (!detail) return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">{error}</div>;
  const student = detail.student;

  return <div className="mx-auto max-w-[1450px] space-y-5">
    <Link href="/support/students" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-950"><ArrowLeft size={14} />Student directory</Link>
    <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/10">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div className="flex items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10 text-lg font-black ring-1 ring-white/15">{student.name.slice(0, 2).toUpperCase()}</span>
        <div><p className="font-mono text-[10px] uppercase tracking-widest text-amber-400">STU-{student.studentId}</p><h1 className="mt-1 text-3xl font-bold">{student.name}</h1>
          <p className="mt-1 text-xs text-white/55">{student.email} · {student.phone} · {student.city || 'City not added'}, {student.state || 'State not added'}</p></div></div>
        <div className="min-w-64 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10"><div className="flex justify-between text-xs"><span className="text-white/60">Profile readiness</span><b className="text-amber-400">{student.completion}%</b></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${student.completion}%` }} /></div>
          <p className="mt-2 flex items-center gap-1 text-[10px] text-white/45"><LockKeyhole size={10} />Sensitive identity and banking values remain hidden.</p></div></div>
    </section>

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <nav className="flex gap-1 overflow-x-auto border-b bg-slate-50 px-3 pt-2">{tabs.map((item) => <button key={item.id} onClick={() => setTab(item.id)}
        className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-xs font-bold ${tab === item.id ? 'border-amber-500 text-slate-950' : 'border-transparent text-slate-500'}`}>
        <item.icon size={14} />{item.label}</button>)}</nav>
      <div className="p-5 sm:p-6">
        {tab === 'readiness' ? <div className="grid gap-3 sm:grid-cols-2">{student.sections.map((section) => <div key={section.label}
          className={`flex items-center justify-between rounded-xl border p-4 ${section.complete ? 'border-emerald-100 bg-emerald-50/50' : 'border-rose-100 bg-rose-50/50'}`}>
          <span className="flex items-center gap-3 text-sm font-semibold">{section.complete ? <CheckCircle2 className="text-emerald-600" size={18} /> : <XCircle className="text-rose-600" size={18} />}{section.label}</span>
          <span className={`text-[10px] font-bold uppercase ${section.complete ? 'text-emerald-700' : 'text-rose-700'}`}>{section.complete ? 'Complete' : 'Missing'}</span></div>)}</div> : null}

        {tab === 'applications' ? <List empty="No scholarship application started.">{detail.applications.map((row) => <div key={text(row.ApplicationID)} className="grid gap-3 rounded-xl border p-4 sm:grid-cols-[1fr_180px_180px] sm:items-center">
          <div><b className="text-sm">{text(row.ScholarshipName)}</b><p className="font-mono text-[10px] text-slate-400">APP-{text(row.ApplicationID)}</p></div>
          <Status value={text(row.Status)} /><span className="text-xs text-slate-500">Updated {when(row.UpdatedAt)}</span></div>)}</List> : null}

        {tab === 'documents' ? <><div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700">Support can see document type and processing status only—not the uploaded file.</div>
          <List empty="No documents uploaded.">{detail.documents.map((row, index) => <div key={`${text(row.DocumentType)}-${index}`} className="flex items-center gap-3 rounded-xl border p-4">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100"><FileText size={16} /></span><div className="min-w-0 flex-1"><b className="block truncate text-sm">{text(row.DocumentType)}</b><span className="text-[10px] text-slate-500">Version {text(row.CurrentVersion, '1')} · {when(row.CreatedAt)}</span></div><Status value={text(row.ScanStatus, 'Pending')} /></div>)}</List></> : null}

        {tab === 'support' ? <List empty="No help requests from this student.">{detail.tickets.map((row) => <Link key={text(row.TicketID)} href={`/support/tickets?ticket=${text(row.TicketID)}`} className="flex items-center gap-3 rounded-xl border p-4 hover:border-amber-300">
          <LifeBuoy size={17} className="text-amber-600" /><div className="min-w-0 flex-1"><b className="block truncate text-sm">{text(row.Subject)}</b><span className="text-[10px] text-slate-500">TKT-{text(row.TicketID)} · {text(row.Category)} · {when(row.UpdatedAt)}</span></div><Status value={text(row.Status)} /></Link>)}</List> : null}

        {tab === 'activity' ? <List empty="No privacy-safe activity has been recorded yet.">{detail.activity.map((row) => <div key={text(row.ActivityID)} className="flex gap-3 rounded-xl border p-4">
          <span className="mt-0.5 grid h-8 w-8 place-items-center rounded-lg bg-amber-50 text-amber-700"><Activity size={15} /></span><div><b className="text-sm">{text(row.PageCode)}{row.StepCode ? ` · ${text(row.StepCode)}` : ''}</b>
            <p className="mt-0.5 text-[10px] text-slate-500">{text(row.EventType)}{row.ErrorCode ? ` · ${text(row.ErrorCode)}` : ''} · {when(row.OccurredAt)}</p></div></div>)}</List> : null}
      </div>
    </section>
  </div>;
}

function List({ children, empty }: { children: React.ReactNode[]; empty: string }) { return <div className="space-y-2">{children.length ? children : <p className="py-12 text-center text-sm text-slate-400">{empty}</p>}</div>; }
function Status({ value }: { value: string }) { return <span className="inline-flex w-fit items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600"><Circle size={6} className="fill-current" />{value}</span>; }
