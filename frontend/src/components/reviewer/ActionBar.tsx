"use client";
import { CheckCircle2, RotateCcw, XCircle, Send } from "lucide-react";
import { useState } from "react";
import type { DocItem, DocStatus } from "@/lib/mock-data";

export function ActionBar({ doc, onAction, allDone, onComplete }: {
  doc: DocItem;
  onAction: (status: DocStatus, reason?: string) => void;
  allDone: boolean;
  onComplete: () => void;
}) {
  const [mode, setMode] = useState<"reupload" | "reject" | null>(null);
  const [reason, setReason] = useState("");

  const submit = (s: DocStatus) => {
    if (s === "Verified") { onAction(s); setMode(null); setReason(""); return; }
    if (!reason.trim()) return;
    onAction(s, reason.trim());
    setMode(null); setReason("");
  };

  return (
    <div className="sticky bottom-4 z-30 rounded-2xl border border-border-strong bg-bg-elev/95 backdrop-blur-2xl shadow-2xl shadow-black/60 p-4">
      {mode && (
        <div className="mb-3 flex items-center gap-2">
          <input autoFocus value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder={mode === "reupload" ? "Reason (e.g. Image is blurry)…" : "Reject reason (required)…"}
            className="flex-1 rounded-lg bg-surface border border-border px-3 py-2 text-sm focus:outline-none focus:border-primary/60 placeholder:text-fg-subtle" />
          <button onClick={() => { setMode(null); setReason(""); }} className="text-xs text-fg-subtle hover:text-fg px-3 py-2">Cancel</button>
          <button onClick={() => submit(mode === "reupload" ? "ReUploadRequested" : "Rejected")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${mode === "reupload" ? "bg-warn/20 text-warn border border-warn/40 hover:bg-warn/30" : "bg-danger/20 text-danger border border-danger/40 hover:bg-danger/30"}`}>
            Confirm
          </button>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-xs text-fg-subtle mr-2">Decision for <span className="text-fg font-medium">{doc.label}</span>:</div>
        <button onClick={() => submit("Verified")} className="flex items-center gap-2 rounded-lg bg-success/15 border border-success/40 text-success px-4 py-2 text-sm font-semibold hover:bg-success/25 transition">
          <CheckCircle2 className="w-4 h-4" /> Verify
        </button>
        <button onClick={() => { setMode("reupload"); }} className="flex items-center gap-2 rounded-lg bg-warn/10 border border-warn/40 text-warn px-4 py-2 text-sm font-semibold hover:bg-warn/20 transition">
          <RotateCcw className="w-4 h-4" /> Request Re-upload
        </button>
        <button onClick={() => { setMode("reject"); }} className="flex items-center gap-2 rounded-lg bg-danger/10 border border-danger/40 text-danger px-4 py-2 text-sm font-semibold hover:bg-danger/20 transition">
          <XCircle className="w-4 h-4" /> Reject
        </button>
        <button disabled={!allDone} onClick={onComplete}
          className={`ml-auto flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-bold transition ${
            allDone ? "bg-primary text-bg hover:bg-primary-glow glow-primary" : "bg-surface text-fg-subtle border border-border cursor-not-allowed"
          }`}>
          <Send className="w-4 h-4" /> Complete Audit & Forward
        </button>
      </div>
    </div>
  );
}
