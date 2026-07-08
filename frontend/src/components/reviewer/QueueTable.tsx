"use client";
import Link from "next/link";
import { Search, Filter, ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import { applications, scholarships } from "@/lib/mock-data";

const docTypes = ["All Documents", "Aadhaar", "Income Cert.", "Marksheets", "Bank"];

export function QueueTable() {
  const [scholarship, setScholarship] = useState(scholarships[0]);
  const [docType, setDocType] = useState(docTypes[0]);
  const [q, setQ] = useState("");

  const rows = useMemo(() => applications.filter((a) => {
    if (scholarship !== "All Scholarships" && a.scholarship !== scholarship) return false;
    if (q && !(`${a.id} ${a.student.fullName}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  }), [scholarship, q]);

  return (
    <div className="glass overflow-hidden">
      <div className="p-5 border-b border-border flex flex-wrap items-center gap-3">
        <div>
          <h3 className="font-display font-semibold text-lg">Audit Queue</h3>
          <p className="text-xs text-fg-subtle mt-0.5">Applications with status <span className="text-primary font-mono">DocAuditInProgress</span></p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ID or name…"
              className="w-56 rounded-lg bg-surface border border-border pl-9 pr-3 py-2 text-sm placeholder:text-fg-subtle focus:outline-none focus:border-primary/60" />
          </div>
          <SelectPill icon={Filter} value={scholarship} onChange={setScholarship} options={scholarships} />
          <SelectPill icon={Filter} value={docType} onChange={setDocType} options={docTypes} />
        </div>
      </div>
      <div className="overflow-x-auto content-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] font-mono uppercase tracking-wider text-fg-subtle border-b border-border">
              <th className="py-3 px-5 font-medium">Application ID</th>
              <th className="py-3 px-5 font-medium">Student</th>
              <th className="py-3 px-5 font-medium">Scholarship</th>
              <th className="py-3 px-5 font-medium">Submitted</th>
              <th className="py-3 px-5 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className={`border-b border-border last:border-0 hover:bg-surface/40 transition ${i % 2 ? "bg-surface/20" : ""}`}>
                <td className="py-3.5 px-5 font-mono text-primary">{r.id}</td>
                <td className="py-3.5 px-5">
                  <div className="font-medium">{r.student.fullName}</div>
                  <div className="text-xs text-fg-subtle">{r.student.id} · {r.student.category}</div>
                </td>
                <td className="py-3.5 px-5 text-fg-muted">{r.scholarship}</td>
                <td className="py-3.5 px-5 text-fg-muted font-mono text-xs">{r.submitted}</td>
                <td className="py-3.5 px-5 text-right">
                  <Link href={`/reviewer/applications/${r.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary/15 border border-primary/40 text-primary px-3 py-1.5 text-xs font-semibold hover:bg-primary/25 transition">
                    Review <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SelectPill({ icon: Icon, value, onChange, options }: { icon: React.ComponentType<{ className?: string }>; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="relative">
      <Icon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle pointer-events-none" />
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-lg bg-surface border border-border pl-9 pr-8 py-2 text-sm focus:outline-none focus:border-primary/60 cursor-pointer">
        {options.map((o) => <option key={o} className="bg-bg-elev">{o}</option>)}
      </select>
    </div>
  );
}
