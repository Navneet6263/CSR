import { FileCheck2, ShieldCheck, Check } from "lucide-react";

const DOCS = [
  "Aadhar Card",
  "Income Certificate",
  "Bank Passbook",
  "Fee Receipt",
  "Bonafide Certificate",
  "10th Marksheet",
  "12th Marksheet",
  "Entrance Scorecard",
];

const BG_MODULES = [
  { mod: "Physical Address", note: "Visited on 22 Jun · neighbour confirmed residence since 2019." },
  { mod: "College Enrollment", note: "Registrar email verified · roll no. CS22B091 active." },
  { mod: "Financial Record", note: "12-month bank flow consistent with declared ₹1.8L income." },
  { mod: "Criminal Record", note: "Local PS clearance attached · no records found." },
];

export default function AuditTrail() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
          <div className="grid h-8 w-8 place-items-center rounded-lg border border-emerald-200 bg-emerald-50">
            <FileCheck2 className="h-4 w-4 text-emerald-700" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-widest text-slate-400">Document Audit Summary</div>
            <div className="mt-0.5 text-sm font-medium text-slate-900">8/8 Documents Verified by Rohan (Doc Checker)</div>
            <div className="text-xs text-slate-500">Completed · 24 Jun 2026, 14:22</div>
          </div>
        </div>
        <ul className="grid grid-cols-1 gap-1 px-5 py-4 text-xs text-slate-700 sm:grid-cols-2">
          {DOCS.map((d) => (
            <li key={d} className="flex items-center gap-2 py-1">
              <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                <Check className="h-3 w-3" strokeWidth={2.25} />
              </span>
              <span className="truncate">{d}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
          <div className="grid h-8 w-8 place-items-center rounded-lg border border-emerald-200 bg-emerald-50">
            <ShieldCheck className="h-4 w-4 text-emerald-700" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-widest text-slate-400">Background Check Summary</div>
            <div className="mt-0.5 text-sm font-medium text-slate-900">All 4 Modules Cleared by Amit (BG Checker)</div>
            <div className="text-xs text-slate-500">Completed · 25 Jun 2026, 11:08</div>
          </div>
        </div>
        <ul className="space-y-2 px-5 py-4 text-xs text-slate-700">
          {BG_MODULES.map((m) => (
            <li key={m.mod} className="flex items-start gap-2 py-0.5">
              <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                <Check className="h-3 w-3" strokeWidth={2.25} />
              </span>
              <div className="min-w-0">
                <div className="font-medium text-slate-900">{m.mod}</div>
                <div className="text-slate-500">{m.note}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
