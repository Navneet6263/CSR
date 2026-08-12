'use client';

import { useMemo, useState } from 'react';
import { Layers, Loader2, LockKeyhole, Pause, Play } from 'lucide-react';
import { adminApi } from '@/lib/api';

type Action = 'hold' | 'release';

export default function BulkActions() {
  const [rawIds, setRawIds] = useState(''); const [reason, setReason] = useState('');
  const [action, setAction] = useState<Action>('hold'); const [confirmed, setConfirmed] = useState(false);
  const [running, setRunning] = useState(false); const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const ids = useMemo(() => Array.from(new Set(rawIds.split(/[\s,]+/).map(Number)
    .filter((value) => Number.isInteger(value) && value > 0))).slice(0, 101), [rawIds]);
  const valid = ids.length > 0 && ids.length <= 100 && reason.trim().length >= 3 && confirmed;
  async function run() {
    if (!valid) return;
    setRunning(true); setError(''); setMessage('');
    try {
      const response = await adminApi.bulkHold(ids, action === 'hold', reason.trim());
      const result = response.data;
      setMessage(`${result?.changed ?? 0} changed, ${result?.unchanged ?? 0} already in requested state.`);
      setConfirmed(false);
    } catch (err) { setError(err instanceof Error ? err.message : 'Operation failed.'); }
    finally { setRunning(false); }
  }
  return <div className="space-y-5">
    <div><div className="text-[10px] uppercase tracking-widest text-slate-400">Operations</div>
      <h1 className="mt-1 text-xl font-semibold text-slate-900">Bulk Actions</h1>
      <p className="mt-0.5 text-sm text-slate-500">Atomically place up to 100 applications on hold or release them.</p></div>
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm lg:col-span-7">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3"><LockKeyhole className="h-3.5 w-3.5 text-slate-400"/>
          <span className="text-[10px] uppercase tracking-widest text-slate-500">Application selection</span>
          <span className="ml-auto text-xs text-slate-500">{ids.length} valid IDs</span></div>
        <div className="space-y-4 p-5"><label className="block text-xs font-medium text-slate-600">Application IDs
          <textarea value={rawIds} onChange={(event) => setRawIds(event.target.value)} rows={6} placeholder="101, 102, 103"
            className="mt-2 w-full rounded-lg border border-slate-200 p-3 font-mono text-sm outline-none focus:border-slate-400"/></label>
          {ids.length > 100 && <p className="text-xs text-rose-600">Maximum 100 unique application IDs per operation.</p>}
          <label className="block text-xs font-medium text-slate-600">Reason
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3}
              className="mt-2 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-slate-400" placeholder="Required for the audit trail"/></label></div>
      </div>
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm lg:col-span-5">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3"><Layers className="h-3.5 w-3.5 text-slate-400"/>
          <span className="text-[10px] uppercase tracking-widest text-slate-500">Pick an action</span></div>
        <div className="grid grid-cols-2 gap-2 p-5">{[
          { id: 'hold' as const, label: 'Place on Hold', icon: Pause }, { id: 'release' as const, label: 'Release Hold', icon: Play },
        ].map((item) => { const Icon = item.icon; const active = action === item.id; return <button key={item.id} onClick={() => { setAction(item.id); setConfirmed(false); }}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium ${active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700'}`}>
          <Icon className="h-3.5 w-3.5"/>{item.label}</button>; })}</div>
        <div className="space-y-3 border-t border-slate-100 px-5 py-4"><label className="flex items-start gap-2 text-xs text-slate-600">
          <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300"/>
          I confirm this audited operation will affect {ids.length} selected applications.</label>
          <button onClick={run} disabled={!valid || running} className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40">
            {running && <Loader2 className="h-4 w-4 animate-spin"/>} Run Bulk Action</button>
          {message && <p className="text-xs text-emerald-700">{message}</p>}{error && <p className="text-xs text-rose-700">{error}</p>}</div>
      </div>
    </div>
  </div>;
}
