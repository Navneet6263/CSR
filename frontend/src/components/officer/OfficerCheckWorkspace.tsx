'use client';

import { AlertTriangle, Check, CheckCircle2, CircleDashed, LockKeyhole, Send, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { BGCheckPayload, BGCheckResult } from '@/types/domain';
import type { OfficerCheck } from '@/types/officer';

type CheckType = 'Identity' | 'Address' | 'IncomeVerification';
type Result = Exclude<BGCheckResult, 'Pending'>;
const definitions: Array<{ type: CheckType; title: string; help: string }> = [
  { type: 'Identity', title: 'Identity', help: 'Aadhaar, DOB and household identity' },
  { type: 'Address', title: 'Address', help: 'Declared residence and locality' },
  { type: 'IncomeVerification', title: 'Income', help: 'Income source and family declaration' },
];

export function OfficerCheckWorkspace({ checks, held, closed, saving, onSubmit }: {
  checks: OfficerCheck[]; held: boolean; closed: boolean; saving: boolean;
  onSubmit: (payload: BGCheckPayload) => Promise<void>;
}) {
  const firstOpen = definitions.find((item) => !checks.some((check) => check.type === item.type && check.result === 'Pass'))?.type ?? 'Identity';
  const [type, setType] = useState<CheckType>(firstOpen); const [result, setResult] = useState<Result>('Pass');
  const [notes, setNotes] = useState(''); const [evidenceUrl, setEvidenceUrl] = useState('');
  const [error, setError] = useState(''); const [confirming, setConfirming] = useState(false);
  const existing = useMemo(() => checks.find((check) => check.type === type), [checks, type]);
  const locked = existing?.result === 'Pass' || held || closed;

  useEffect(() => { setResult(existing?.result === 'Inconclusive' ? 'Pass' : existing?.result ?? 'Pass');
    setNotes(existing?.notes ?? ''); setEvidenceUrl(existing?.evidenceUrl ?? ''); setError(''); setConfirming(false); }, [existing, type]);

  const prepare = () => {
    if (result !== 'Pass' && notes.trim().length < 5) return setError('Write at least 5 characters explaining a failed or inconclusive result.');
    if (evidenceUrl && !/^https?:\/\//i.test(evidenceUrl)) return setError('Evidence reference must be a valid http(s) URL.');
    setError(''); setConfirming(true);
  };
  const submit = async () => {
    try {
      await onSubmit({ checkType: type, result, notes: notes.trim() || undefined, evidenceUrl: evidenceUrl.trim() || undefined });
      setConfirming(false);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'The check could not be recorded.'); }
  };

  return <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
    <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-700">Officer decision</p><h2 className="mt-1 text-base font-bold text-slate-900">Required field checks</h2><p className="mt-1 text-[11px] text-slate-500">Select a check, review the evidence and record one defensible result.</p></div>
    <div className="mt-4 grid gap-2 sm:grid-cols-3">{definitions.map((item) => {
      const recorded = checks.find((check) => check.type === item.type); const active = type === item.type;
      return <button type="button" key={item.type} onClick={() => setType(item.type)} className={`rounded-xl border p-3 text-left transition ${active ? 'border-cyan-500 bg-cyan-50 ring-1 ring-cyan-100' : 'border-slate-200 hover:border-cyan-200'}`}>
        <div className="flex items-center justify-between gap-2"><span className="text-xs font-bold text-slate-800">{item.title}</span><ResultIcon result={recorded?.result} /></div><p className="mt-1 text-[9px] leading-relaxed text-slate-500">{item.help}</p><p className={`mt-2 text-[9px] font-bold ${recorded?.result === 'Pass' ? 'text-emerald-600' : recorded ? 'text-amber-600' : 'text-slate-400'}`}>{recorded?.result ?? 'Pending'}</p>
      </button>;
    })}</div>

    {held || closed ? <div className={`mt-4 flex gap-2 rounded-xl p-3 text-xs ${held ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}><LockKeyhole className="h-4 w-4 shrink-0" />{held ? 'This case is on administrative hold. Recording is disabled.' : 'Background verification is complete. Results are now read-only.'}</div> : null}
    <div className="mt-4 grid gap-4 lg:grid-cols-[220px_1fr]">
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Result<select value={result} disabled={locked} onChange={(event) => { setResult(event.target.value as Result); setConfirming(false); }} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold normal-case tracking-normal outline-none focus:border-cyan-400 disabled:bg-slate-50">
        <option value="Pass">Pass</option><option value="Fail">Fail</option><option value="Inconclusive">Inconclusive</option></select></label>
      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Evidence URL <span className="font-normal normal-case text-slate-400">(optional)</span><input type="url" value={evidenceUrl} disabled={locked} onChange={(event) => { setEvidenceUrl(event.target.value); setConfirming(false); }} placeholder="https://secure-evidence.example/reference" className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-xs font-medium normal-case tracking-normal outline-none focus:border-cyan-400 disabled:bg-slate-50" /></label>
    </div>
    <label className="mt-4 block text-[10px] font-bold uppercase tracking-wider text-slate-500">Field notes<textarea value={notes} disabled={locked} onChange={(event) => { setNotes(event.target.value); setConfirming(false); }} maxLength={2000} rows={4} placeholder="Record what was checked, source consulted and any discrepancy observed…" className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 p-3 text-xs font-medium leading-relaxed normal-case tracking-normal outline-none focus:border-cyan-400 disabled:bg-slate-50" /><span className="mt-1 block text-right text-[9px] font-normal normal-case text-slate-400">{notes.length}/2000</span></label>
    {error ? <p role="alert" className="mt-3 flex items-center gap-2 rounded-lg bg-rose-50 p-2 text-xs font-medium text-rose-700"><AlertTriangle size={13} />{error}</p> : null}

    {confirming ? <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3"><p className="text-xs font-bold text-amber-900">Confirm {result} for {label(type)}?</p><p className="mt-1 text-[10px] text-amber-700">Passed checks become read-only. The final required result automatically advances the workflow.</p><div className="mt-3 flex gap-2"><button onClick={() => setConfirming(false)} className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-bold text-amber-800"><X size={13} />Review</button><button disabled={saving} onClick={() => void submit()} className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"><Check size={13} />{saving ? 'Recording…' : 'Confirm result'}</button></div></div>
      : <button type="button" disabled={locked || saving} onClick={prepare} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 px-4 py-3 text-xs font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"><Send size={14} />{existing?.result === 'Pass' ? 'Passed check locked' : existing ? `Update ${label(type)} check` : `Record ${label(type)} check`}</button>}
  </section>;
}

function ResultIcon({ result }: { result?: OfficerCheck['result'] }) {
  if (result === 'Pass') return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (result) return <AlertTriangle className={`h-4 w-4 ${result === 'Fail' ? 'text-rose-500' : 'text-amber-500'}`} />;
  return <CircleDashed className="h-4 w-4 text-slate-300" />;
}
function label(type: CheckType) { return type === 'IncomeVerification' ? 'Income verification' : type; }
