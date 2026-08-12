'use client';

import { useState } from 'react';
import { Calendar, Download, FileText, Loader2, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adminApi } from '@/lib/api';
import { saveBlob } from '@/lib/download';

type ReportType = 'sla' | 'funnel' | 'diversity' | 'disbursement' | 'audit';
const reports = [
  { type: 'sla' as const, title: 'SLA Report', description: 'Live stage age and SLA compliance', icon: Calendar, color: '#5b2c6f' },
  { type: 'funnel' as const, title: 'Funnel Report', description: 'Application counts by workflow status', icon: TrendingUp, color: '#2e86c1' },
  { type: 'diversity' as const, title: 'Diversity Coverage', description: 'Aggregated state and category coverage', icon: Users, color: '#0e6251' },
  { type: 'disbursement' as const, title: 'Disbursement Report', description: 'Payment status and reconciliation data', icon: FileText, color: '#f39c12' },
  { type: 'audit' as const, title: 'Audit Export', description: 'Latest 10,000 compliance audit events', icon: ShieldCheck, color: '#c0392b' },
];

export default function ReportsPage() {
  const [downloading, setDownloading] = useState<ReportType | null>(null); const [error, setError] = useState('');
  async function download(type: ReportType) {
    setDownloading(type); setError('');
    try { const file = await adminApi.downloadReport(type); saveBlob(file.blob, file.filename); }
    catch (err) { setError(err instanceof Error ? err.message : 'Report download failed.'); }
    finally { setDownloading(null); }
  }
  return <div className="mx-auto max-w-6xl space-y-6 p-4">
    <div className="flex items-center gap-3"><div className="rounded-xl bg-[#5b2c6f]/10 p-3"><FileText className="h-6 w-6 text-[#5b2c6f]"/></div>
      <div><h1 className="text-2xl font-bold text-gray-800 md:text-3xl">Reports & Exports</h1>
        <p className="mt-1 text-sm text-gray-500">Generate current, server-verified CSV reports</p></div></div>
    {error && <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">{reports.map((report) => { const Icon = report.icon; const busy = downloading === report.type;
      return <div key={report.type} className="clay-card border-l-4 p-6" style={{ borderColor: report.color }}><div className="flex items-start gap-4">
        <div className="rounded-xl p-3" style={{ backgroundColor: `${report.color}15` }}><Icon className="h-6 w-6" style={{ color: report.color }}/></div>
        <div className="flex-1"><h3 className="text-lg font-bold text-gray-800">{report.title}</h3><p className="mt-1 text-sm text-gray-600">{report.description}</p>
          <Button onClick={() => download(report.type)} disabled={downloading !== null} className="mt-4 h-10 w-full text-sm font-medium" style={{ backgroundColor: report.color }}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin"/> : <><Download className="mr-2 h-4 w-4"/>Download CSV</>}</Button></div></div></div>; })}</div>
    <div className="clay-card border border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50 p-6"><div className="flex items-start gap-3">
      <div className="rounded-lg bg-white p-2"><ShieldCheck className="h-5 w-5 text-[#5b2c6f]"/></div><div><h3 className="font-semibold text-gray-800">Audited exports</h3>
        <p className="mt-1 text-sm text-gray-600">Every export records the administrator, report type, request ID, timestamp and exported row count.</p></div></div></div>
  </div>;
}
