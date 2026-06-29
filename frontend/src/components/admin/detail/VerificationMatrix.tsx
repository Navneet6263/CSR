import { useState } from "react";
import { Home, GraduationCap, Wallet, ShieldAlert, CheckCircle2 } from "lucide-react";

type Status = "Pending" | "Cleared" | "Flagged";

const MODULES = [
  { key: "address", label: "Physical Address Verification", hint: "Field visit confirms residence at declared address.", icon: Home },
  { key: "college", label: "College Enrollment Verification", hint: "Registrar confirms active enrollment and course.", icon: GraduationCap },
  { key: "financial", label: "Financial Record Check", hint: "Declared income aligns with bank flow & lifestyle signals.", icon: Wallet },
  { key: "criminal", label: "Criminal / Disciplinary Check", hint: "No FIR, no institutional disciplinary action on record.", icon: ShieldAlert },
] as const;

const PILL: Record<Status, string> = {
  Pending: "bg-slate-100 text-slate-600 border-slate-200",
  Cleared: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Flagged: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function VerificationMatrix() {
  const [state, setState] = useState<Record<string, { status: Status; notes: string }>>(
    () => Object.fromEntries(MODULES.map((m) => [m.key, { status: "Pending" as Status, notes: "" }])),
  );

  const allCleared = MODULES.every((m) => state[m.key].status === "Cleared");

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <div className="text-[10px] uppercase tracking-widest text-slate-400">Verification Matrix</div>
        <div className="text-[10px] uppercase tracking-widest text-slate-400">
          {MODULES.filter((m) => state[m.key].status === "Cleared").length}/{MODULES.length} cleared
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {MODULES.map((m) => {
          const Icon = m.icon;
          const cur = state[m.key];
          return (
            <div key={m.key} className="px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-slate-50">
                  <Icon className="h-4 w-4 text-slate-600" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900">{m.label}</div>
                      <div className="text-xs text-slate-500">{m.hint}</div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                      {(["Pending", "Cleared", "Flagged"] as Status[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => setState((p) => ({ ...p, [m.key]: { ...p[m.key], status: s } }))}
                          className={`rounded-md border px-2 py-0.5 text-[11px] font-medium transition ${
                            cur.status === s ? PILL[s] : "border-transparent text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={cur.notes}
                    onChange={(e) => setState((p) => ({ ...p, [m.key]: { ...p[m.key], notes: e.target.value } }))}
                    placeholder="Field officer notes…"
                    rows={2}
                    className="mt-3 w-full resize-none rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
        <div className="text-xs text-slate-500">
          {allCleared ? "All checks cleared — ready to approve." : "Mark every module Cleared to enable approval."}
        </div>
        <button
          disabled={!allCleared}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
        >
          <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
          Approve Background Check
        </button>
      </div>
    </div>
  );
}
