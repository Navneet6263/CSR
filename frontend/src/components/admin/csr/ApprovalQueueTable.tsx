import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Star, GraduationCap } from "lucide-react";

export type CSRStudent = {
  id: string;
  name: string;
  college: string;
  course: string;
  gpa: number;
  amount: number;
  score: number;
  category: "SC" | "ST" | "OBC" | "GEN" | "EWS";
};

export default function ApprovalQueueTable({
  rows, selected, onToggle, onToggleAll,
}: {
  rows: CSRStudent[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const v = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 8,
  });
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400">Batch #403 · Approval Queue</div>
          <h3 className="text-sm font-semibold text-slate-900 mt-0.5">Screening Officer Recommendations</h3>
        </div>
        <div className="text-[11px] text-slate-500 tabular-nums">{rows.length} students · virtualized</div>
      </div>

      <div className="grid grid-cols-[36px_minmax(0,2fr)_minmax(0,1.6fr)_70px_110px_90px] px-4 py-2 text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-100 bg-slate-50/50">
        <div><input type="checkbox" checked={allSelected} onChange={onToggleAll} className="h-3.5 w-3.5 rounded border-slate-300" /></div>
        <div>Student / College</div>
        <div>Course</div>
        <div className="text-right">GPA</div>
        <div className="text-right">Amount</div>
        <div className="text-right">Score</div>
      </div>

      <div ref={parentRef} className="overflow-auto" style={{ height: 480, contentVisibility: "auto" as const }}>
        <div style={{ height: v.getTotalSize(), position: "relative" }}>
          {v.getVirtualItems().map((vi) => {
            const r = rows[vi.index];
            const isSel = selected.has(r.id);
            return (
              <div
                key={r.id}
                onClick={() => onToggle(r.id)}
                style={{ position: "absolute", top: 0, left: 0, right: 0, transform: `translateY(${vi.start}px)`, height: vi.size }}
                className={
                  "grid grid-cols-[36px_minmax(0,2fr)_minmax(0,1.6fr)_70px_110px_90px] items-center px-4 border-b border-slate-100 cursor-pointer transition-colors " +
                  (isSel ? "bg-slate-900/[0.03]" : "hover:bg-slate-50/60")
                }
              >
                <div><input type="checkbox" checked={isSel} onChange={() => onToggle(r.id)} onClick={(e) => e.stopPropagation()} className="h-3.5 w-3.5 rounded border-slate-300" /></div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900 truncate">
                    {r.name}
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">{r.category}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                    <GraduationCap className="h-3 w-3 shrink-0" />{r.college}
                  </div>
                </div>
                <div className="text-xs text-slate-700 truncate">{r.course}</div>
                <div className="text-right text-sm tabular-nums text-slate-900">{r.gpa.toFixed(1)}</div>
                <div className="text-right text-sm font-semibold tabular-nums text-slate-900">₹{r.amount.toLocaleString("en-IN")}</div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700 tabular-nums">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />{r.score.toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
