"use client";

import Link from "next/link";
import { CheckCircle2, XCircle, History } from "lucide-react";
import { DECISIONS_HISTORY } from "@/lib/screening-data";
import { ScreenerHeader } from "@/components/screener/ScreenerHeader";

export default function HistoryPage() {
  const approved = DECISIONS_HISTORY.filter((d) => d.decision === "Approved").length;
  const rejected = DECISIONS_HISTORY.length - approved;

  return (
    <div className="screener-theme flex flex-col min-h-screen" style={{ background: "radial-gradient(1200px 800px at 10% -10%, oklch(0.92 0.08 350 / 0.55), transparent 60%), radial-gradient(900px 700px at 100% 0%, oklch(0.9 0.1 340 / 0.35), transparent 55%), oklch(0.99 0.008 350)" }}>
      <ScreenerHeader />
      <main className="mx-auto w-full max-w-[1400px] px-6 py-8 space-y-8">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold">
            <History className="h-3.5 w-3.5" /> Audit Trail
          </div>
          <h1 className="mt-2 text-3xl font-semibold text-text">My Decisions History</h1>
          <p className="mt-1 text-sm text-text-muted">
            {DECISIONS_HISTORY.length} decisions · {approved} approved · {rejected} rejected
          </p>
        </div>

        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm" style={{ contentVisibility: "auto" }}>
            <thead>
              <tr className="border-b border-brand/5 text-left text-[11px] uppercase tracking-wider text-text-dim">
                <th className="px-5 py-3.5 font-medium">Date</th>
                <th className="px-5 py-3.5 font-medium">Application</th>
                <th className="px-5 py-3.5 font-medium">Student</th>
                <th className="px-5 py-3.5 font-medium">Score</th>
                <th className="px-5 py-3.5 font-medium">Decision</th>
                <th className="px-5 py-3.5 font-medium">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {DECISIONS_HISTORY.map((d) => (
                <tr key={d.id} className="border-b border-brand/5 last:border-b-0 hover:bg-brand/[0.03]">
                  <td className="px-5 py-4 font-mono text-xs text-text-muted">{d.date}</td>
                  <td className="px-5 py-4 font-mono text-xs text-text">{d.id}</td>
                  <td className="px-5 py-4 font-medium text-text">{d.name}</td>
                  <td className="px-5 py-4 font-mono text-text">{d.score}</td>
                  <td className="px-5 py-4">
                    {d.decision === "Approved" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">
                        <CheckCircle2 className="h-3 w-3" /> Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/15 px-2.5 py-0.5 text-xs font-semibold text-danger">
                        <XCircle className="h-3 w-3" /> Rejected
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 max-w-md text-xs text-text-muted">{d.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
