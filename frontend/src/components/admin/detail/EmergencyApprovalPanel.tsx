'use client';

import { AlertTriangle, CheckCircle2, ShieldAlert, X } from 'lucide-react';
import { useState } from 'react';
import { adminApi } from '@/lib/api/admin';

const targets: Record<string, { status: string; label: string }> = {
  Submitted: { status: 'DocAuditComplete', label: 'Approve document stage' },
  AutoMatched: { status: 'DocAuditComplete', label: 'Approve document stage' },
  DocAuditInProgress: { status: 'DocAuditComplete', label: 'Approve document stage' },
  DocAuditComplete: { status: 'BGCheckComplete', label: 'Approve background stage' },
  BGCheckInProgress: { status: 'BGCheckComplete', label: 'Approve background stage' },
  BGCheckComplete: { status: 'ScreeningApproved', label: 'Approve screening stage' },
  ScreeningPending: { status: 'ScreeningApproved', label: 'Approve screening stage' },
  ScreeningApproved: { status: 'CSRApproved', label: 'Approve sponsor stage' },
  CSRPending: { status: 'CSRApproved', label: 'Approve sponsor stage' },
};

export default function EmergencyApprovalPanel({ applicationId, status, held, onCompleted }: {
  applicationId: number; status: string; held: boolean; onCompleted: () => Promise<void>;
}) {
  const target = targets[status];
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  if (!target) return null;
  const expected = `APP-${applicationId}`;
  const ready = reason.trim().length >= 20 && confirmation.trim().toUpperCase() === expected && !held;

  async function approve() {
    if (!ready) return;
    setSaving(true); setError(''); setSuccess('');
    try {
      const response = await adminApi.emergencyApprove(applicationId, reason.trim(), confirmation.trim(), status);
      setSuccess(`${status} → ${String(response.data?.status ?? target.status)} recorded.`);
      setReason(''); setConfirmation(''); setOpen(false); await onCompleted();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Emergency approval could not be recorded.');
    } finally { setSaving(false); }
  }

  return <section className="rounded-xl border border-rose-200 bg-rose-50/40 p-5 shadow-sm">
    <div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-rose-100 text-rose-700"><ShieldAlert size={18} /></span><div className="min-w-0 flex-1"><p className="text-[10px] font-semibold uppercase tracking-widest text-rose-700">Emergency admin control</p><h2 className="mt-1 text-sm font-semibold text-slate-900">{target.label}</h2><p className="mt-1 text-xs leading-relaxed text-slate-600">Advances only this stage to <b>{target.status}</b>. Evidence is not rewritten and Finance Maker–Checker cannot be bypassed.</p></div>
      {open ? <button onClick={() => setOpen(false)} className="rounded-md p-1 text-slate-400 hover:bg-white"><X size={16} /></button> : null}</div>
    {held ? <p className="mt-4 flex items-center gap-2 rounded-lg bg-amber-100 p-3 text-xs font-medium text-amber-800"><AlertTriangle size={14} />Release the administrative hold before using an override.</p> : null}
    {error ? <p role="alert" className="mt-4 rounded-lg bg-rose-100 p-3 text-xs font-medium text-rose-800">{error}</p> : null}
    {success ? <p role="status" className="mt-4 rounded-lg bg-emerald-100 p-3 text-xs font-medium text-emerald-800">{success}</p> : null}
    {!open ? <button disabled={held} onClick={() => setOpen(true)} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-rose-300 bg-white px-4 py-2 text-xs font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"><ShieldAlert size={14} />Open emergency approval</button> : <div className="mt-4 space-y-3 border-t border-rose-200 pt-4">
      <label className="block text-xs font-medium text-slate-700">Detailed emergency reason
        <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={4} maxLength={1000} placeholder="Explain why the normal officer workflow cannot be used and cite the evidence reviewed…" className="mt-1.5 w-full resize-y rounded-lg border border-rose-200 bg-white p-3 text-sm outline-none focus:border-rose-400" />
        <span className="mt-1 block text-right text-[10px] text-slate-500">Minimum 20 characters · {reason.length}/1000</span>
      </label>
      <label className="block text-xs font-medium text-slate-700">Type <b>{expected}</b> to confirm
        <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" placeholder={expected} className="mt-1.5 w-full rounded-lg border border-rose-200 bg-white px-3 py-2.5 font-mono text-sm uppercase outline-none focus:border-rose-400" />
      </label>
      <div className="rounded-lg border border-rose-200 bg-white p-3 text-[11px] leading-relaxed text-rose-700"><b>Permanent audit:</b> your admin ID, name, reason, previous/new status, timestamp, request ID and IP address will be recorded.</div>
      <button disabled={!ready || saving} onClick={() => void approve()} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-rose-700 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"><CheckCircle2 size={16} />{saving ? 'Recording signed override…' : `Confirm ${target.label}`}</button>
    </div>}
  </section>;
}
