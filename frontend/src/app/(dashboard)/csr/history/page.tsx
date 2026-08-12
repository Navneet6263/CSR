'use client';

import { useEffect, useState } from 'react';
import { screeningApi } from '@/lib/api';

export default function HistoryPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]); const [error, setError] = useState('');
  useEffect(() => { screeningApi.getCSRHistory().then((response) => setRows(response.data ?? [])).catch((reason: Error) => setError(reason.message)); }, []);
  return <div className="space-y-6"><div><h1 className="text-3xl font-bold">Funding Decision History</h1><p className="text-sm text-slate-500">Sponsor-scoped approval and payment outcomes.</p></div>
    {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    <div className="overflow-hidden rounded-2xl border bg-white"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-4">Application</th><th className="p-4">Student</th><th className="p-4">Scholarship</th><th className="p-4">Status</th><th className="p-4 text-right">Amount</th><th className="p-4">Updated</th></tr></thead>
      <tbody className="divide-y">{rows.map((row) => <tr key={String(row.ApplicationID)}><td className="p-4 font-mono">APP-{String(row.ApplicationID)}</td><td className="p-4 font-semibold">{String(row.StudentName)}</td><td className="p-4">{String(row.ScholarshipName)}</td><td className="p-4">{String(row.Status)}</td><td className="p-4 text-right font-bold">₹{Number(row.ScholarshipAmount ?? 0).toLocaleString('en-IN')}</td><td className="p-4">{new Date(String(row.UpdatedAt)).toLocaleDateString('en-IN')}</td></tr>)}
        {!rows.length && <tr><td colSpan={6} className="p-10 text-center text-slate-400">No funding decisions yet.</td></tr>}</tbody></table></div>
  </div>;
}
