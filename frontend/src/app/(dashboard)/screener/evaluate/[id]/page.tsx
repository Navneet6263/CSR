'use client';

import { ArrowLeft, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScreenerHeader } from '@/components/screener/ScreenerHeader';
import { ScreeningCaseOverview } from '@/components/screener/ScreeningCaseOverview';
import { ScreeningDecisionPanel } from '@/components/screener/ScreeningDecisionPanel';
import { ScreeningEvidenceReview } from '@/components/screener/ScreeningEvidenceReview';
import { screeningApi } from '@/lib/api';
import type { ScreeningDecisionRequest, ScreeningDetail } from '@/types/screening';

export default function EvaluateApplicationPage() {
  const id = Number(useParams<{ id: string }>().id); const [detail, setDetail] = useState<ScreeningDetail | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const [error, setError] = useState(''); const [success, setSuccess] = useState('');
  const load = useCallback(async () => {
    if (!Number.isInteger(id) || id < 1) throw new Error('Invalid application ID.');
    const response = await screeningApi.getConsolidated(id); setDetail(response.data ?? null);
  }, [id]);
  useEffect(() => { setLoading(true); load().catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false)); }, [load]);
  const docsReady = useMemo(() => Boolean(detail?.documents.length) && detail!.documents.every((doc) => doc.Status === 'Verified'), [detail]);
  const backgroundReady = useMemo(() => { const map = new Map(detail?.bgChecks.map((check) => [check.CheckType, check.Result])); return ['Identity', 'Address', 'IncomeVerification'].every((type) => map.get(type) === 'Pass'); }, [detail]);
  const decide = async (request: ScreeningDecisionRequest) => {
    setSaving(true); setError(''); setSuccess('');
    try { const response = await screeningApi.submitScreeningDecision(id, request); setSuccess(response.message ?? 'Screening decision recorded.');
      if (request.decision === 'Reject' && request.returnTo !== 'CloseApplication') { router.push('/screener'); return; }
      await load(); }
    catch (reason) { const message = reason instanceof Error ? reason.message : 'Decision could not be recorded.'; setError(message); throw new Error(message); }
    finally { setSaving(false); }
  };
  const status = String(detail?.application.Status ?? ''); const closed = !['BGCheckComplete', 'ScreeningPending'].includes(status);

  return <div className="screener-theme min-h-screen"><ScreenerHeader /><main className="mx-auto w-full max-w-[1400px] space-y-5 px-4 py-5 sm:px-6 sm:py-7">
    <div className="flex items-center justify-between gap-3"><Link href="/screener" className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-brand"><ArrowLeft size={14} />Back to queue</Link>{detail ? <button onClick={() => void load()} className="inline-flex items-center gap-1.5 rounded-md border border-brand/10 bg-brand/5 px-2.5 py-1.5 text-[10px] font-semibold text-text-muted"><RefreshCw size={12} />Refresh record</button> : null}</div>
    {loading ? <div className="glass-card grid min-h-[55vh] place-items-center"><div className="text-center"><Loader2 className="mx-auto animate-spin text-brand" /><p className="mt-3 text-xs text-text-dim">Loading consolidated evidence…</p></div></div> : null}
    {!loading && !detail ? <div className="rounded-xl border border-danger/30 bg-danger/10 p-8 text-center text-sm text-danger">{error || 'Application record is unavailable.'}</div> : null}
    {!loading && detail ? <><ScreeningCaseOverview application={detail.application} />{success ? <div role="status" className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 p-3 text-xs font-semibold text-success"><CheckCircle2 size={14} />{success}</div> : null}{error ? <div role="alert" className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-xs font-semibold text-danger">{error}</div> : null}
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]"><ScreeningEvidenceReview application={detail.application} documents={detail.documents} checks={detail.bgChecks} rules={detail.eligibilityRules} history={detail.statusHistory} /><ScreeningDecisionPanel docsReady={docsReady} backgroundReady={backgroundReady} held={Boolean(detail.application.IsHeldByAdmin)} closed={closed} saving={saving} documents={detail.documents} checks={detail.bgChecks} onSubmit={decide} /></div></> : null}
  </main></div>;
}
