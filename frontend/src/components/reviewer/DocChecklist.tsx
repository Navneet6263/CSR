"use client";
import type { DocItem } from "@/lib/mock-data";
import { CheckCircle2, RotateCcw, XCircle, Circle, FileText } from "lucide-react";

const statusMap = {
  Pending: { icon: Circle, cls: "text-fg-subtle" },
  Verified: { icon: CheckCircle2, cls: "text-success" },
  ReUploadRequested: { icon: RotateCcw, cls: "text-warn" },
  Rejected: { icon: XCircle, cls: "text-danger" },
} as const;

export function DocChecklist({ docs, activeKey, onSelect }: { docs: DocItem[]; activeKey: string; onSelect: (k: string) => void }) {
  const verified = docs.filter((d) => d.status === "Verified").length;
  const total = docs.filter((d) => d.required).length;
  const pct = Math.round((verified / total) * 100);

  return (
    <div className="glass p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-fg-subtle">
          <FileText className="w-3 h-3" /> Document Checklist
        </div>
        <div className="text-xs font-mono text-fg-muted">{verified}/{total}</div>
      </div>
      <div className="h-1 rounded-full bg-surface overflow-hidden mb-4">
        <div className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all" style={{ width: `${pct}%` }} />
      </div>
      <ul className="space-y-1.5">
        {docs.map((d) => {
          const S = statusMap[d.status];
          const active = d.key === activeKey;
          return (
            <li key={d.key}>
              <button onClick={() => onSelect(d.key)}
                className={`w-full text-left rounded-lg border px-3 py-2.5 transition flex items-start gap-3 ${
                  active ? "border-primary/60 bg-primary/10" : "border-border hover:border-border-strong hover:bg-surface/40"
                }`}>
                <S.icon className={`w-4 h-4 mt-0.5 shrink-0 ${S.cls}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{d.label}</span>
                    {!d.required && <span className="text-[9px] font-mono text-fg-subtle uppercase">optional</span>}
                  </div>
                  <div className="text-[11px] text-fg-subtle mt-0.5">Verifies: {d.verifies}</div>
                  {d.reason && <div className="text-[11px] text-warn mt-1">Note: {d.reason}</div>}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
