'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FileText, History, PauseCircle, PlayCircle } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { applicationApi } from '@/lib/api/resources';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmergencyApprovalPanel from './EmergencyApprovalPanel';

type Row = Record<string, any>;

const sensitive = /aadhaar|aadhar|bank|account|ifsc|cipher|hash|file|phone|email/i;

function valueOf(row: Row, ...keys: string[]) {
  for (const key of keys) if (row?.[key] !== undefined && row[key] !== null) return row[key];
  return '—';
}

function Snapshot({ data }: { data?: Row | null }) {
  const source = data?.profile && typeof data.profile === 'object' ? data.profile as Row : data;
  const entries = Object.entries(source ?? {}).filter(([key, value]) =>
    !sensitive.test(key) && value !== null && value !== '' && typeof value !== 'object');
  return (
    <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <h2 className="text-[10px] uppercase tracking-widest text-slate-400">Submitted profile snapshot</h2>
      {entries.length ? <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {entries.map(([key, value]) => <div key={key}>
          <dt className="text-[10px] uppercase tracking-wide text-slate-400">{key.replace(/([A-Z])/g, ' $1')}</dt>
          <dd className="mt-1 break-words text-sm text-slate-700">{String(value)}</dd>
        </div>)}
      </dl> : <p className="mt-3 text-sm text-slate-500">No submitted profile snapshot is available.</p>}
    </section>
  );
}

export default function ApplicationRecord({ rawId }: { rawId: string }) {
  const applicationId = useMemo(() => Number(rawId.replace(/^APP-/i, '')), [rawId]);
  const [record, setRecord] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [holdReason, setHoldReason] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!Number.isInteger(applicationId) || applicationId <= 0) {
      setError('Invalid application ID.'); setLoading(false); return;
    }
    try {
      const response = await applicationApi.getById(applicationId);
      setRecord(response.data); setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load application.');
    } finally { setLoading(false); }
  }, [applicationId]);

  useEffect(() => { void load(); }, [load]);

  async function toggleHold() {
    if (!record) return;
    const held = Boolean(valueOf(record, 'IsHeldByAdmin', 'isHeldByAdmin') === true);
    if (!held && !holdReason.trim()) { setError('A hold reason is required.'); return; }
    setSaving(true);
    try {
      await adminApi.toggleHold(applicationId, !held, held ? undefined : holdReason.trim());
      await load(); setHoldReason('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update hold.');
    } finally { setSaving(false); }
  }

  if (loading) return <div className="flex min-h-80 items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (!record) return <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{error}</div>;
  const held = Boolean(valueOf(record, 'IsHeldByAdmin', 'isHeldByAdmin') === true);
  const status = String(valueOf(record, 'Status', 'status'));
  const docs = valueOf(record, 'documentChecklist') as Row[];
  const history = valueOf(record, 'statusHistory') as Row[];

  return <div className="space-y-5">
    {error && <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
    <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><div className="text-[10px] uppercase tracking-widest text-slate-400">Application #{applicationId}</div>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">{valueOf(record, 'StudentName', 'studentName')}</h1>
          <p className="mt-1 text-sm text-slate-500">{valueOf(record, 'ScholarshipName', 'scholarshipName')} · {valueOf(record, 'SponsorName', 'sponsorName')}</p>
        </div>
        <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700">{status}</span>
      </div>
      <div className="mt-5 border-t border-slate-100 pt-4">
        {!held && <textarea value={holdReason} onChange={(event) => setHoldReason(event.target.value)} maxLength={500}
          placeholder="Reason required to place this application on hold"
          className="mb-3 min-h-20 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-slate-400" />}
        {held && <p className="mb-3 text-sm text-amber-700">On hold: {valueOf(record, 'AdminHoldReason', 'adminHoldReason')}</p>}
        <button onClick={toggleHold} disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white disabled:opacity-50">
          {held ? <PlayCircle className="h-4 w-4" /> : <PauseCircle className="h-4 w-4" />}
          {saving ? 'Saving…' : held ? 'Release hold' : 'Place on hold'}
        </button>
      </div>
    </section>

    <EmergencyApprovalPanel applicationId={applicationId} status={status} held={held} onCompleted={load} />

    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <Snapshot data={valueOf(record, 'SubmittedSnapshot') as Row} />
      <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-400"><FileText className="h-4 w-4" />Documents</h2>
        <div className="mt-3 divide-y divide-slate-100">{Array.isArray(docs) && docs.length ? docs.map((doc) =>
          <a key={valueOf(doc, 'ChecklistID')} href={valueOf(doc, 'FileURL')} target="_blank" rel="noreferrer"
            className="flex items-center justify-between gap-3 py-3 text-sm hover:text-blue-700">
            <span>{valueOf(doc, 'DocumentType')}</span><span className="text-xs text-slate-500">{valueOf(doc, 'Status')}</span>
          </a>) : <p className="py-3 text-sm text-slate-500">No application documents.</p>}</div>
      </section>
    </div>

    <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-400"><History className="h-4 w-4" />Audit trail</h2>
      <div className="mt-3 divide-y divide-slate-100">{Array.isArray(history) && history.length ? history.map((item, index) =>
        <div key={`${valueOf(item, 'CreatedAt')}-${index}`} className="py-3 text-sm">
          <span className="font-medium text-slate-800">{valueOf(item, 'FromStatus')} → {valueOf(item, 'ToStatus')}</span>
          <span className="ml-2 text-xs text-slate-500">{valueOf(item, 'ActorName')} ({valueOf(item, 'ActorRole')}) · {new Date(valueOf(item, 'CreatedAt')).toLocaleString('en-IN')}</span>
          {valueOf(item, 'Reason') !== '—' && <p className="mt-1 text-xs text-slate-500">{valueOf(item, 'Reason')}</p>}
        </div>) : <p className="py-3 text-sm text-slate-500">No status history.</p>}</div>
    </section>
  </div>;
}
