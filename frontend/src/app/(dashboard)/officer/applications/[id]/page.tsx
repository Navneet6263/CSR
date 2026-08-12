'use client';

import { ArrowLeft, CheckCircle2, Loader2, RefreshCw, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { OfficerCaseSummary } from '@/components/officer/OfficerCaseSummary';
import { OfficerCheckWorkspace } from '@/components/officer/OfficerCheckWorkspace';
import { OfficerDocuments } from '@/components/officer/OfficerDocuments';
import { TopNav } from '@/components/officer/TopNav';
import { verificationApi } from '@/lib/api';
import type { BGCheckPayload } from '@/types/domain';
import type { OfficerCaseDetail } from '@/types/officer';

export default function FieldWorkspace() {
  const id = Number(useParams<{ id: string }>().id);
  const [detail, setDetail] = useState<OfficerCaseDetail | null>(null);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const [error, setError] = useState(''); const [success, setSuccess] = useState('');
  const load = useCallback(async () => {
    if (!Number.isInteger(id) || id < 1) throw new Error('Invalid application ID.');
    const response = await verificationApi.getBGCheckDetails(id); setDetail(response.data ?? null);
  }, [id]);
  useEffect(() => { setLoading(true); load().catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false)); }, [load]);
  const completed = useMemo(() => detail?.checks.filter((check) => check.result === 'Pass').length ?? 0, [detail]);
  const record = async (payload: BGCheckPayload) => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const response = await verificationApi.submitBGCheck(id, payload);
      setSuccess(response.message ?? `${payload.checkType} check recorded.`); await load();
    } catch (reason) { const message = reason instanceof Error ? reason.message : 'Check could not be recorded.'; setError(message); throw new Error(message); }
    finally { setSaving(false); }
  };

  return <div className="min-h-screen bg-slate-50/50"><TopNav />
    <main className="mx-auto w-full max-w-[1400px] space-y-5 px-4 py-5 lg:px-8 lg:py-7">
      <div className="flex items-center justify-between gap-3"><Link href="/officer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-cyan-700"><ArrowLeft size={14} />Back to workload</Link>
        {detail ? <button onClick={() => void load()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-600"><RefreshCw size={12} />Refresh case</button> : null}</div>
      {loading ? <div className="grid min-h-[55vh] place-items-center rounded-2xl bg-white ring-1 ring-slate-200"><div className="text-center"><Loader2 className="mx-auto animate-spin text-cyan-600" /><p className="mt-3 text-xs text-slate-500">Loading secure student record…</p></div></div> : null}
      {!loading && !detail ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-700">{error || 'Application record is unavailable.'}</div> : null}
      {!loading && detail ? <>
        <OfficerCaseSummary student={detail.student} completed={completed} />
        {detail.returnInstruction?.notes ? <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900"><RotateCcw className="mt-0.5 h-4 w-4 shrink-0" /><div><p className="text-xs font-bold">Returned by Screening Officer</p><p className="mt-1 text-sm leading-relaxed">{detail.returnInstruction.notes}</p>{detail.returnInstruction.returnedAt ? <p className="mt-1 text-[10px] text-amber-700">{new Date(detail.returnInstruction.returnedAt).toLocaleString('en-IN')}</p> : null}</div></div> : null}
        {success ? <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700"><CheckCircle2 size={15} />{success}</div> : null}
        {error ? <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">{error}</div> : null}
        <OfficerDocuments rows={detail.docs} />
        <OfficerCheckWorkspace checks={detail.checks} held={Boolean(detail.student.isHeld)}
          closed={!['DocAuditComplete', 'BGCheckInProgress'].includes(String(detail.student.applicationStatus))}
          saving={saving} onSubmit={record} />
      </> : null}
    </main>
  </div>;
}
