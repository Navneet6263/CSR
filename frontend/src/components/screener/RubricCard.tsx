import { Scale, TrendingUp } from "lucide-react";
import type { Application } from "@/lib/screening-data";
import { fmtINR } from "./QueueTable";

export function RubricCard({ app }: { app: Application }) {
  const passMarks = app.marks12 >= app.cutoff.minMarks12;
  const passIncome = app.income <= app.cutoff.maxIncome;

  return (
    <div className="glass-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <Scale className="h-4 w-4 text-gold" />
        <h3 className="text-base font-semibold text-text">Rubric · {app.scholarship}</h3>
      </div>
      <div className="space-y-3 text-xs">
        <RubricRow label={`12th Marks ≥ ${app.cutoff.minMarks12}%`} value={`${app.marks12}%`} pass={passMarks} />
        <RubricRow label={`Annual Income < ${fmtINR(app.cutoff.maxIncome)}`} value={fmtINR(app.income)} pass={passIncome} />
        <RubricRow label="Documents Verified" value={`${app.documents.length}/9`} pass />
        <RubricRow label="Field Check Cleared" value="All 3 items" pass />
      </div>
    </div>
  );
}

function RubricRow({ label, value, pass }: { label: string; value: string; pass: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-brand/[0.03] px-3 py-2.5">
      <span className="text-text-muted">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm text-text">{value}</span>
        <span className={`h-2 w-2 rounded-full ${pass ? "bg-success" : "bg-danger"}`} />
      </div>
    </div>
  );
}

export function ScoreDial({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 44;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="glass-card relative flex flex-col items-center overflow-hidden p-6 text-center">
      <div className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-gold">
        <TrendingUp className="h-3 w-3" /> Auto Merit Score
      </div>
      <div className="relative">
        <svg width="120" height="120" viewBox="0 0 100 100" className="-rotate-90">
          <circle cx="50" cy="50" r="44" fill="none" stroke="oklch(1 0 0 / 0.08)" strokeWidth="6" />
          <circle cx="50" cy="50" r="44" fill="none" stroke="url(#g)" strokeWidth="6"
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="oklch(0.85 0.16 90)" />
              <stop offset="1" stopColor="oklch(0.68 0.18 255)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div>
            <div className="text-3xl font-semibold text-text">{score}</div>
            <div className="text-[10px] text-text-dim">/ 100</div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-text-muted">
        Computed from grades, income normalisation & category weighting.
      </p>
    </div>
  );
}
