'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Download, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { saveBlob } from '@/lib/download';

type SlaRow = { key: string; stage: string; thresholdHours: number; total: number; averageHours: number;
  worstHours: number; onTrack: number; atRisk: number; breached: number };

function duration(hours: number) {
  if (hours < 24) return `${hours.toFixed(1)}h`;
  return `${Math.floor(hours / 24)}d ${Math.round(hours % 24)}h`;
}

export default function SLAReport() {
  const [rows, setRows] = useState<SlaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  useEffect(() => { adminApi.getSlaAnalytics().then((res) => setRows((res.data ?? []) as SlaRow[]))
    .catch((err) => setError(err.message)).finally(() => setLoading(false)); }, []);
  const totalBreached = rows.reduce((sum, row) => sum + row.breached, 0);
  async function download() {
    setExporting(true); setError('');
    try { const file = await adminApi.downloadReport('sla'); saveBlob(file.blob, file.filename); }
    catch (err) { setError(err instanceof Error ? err.message : 'Export failed.'); }
    finally { setExporting(false); }
  }
  return <div className="space-y-5">
    <div className="flex items-end justify-between"><div><div className="text-[10px] uppercase tracking-widest text-slate-400">Analytics</div>
      <h1 className="mt-1 text-xl font-semibold text-slate-900">SLA Report</h1>
      <p className="mt-0.5 text-sm text-slate-500">Live stage aging and SLA breach tracking.</p></div>
      <button onClick={download} disabled={exporting} className="inline-flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-xs font-medium text-slate-600 disabled:opacity-50">
        {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} Export CSV</button></div>
    {error && <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
    {!loading && totalBreached > 0 && <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/50 p-4">
      <AlertTriangle className="mt-0.5 h-4 w-4 text-rose-600"/><div className="text-sm text-rose-800"><span className="font-semibold">{totalBreached} applications</span> have breached their current-stage SLA.</div></div>}
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
      {loading ? <div className="grid h-40 place-items-center"><Loader2 className="h-5 w-5 animate-spin text-slate-400"/></div> :
      <table className="w-full text-sm"><thead className="bg-slate-50/60 text-[10px] uppercase tracking-widest text-slate-500"><tr>
        {['Stage','Avg. Age','Worst Age','On Track','At Risk','Breached'].map((label) => <th key={label} className="px-5 py-3 text-left font-medium">{label}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100">{rows.map((row) => <tr key={row.key} className={row.breached ? 'bg-rose-50/30' : ''}>
          <td className="px-5 py-3 font-medium text-slate-900">{row.stage}<div className="text-[10px] font-normal text-slate-400">{row.thresholdHours}h SLA</div></td>
          <td className="px-5 py-3 tabular-nums text-slate-600">{duration(row.averageHours)}</td><td className="px-5 py-3 tabular-nums text-slate-600">{duration(row.worstHours)}</td>
          <td className="px-5 py-3 tabular-nums text-emerald-700">{row.onTrack}</td><td className="px-5 py-3 tabular-nums text-amber-700">{row.atRisk}</td>
          <td className="px-5 py-3 font-semibold tabular-nums text-rose-700">{row.breached}</td></tr>)}</tbody></table>}
    </div>
  </div>;
}
