"use client";

import { auditHistory } from "@/lib/mock-data";
import { CheckCircle2, RotateCcw, XCircle, Search } from "lucide-react";
import { useState } from "react";
import { TopNav } from "@/components/reviewer/TopNav";

const actionCfg = {
  Verified: { icon: CheckCircle2, cls: "text-success bg-success/10 border-success/30" },
  "Re-upload": { icon: RotateCcw, cls: "text-warn bg-warn/10 border-warn/30" },
  Rejected: { icon: XCircle, cls: "text-danger bg-danger/10 border-danger/30" },
} as const;

export default function HistoryPage() {
  const [q, setQ] = useState("");
  const rows = auditHistory.filter((r) => `${r.app} ${r.student} ${r.id}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="min-h-screen bg-bg text-fg pb-16">
      <TopNav />
      <main className="mx-auto max-w-[1600px] px-6 mt-8">
        <div className="space-y-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-primary">Audit Trail</div>
            <h1 className="mt-2 text-3xl font-display font-bold">My Audit History</h1>
            <p className="text-fg-muted mt-1 text-sm">Immutable log of every action you've taken. Each entry is signed to your user ID.</p>
          </div>

          <div className="glass overflow-hidden">
            <div className="p-4 border-b border-border flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search audit id, app id, student…"
                  className="w-full rounded-lg bg-surface border border-border pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary/60 placeholder:text-fg-subtle" />
              </div>
              <div className="ml-auto text-xs font-mono text-fg-subtle">{rows.length} entries</div>
            </div>
            <div className="overflow-x-auto content-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] font-mono uppercase tracking-wider text-fg-subtle border-b border-border">
                    <th className="py-3 px-5 font-medium">Audit ID</th>
                    <th className="py-3 px-5 font-medium">Application</th>
                    <th className="py-3 px-5 font-medium">Student</th>
                    <th className="py-3 px-5 font-medium">Action</th>
                    <th className="py-3 px-5 font-medium">Document</th>
                    <th className="py-3 px-5 font-medium">By</th>
                    <th className="py-3 px-5 font-medium">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const A = actionCfg[r.action as keyof typeof actionCfg];
                    return (
                      <tr key={r.id} className={`border-b border-border last:border-0 hover:bg-surface/40 ${i % 2 ? "bg-surface/20" : ""}`}>
                        <td className="py-3.5 px-5 font-mono text-primary">{r.id}</td>
                        <td className="py-3.5 px-5 font-mono text-fg-muted">{r.app}</td>
                        <td className="py-3.5 px-5">{r.student}</td>
                        <td className="py-3.5 px-5">
                          <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold ${A.cls}`}>
                            <A.icon className="w-3 h-3" /> {r.action}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-fg-muted">{r.doc}</td>
                        <td className="py-3.5 px-5 text-fg-muted">{r.by}</td>
                        <td className="py-3.5 px-5 font-mono text-xs text-fg-subtle">{r.at}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
