import { useState } from "react";
import { ChevronDown, FileCheck2 } from "lucide-react";

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

export default function VerifiedDocsAccordion() {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <FileCheck2 className="h-4 w-4 text-emerald-600" strokeWidth={1.75} />
          <div className="text-sm font-medium text-slate-900">Verified Documents</div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
            8/8
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition ${open ? "rotate-180" : ""}`}
          strokeWidth={1.75}
        />
      </button>
      {open && (
        <ul className="border-t border-slate-100 px-4 py-3 text-xs text-slate-600">
          {DOCS.map((d) => (
            <li key={d} className="flex items-center justify-between py-1.5">
              <span>{d}</span>
              <span className="text-[10px] uppercase tracking-widest text-emerald-600">
                Verified
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
