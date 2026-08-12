'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowUpRight, Filter, RotateCcw, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ReviewApplicationRow } from '@/types/domain';

export function QueueTable({ applications }: { applications: ReviewApplicationRow[] }) {
  const scholarships = useMemo(() => ['All Scholarships', ...Array.from(
    new Set(applications.map((item) => item.scholarshipName).filter(Boolean)),
  )], [applications]);
  const [scholarship, setScholarship] = useState('All Scholarships');
  const [query, setQuery] = useState('');
  const rows = useMemo(() => applications.filter((application) => {
    if (scholarship !== 'All Scholarships' && application.scholarshipName !== scholarship) return false;
    const search = query.trim().toLowerCase();
    return !search || `${application.applicationId} ${application.studentName}`.toLowerCase().includes(search);
  }), [applications, scholarship, query]);

  return (
    <div className="glass overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-5">
        <div>
          <h3 className="font-display text-lg font-semibold">Audit Queue</h3>
          <p className="mt-0.5 text-xs text-fg-subtle">Applications awaiting document verification</p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ID or name..."
              className="w-56 rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm placeholder:text-fg-subtle focus:border-primary/60 focus:outline-none" />
          </div>
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fg-subtle" />
            <select value={scholarship} onChange={(event) => setScholarship(event.target.value)}
              className="cursor-pointer appearance-none rounded-lg border border-border bg-surface py-2 pl-9 pr-8 text-sm focus:border-primary/60 focus:outline-none">
              {scholarships.map((item) => <option key={item} className="bg-bg-elev">{item}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto content-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left text-[11px] font-mono uppercase tracking-wider text-fg-subtle">
            <th className="px-5 py-3 font-medium">Application ID</th><th className="px-5 py-3 font-medium">Student</th>
            <th className="px-5 py-3 font-medium">Scholarship</th><th className="px-5 py-3 font-medium">SLA age</th>
            <th className="px-5 py-3 text-right font-medium">Action</th>
          </tr></thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.applicationId} className={`border-b border-border last:border-0 hover:bg-surface/40 ${index % 2 ? 'bg-surface/20' : ''}`}>
                <td className="px-5 py-3.5 font-mono text-primary">APP-{row.applicationId}</td>
                <td className="px-5 py-3.5"><div className="font-medium">{row.studentName}</div>
                  <div className="text-xs text-fg-subtle">{row.studentEmail ?? '—'}</div></td>
                <td className="px-5 py-3.5 text-fg-muted"><span>{row.scholarshipName}</span>{row.returnReason ? <span className="mt-1 flex max-w-xs items-center gap-1 truncate text-[10px] font-semibold text-amber-700" title={row.returnReason}><RotateCcw size={10} />Returned: {row.returnReason}</span> : null}</td>
                <td className="px-5 py-3.5">{(() => { const hours = row.stageEnteredAt
                  ? Math.max(0, Math.floor((Date.now() - new Date(row.stageEnteredAt).getTime()) / 3_600_000)) : 0;
                  return <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[10px] ${hours >= 48
                    ? 'bg-danger/10 text-danger' : 'bg-surface text-fg-muted'}`}>{hours >= 48 ? <AlertTriangle size={10} /> : null}{hours}h</span>; })()}</td>
                <td className="px-5 py-3.5 text-right"><Link href={`/reviewer/audit/${row.applicationId}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/25">
                  Review <ArrowUpRight className="h-3 w-3" />
                </Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
