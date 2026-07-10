"use client";

import Link from "next/link";
import { ArrowUpRight, IndianRupee } from "lucide-react";
import type { Application } from "@/lib/screening-data";

interface Props { rows: Application[]; }

export const fmtINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

function ScoreBar({ score }: { score: number }) {
  const tone = score >= 85 ? "bg-success" : score >= 70 ? "bg-gold" : "bg-danger";
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative h-1.5 w-24 overflow-hidden rounded-full bg-brand/8">
        <div className={`h-full ${tone}`} style={{ width: `${score}%` }} />
      </div>
      <span className="font-mono text-xs font-semibold">{score}</span>
    </div>
  );
}

export function QueueTable({ rows }: Props) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ contentVisibility: "auto" }}>
          <thead>
            <tr className="border-b border-brand/5 text-left text-[11px] uppercase tracking-wider text-text-dim">
              <th className="px-5 py-3.5 font-medium">Application</th>
              <th className="px-5 py-3.5 font-medium">Student</th>
              <th className="px-5 py-3.5 font-medium">Scholarship</th>
              <th className="px-5 py-3.5 font-medium">Merit Score</th>
              <th className="px-5 py-3.5 font-medium">Annual Income</th>
              <th className="px-5 py-3.5 font-medium">12th %</th>
              <th className="px-5 py-3.5 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id}
                className={`border-b border-brand/5 transition hover:bg-brand/[0.03] ${i === rows.length - 1 ? "border-b-0" : ""}`}>
                <td className="px-5 py-4">
                  <div className="font-mono text-xs text-text-muted">{r.id}</div>
                  <div className="text-[10px] uppercase tracking-wider text-text-dim">{r.submittedAt}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand/40 to-brand-2/20 text-xs font-semibold">
                      {r.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <div className="font-medium text-text">{r.name}</div>
                      <div className="text-xs text-text-dim">{r.category} · {r.city}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-text-muted">{r.scholarship}</td>
                <td className="px-5 py-4"><ScoreBar score={r.meritScore} /></td>
                <td className="px-5 py-4">
                  <div className="inline-flex items-center gap-1 font-mono text-sm text-text">
                    <IndianRupee className="h-3 w-3 text-text-dim" />
                    {new Intl.NumberFormat("en-IN").format(r.income)}
                  </div>
                </td>
                <td className="px-5 py-4 font-mono text-text">{r.marks12}%</td>
                <td className="px-5 py-4 text-right">
                  <Link href={`/screener/evaluate/${r.id}`}
                    className="inline-flex items-center gap-1.5 rounded-md border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold transition hover:bg-gold/20">
                    Review <ArrowUpRight className="h-3.5 w-3.5" />
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
