import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export default function ScreenerRubric() {
  const [need, setNeed] = useState(7);
  const [merit, setMerit] = useState(8);
  const [decision, setDecision] = useState("Approve");
  const [justification, setJustification] = useState("");

  const ready = justification.trim().length > 10;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <div className="text-[10px] uppercase tracking-widest text-slate-400">Screener's Rubric</div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400">Composite {((need + merit) / 2).toFixed(1)}/10</div>
        </div>

        <div className="space-y-5 px-5 py-4">
          <Slider label="Need Level" value={need} onChange={setNeed} hint="How urgent is financial assistance?" />
          <Slider label="Academic Merit" value={merit} onChange={setMerit} hint="Strength of academic profile." />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-3 text-[10px] uppercase tracking-widest text-slate-400">
          Final Decision
        </div>
        <div className="space-y-4 px-5 py-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-slate-400">Final Recommendation</label>
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-slate-400 focus:outline-none"
            >
              <option>Approve</option>
              <option>Reject</option>
              <option>Waitlist</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-slate-400">Screener's Justification</label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={4}
              placeholder="Document your reasoning — this is permanent on the audit trail."
              className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none"
            />
          </div>
          <button
            disabled={!ready}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
            Submit Final Screening Decision
          </button>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, onChange, hint }: { label: string; value: number; onChange: (v: number) => void; hint: string }) {
  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-sm font-medium text-slate-900">{label}</div>
          <div className="text-xs text-slate-500">{hint}</div>
        </div>
        <div className="text-lg font-semibold tabular-nums text-slate-900">{value}<span className="text-xs text-slate-400">/10</span></div>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-slate-900"
      />
    </div>
  );
}
