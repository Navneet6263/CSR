'use client';

import {
  AlertTriangle, Check, CheckCircle2, FileCheck2, LockKeyhole,
  RotateCcw, Scale, Send, ShieldCheck, ShieldX, X,
} from 'lucide-react';
import { useState } from 'react';
import type {
  ScreeningBGCheck, ScreeningDecisionRequest, ScreeningDocument, ScreeningReturnTarget,
} from '@/types/screening';

type Decision = 'Approve' | 'Reject';

interface Props {
  docsReady: boolean;
  backgroundReady: boolean;
  held: boolean;
  closed: boolean;
  saving: boolean;
  documents: ScreeningDocument[];
  checks: ScreeningBGCheck[];
  onSubmit: (request: ScreeningDecisionRequest) => Promise<void>;
}

const targets: Array<{ value: ScreeningReturnTarget; label: string; help: string; icon: typeof FileCheck2 }> = [
  { value: 'DocumentReviewer', label: 'Document reviewer', help: 'Reopen selected documents', icon: FileCheck2 },
  { value: 'BGCheckOfficer', label: 'Background checker', help: 'Reopen selected field checks', icon: RotateCcw },
  { value: 'CloseApplication', label: 'Close application', help: 'Final rejection to student', icon: ShieldX },
];

export function ScreeningDecisionPanel(props: Props) {
  const [decision, setDecision] = useState<Decision>('Approve');
  const [notes, setNotes] = useState('');
  const [returnTo, setReturnTo] = useState<ScreeningReturnTarget | ''>('');
  const [affected, setAffected] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const approveReady = props.docsReady && props.backgroundReady;
  const locked = props.held || props.closed;

  const chooseDecision = (value: Decision) => {
    setDecision(value); setConfirming(false); setError('');
    if (value === 'Approve') { setReturnTo(''); setAffected([]); }
  };
  const chooseTarget = (value: ScreeningReturnTarget) => {
    setReturnTo(value); setAffected([]); setConfirming(false); setError('');
  };
  const toggle = (value: string) => {
    setAffected((items) => items.includes(value) ? items.filter((item) => item !== value) : [...items, value]);
    setConfirming(false);
  };
  const prepare = () => {
    if (notes.trim().length < 5) return setError('Write a specific decision rationale of at least 5 characters.');
    if (decision === 'Approve' && !approveReady) return setError('Approval gates are incomplete. Resolve evidence exceptions first.');
    if (decision === 'Reject' && !returnTo) return setError('Choose who should receive this rejected case.');
    if (decision === 'Reject' && returnTo !== 'CloseApplication' && !affected.length) {
      return setError('Select at least one document or background check that needs correction.');
    }
    setError(''); setConfirming(true);
  };
  const submit = async () => {
    const request: ScreeningDecisionRequest = { decision, notes: notes.trim() };
    if (decision === 'Reject' && returnTo) {
      request.returnTo = returnTo;
      if (returnTo !== 'CloseApplication') request.affectedItems = affected;
    }
    try { await props.onSubmit(request); setConfirming(false); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Decision could not be recorded.'); }
  };

  return <aside className="glass-card p-5 xl:sticky xl:top-24">
    <p className="text-[10px] uppercase tracking-[0.25em] text-gold">Final control</p>
    <h2 className="mt-1 text-lg font-semibold text-text">Screening decision</h2>
    <p className="mt-1 text-[10px] leading-relaxed text-text-dim">Approve for sponsor review, return internal errors to the responsible officer, or close the application.</p>
    <div className="mt-4 space-y-2"><Gate ready={props.docsReady} label="All documents verified" /><Gate ready={props.backgroundReady} label="Three background checks passed" /><Gate ready={!props.held} label="No administrative hold" /></div>
    {locked ? <Locked held={props.held} /> : <>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <DecisionButton active={decision === 'Approve'} approve disabled={!approveReady} onClick={() => chooseDecision('Approve')} />
        <DecisionButton active={decision === 'Reject'} onClick={() => chooseDecision('Reject')} />
      </div>
      {decision === 'Reject' ? <ReturnControls returnTo={returnTo} affected={affected}
        documents={props.documents} checks={props.checks} onTarget={chooseTarget} onToggle={toggle} /> : null}
      <label className="mt-4 block text-[9px] font-semibold uppercase tracking-wider text-text-dim">Decision rationale
        <textarea value={notes} onChange={(event) => { setNotes(event.target.value); setConfirming(false); }} maxLength={1000} rows={5}
          placeholder="Reference the evidence, discrepancy and required correction…"
          className="mt-1.5 w-full resize-y rounded-lg border border-brand/10 bg-transparent p-3 text-xs font-medium normal-case tracking-normal text-text outline-none focus:border-brand/40" />
        <span className="mt-1 block text-right text-[8px] font-normal normal-case text-text-dim">{notes.length}/1000</span>
      </label>
      {error ? <p role="alert" className="mt-3 flex gap-1.5 rounded-lg bg-danger/10 p-2 text-[10px] font-semibold text-danger"><AlertTriangle size={12} className="shrink-0" />{error}</p> : null}
      {confirming ? <Confirm decision={decision} returnTo={returnTo} saving={props.saving} onReview={() => setConfirming(false)} onConfirm={submit} />
        : <button onClick={prepare} disabled={props.saving} className="screener-primary-action mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-xs font-semibold disabled:opacity-50"><Send size={13} />Review & confirm {decision}</button>}
    </>}
    <div className="mt-5 border-t border-border-soft pt-4"><p className="flex items-center gap-1.5 text-[9px] font-semibold text-text-muted"><ShieldCheck size={12} className="text-brand" />Independent maker-checker policy</p><p className="mt-1 text-[8px] leading-relaxed text-text-dim">Every return keeps the original evidence, reason, owner and complete audit history.</p></div>
  </aside>;
}

function ReturnControls({ returnTo, affected, documents, checks, onTarget, onToggle }: {
  returnTo: ScreeningReturnTarget | ''; affected: string[]; documents: ScreeningDocument[]; checks: ScreeningBGCheck[];
  onTarget: (value: ScreeningReturnTarget) => void; onToggle: (value: string) => void;
}) {
  const items = returnTo === 'DocumentReviewer'
    ? documents.map((item) => ({ id: String(item.ChecklistID), label: item.DocumentType }))
    : returnTo === 'BGCheckOfficer' ? checks.map((item) => ({ id: item.CheckType, label: item.CheckType === 'IncomeVerification' ? 'Income verification' : item.CheckType })) : [];
  return <div className="mt-4 rounded-lg border border-danger/30 bg-danger/10 p-3">
    <p className="text-[9px] font-semibold uppercase tracking-wider text-danger">Return destination</p>
    <div className="mt-2 grid gap-2">{targets.map((target) => { const Icon = target.icon; const active = returnTo === target.value; return <button key={target.value} type="button" onClick={() => onTarget(target.value)} className={`flex items-center gap-3 rounded-lg border p-2.5 text-left ${active ? 'border-danger bg-danger/10' : 'border-brand/10 bg-white/50'}`}><Icon size={14} className={active ? 'text-danger' : 'text-text-dim'} /><span><b className="block text-[10px] text-text">{target.label}</b><span className="block text-[8px] text-text-dim">{target.help}</span></span></button>; })}</div>
    {items.length ? <div className="mt-3"><p className="text-[9px] font-semibold text-text-muted">Select affected items</p><div className="mt-1.5 flex flex-wrap gap-1.5">{items.map((item) => <button type="button" key={item.id} onClick={() => onToggle(item.id)} className={`rounded-md border px-2 py-1 text-[9px] font-semibold ${affected.includes(item.id) ? 'border-danger bg-danger/10 text-danger' : 'border-brand/10 text-text-muted'}`}><span className="mr-1">{affected.includes(item.id) ? '✓' : '+'}</span>{item.label}</button>)}</div></div> : null}
  </div>;
}

function DecisionButton({ active, approve, disabled, onClick }: { active: boolean; approve?: boolean; disabled?: boolean; onClick: () => void }) { const Icon = approve ? CheckCircle2 : X; return <button onClick={onClick} disabled={disabled} className={`rounded-lg border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${active ? (approve ? 'border-success bg-success/10' : 'border-danger bg-danger/10') : 'border-brand/10'}`}><Icon className={`h-4 w-4 ${approve ? 'text-success' : 'text-danger'}`} /><b className="mt-2 block text-xs text-text">{approve ? 'Approve' : 'Reject / Return'}</b><span className="mt-0.5 block text-[9px] text-text-dim">{approve ? 'Forward to sponsor review' : 'Route correction or close'}</span></button>; }
function Gate({ ready, label }: { ready: boolean; label: string }) { return <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[10px] font-semibold ${ready ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>{ready ? <CheckCircle2 size={13} /> : <Scale size={13} />}{label}</div>; }
function Locked({ held }: { held: boolean }) { return <div className={`mt-4 flex gap-2 rounded-lg p-3 text-xs ${held ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}><LockKeyhole className="h-4 w-4 shrink-0" />{held ? 'Decision controls are locked while this case is on hold.' : 'This case is no longer in the screening queue and is read-only.'}</div>; }
function Confirm({ decision, returnTo, saving, onReview, onConfirm }: { decision: Decision; returnTo: ScreeningReturnTarget | ''; saving: boolean; onReview: () => void; onConfirm: () => Promise<void> }) { const destination = returnTo === 'DocumentReviewer' ? 'document review' : returnTo === 'BGCheckOfficer' ? 'background verification' : returnTo === 'CloseApplication' ? 'final closure' : 'sponsor review'; return <div className="mt-4 rounded-lg border border-gold/30 bg-gold/10 p-3"><p className="text-xs font-semibold text-text">Confirm {decision === 'Approve' ? 'approval' : destination}?</p><p className="mt-1 text-[9px] leading-relaxed text-text-muted">This action is audit logged. Internal returns preserve the note and assigned owner.</p><div className="mt-3 flex gap-2"><button onClick={onReview} className="rounded-md border border-brand/10 bg-white px-3 py-2 text-[10px] font-semibold text-text-muted">Review</button><button disabled={saving} onClick={() => void onConfirm()} className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-[10px] font-semibold text-white disabled:opacity-50 ${decision === 'Approve' ? 'bg-success' : 'bg-danger'}`}><Check size={12} />{saving ? 'Recording…' : 'Confirm action'}</button></div></div>; }
