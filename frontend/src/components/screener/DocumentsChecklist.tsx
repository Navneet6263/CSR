import { CheckCircle2, FileCheck, Home, Users, IdCard, Quote } from "lucide-react";
import type { Application } from "@/lib/screening-data";

export function DocumentsChecklist({ docs }: { docs: Application["documents"] }) {
  return (
    <div className="glass-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCheck className="h-4 w-4 text-brand" />
          <h3 className="text-base font-semibold text-text">Verified Documents</h3>
        </div>
        <span className="rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 text-[10px] font-semibold text-success">
          {docs.filter((d) => d.verified).length}/{docs.length} VERIFIED
        </span>
      </div>
      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {docs.map((d) => (
          <li key={d.name} className="flex items-center gap-2.5 rounded-md border border-brand/6 bg-brand/[0.02] px-3 py-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
            <span className="flex-1 text-xs text-text">{d.name}</span>
            <button className="text-[10px] font-medium text-brand hover:underline">View</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BackgroundCheck({ report }: { report: Application["fieldReport"] }) {
  const items = [
    { label: "House Visited", ok: report.houseVisited, icon: Home },
    { label: "Family Met", ok: report.familyMet, icon: Users },
    { label: "College ID Matched", ok: report.collegeIdMatched, icon: IdCard },
  ];
  return (
    <div className="glass-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-text">Field Officer Report</h3>
        <span className="text-[10px] text-text-dim">by <span className="text-text-muted">{report.officer}</span></span>
      </div>
      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.label} className="flex items-center justify-between rounded-md border border-brand/6 bg-brand/[0.02] px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <it.icon className="h-4 w-4 text-text-muted" />
              <span className="text-xs text-text">{it.label}</span>
            </div>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              it.ok ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
            }`}>
              <CheckCircle2 className="h-3 w-3" /> {it.ok ? "Verified" : "Failed"}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-md border-l-2 border-gold bg-gold/5 p-3">
        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gold">
          <Quote className="h-3 w-3" /> Field Officer Notes
        </div>
        <p className="text-xs italic text-text-muted">&ldquo;{report.notes}&rdquo;</p>
      </div>
    </div>
  );
}
