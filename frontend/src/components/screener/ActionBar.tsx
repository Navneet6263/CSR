"use client";

import { useState } from "react";
import { Check, X, Loader2, ShieldCheck } from "lucide-react";

type Mode = null | "approve" | "reject";

interface Props {
  onSubmitted: (decision: "approve" | "reject", note: string) => void;
}

export function ActionBar({ onSubmitted }: Props) {
  const [mode, setMode] = useState<Mode>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = note.trim().length >= 8 && !loading;

  const submit = async () => {
    if (!mode || !canSubmit) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    onSubmitted(mode, note.trim());
    setMode(null);
    setNote("");
  };

  return (
    <div className="sticky bottom-4 z-30 mt-8">
      <div className="glass-card overflow-hidden border-brand/10 shadow-[var(--shadow-glow)]">
        {mode === null ? (
          <div className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3 pl-2">
              <ShieldCheck className="h-5 w-5 text-gold" />
              <div>
                <div className="text-sm font-semibold text-text">Ready to make a decision?</div>
                <div className="text-xs text-text-dim">Your action will be logged and cannot be undone.</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setMode("reject")}
                className="flex items-center gap-2 rounded-md border border-danger/40 bg-danger/10 px-5 py-3 text-sm font-semibold text-danger transition hover:bg-danger/20">
                <X className="h-4 w-4" /> Reject · Not Eligible
              </button>
              <button onClick={() => setMode("approve")}
                className="flex items-center gap-2 rounded-md bg-gradient-to-r from-success to-[oklch(0.7_0.18_150)] px-5 py-3 text-sm font-semibold text-[oklch(0.15_0.05_150)] transition hover:brightness-110">
                <Check className="h-4 w-4" /> Approve · Eligible for Funding
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${
                  mode === "approve" ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
                }`}>{mode === "approve" ? "Approving" : "Rejecting"}</span>
                <span className="text-sm font-medium text-text">
                  {mode === "approve" ? "Enter approval remarks" : "Reason for rejection is required"}
                </span>
              </div>
              <button onClick={() => { setMode(null); setNote(""); }}
                className="text-xs text-text-dim hover:text-text">Cancel</button>
            </div>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
              placeholder={mode === "approve"
                ? "e.g. Strong academic profile, verified low-income household, all documents in order."
                : "e.g. 12th marks (72%) below the scholarship cutoff of 75%."}
              className="w-full resize-none rounded-md border border-brand/8 bg-brand/[0.02] p-3 text-sm outline-none placeholder:text-text-dim focus:border-brand/50 text-text" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-text-dim">
                {note.trim().length} chars · minimum 8 required
              </span>
              <button onClick={submit} disabled={!canSubmit}
                className={`flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold transition ${
                  mode === "approve"
                    ? "bg-gradient-to-r from-success to-[oklch(0.7_0.18_150)] text-[oklch(0.15_0.05_150)]"
                    : "bg-gradient-to-r from-danger to-[oklch(0.6_0.22_20)] text-white"
                } ${canSubmit ? "hover:brightness-110" : "cursor-not-allowed opacity-50"}`}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {loading ? "Submitting…" : "Confirm & Submit Decision"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
