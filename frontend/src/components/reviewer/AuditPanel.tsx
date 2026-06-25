// src/components/reviewer/AuditPanel.tsx
import { Check, ChevronRight, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { DocItem, DocStatus } from "./mockData";

interface Props {
  docs: DocItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  rejectingId: string | null;
  setRejectingId: (id: string | null) => void;
  rejectionDraft: string;
  setRejectionDraft: (s: string) => void;
  onSubmit: () => void;
  allDone: boolean;
  alreadySubmitted?: boolean;
}

const statusBadge: Record<DocStatus, string> = {
  Pending: "bg-slate-100 text-slate-600 border-slate-200",
  Approved: "bg-emerald-100/80 text-emerald-700 border-emerald-200/60",
  Rejected: "bg-rose-100/80 text-rose-700 border-rose-200/60",
};

export function AuditPanel(p: Props) {
  const approved = p.docs.filter((d) => d.status === "Approved").length;
  const total = p.docs.length;
  const reviewed = p.docs.filter((d) => d.status !== "Pending").length;

  return (
    <div className="glass flex h-full flex-col overflow-hidden rounded-2xl bg-white/60 border border-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-white/60 px-4 py-3.5 bg-white/40">
        <div className="flex w-full items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Document Checklist</h3>
            <p className="text-xs text-slate-500">Review each item before submitting</p>
          </div>
          <div className="text-xs font-medium text-muted-foreground">{approved}/{total} approved</div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all"
            style={{ width: `${(reviewed / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {p.docs.map((d) => {
          const isSel = p.selectedId === d.id;
          const isRejecting = p.rejectingId === d.id;
          return (
            <div
              key={d.id}
              className={`rounded-xl border transition-all ${
                isSel ? "border-primary/30 bg-white/80 shadow-sm" : "border-white/60 bg-white/40 hover:bg-white/70"
              }`}
            >
              <button
                onClick={() => p.onSelect(d.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">{d.type}</div>
                    <Badge variant="outline" className={`mt-1 rounded-full text-[10px] ${statusBadge[d.status]}`}>
                      {d.status}
                    </Badge>
                  </div>
                </div>
                <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isSel ? "rotate-90" : ""}`} />
              </button>
              {isSel && (
                <div className="space-y-3 border-t border-white/60 px-4 py-3">
                  {d.rejectionReason && !isRejecting && (
                    <div className="rounded-lg bg-rose-50/80 p-2.5 text-xs text-rose-700">
                      <span className="font-semibold">Reason:</span> {d.rejectionReason}
                    </div>
                  )}
                  {d.status !== "Pending" ? (
                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 py-3 text-center text-xs text-slate-500">
                      Document has been marked as <span className={`font-semibold ${d.status === "Approved" ? "text-emerald-600" : "text-rose-600"}`}>{d.status}</span>
                    </div>
                  ) : (
                    <>
                      <div className={`grid gap-2 overflow-hidden transition-all duration-300 ${isRejecting ? "max-h-60" : "max-h-0"}`}>
                        <Textarea
                          value={p.rejectionDraft}
                          onChange={(e) => p.setRejectionDraft(e.target.value)}
                          placeholder="Provide a clear reason for rejection (required)…"
                          className="min-h-[80px] resize-none rounded-lg border-rose-200/60 bg-white/80 text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => p.onApprove(d.id)}
                          className="flex-1 rounded-lg bg-emerald-500/90 text-white shadow-sm transition-all hover:scale-[1.02] hover:bg-emerald-500"
                        >
                          <Check className="mr-1 h-3.5 w-3.5" /> Approve
                        </Button>
                        {isRejecting ? (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => { p.setRejectingId(null); p.setRejectionDraft(""); }} className="rounded-lg">
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              disabled={p.rejectionDraft.trim().length < 5}
                              onClick={() => p.onReject(d.id, p.rejectionDraft)}
                              className="rounded-lg bg-rose-500/90 text-white shadow-sm hover:bg-rose-500"
                            >
                              Confirm Reject
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { p.setRejectingId(d.id); p.setRejectionDraft(d.rejectionReason ?? ""); }}
                            className="flex-1 rounded-lg border-rose-200/60 bg-rose-50/60 text-rose-600 hover:bg-rose-100/60 hover:text-rose-700"
                          >
                            <X className="mr-1 h-3.5 w-3.5" /> Reject
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/60 bg-white/40 p-4">
        <Button
          disabled={!p.allDone || p.alreadySubmitted}
          onClick={p.onSubmit}
          className={`h-12 w-full rounded-xl text-base font-semibold shadow-[var(--shadow-lift)] transition-all disabled:opacity-50 ${
            p.alreadySubmitted 
              ? "bg-slate-200 text-slate-500 hover:scale-100" 
              : "bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:scale-[1.01]"
          }`}
        >
          {p.alreadySubmitted ? "Application Already Audited" : "Submit Complete Audit"}
        </Button>
        {!p.allDone && !p.alreadySubmitted && (
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Review every document to enable submission
          </p>
        )}
        {p.alreadySubmitted && (
          <p className="mt-2 text-center text-[11px] text-emerald-600 font-medium">
            You have already completed the audit for this application.
          </p>
        )}
      </div>
    </div>
  );
}