import { Lock, Unlock, ShieldAlert } from "lucide-react";

export default function AdminOverride({
  onHold,
  reason,
  onReasonChange,
  onPlaceHold,
  onReleaseHold,
}: {
  onHold: boolean;
  reason: string;
  onReasonChange: (v: string) => void;
  onPlaceHold: () => void;
  onReleaseHold: () => void;
}) {
  return (
    <div className="rounded-xl border border-rose-100 bg-rose-50/30 p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-rose-600" strokeWidth={1.75} />
        <div className="text-[10px] uppercase tracking-widest text-rose-700">
          Admin Override
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Placing this application on hold locks all documents — the Document Checker
        will not be able to verify or reject any file until released.
      </p>

      <textarea
        value={reason}
        onChange={(e) => onReasonChange(e.target.value)}
        placeholder="Reason for placing on hold (visible to internal team)…"
        rows={4}
        disabled={onHold}
        className="mt-4 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
      />

      <div className="mt-3 flex gap-2">
        <button
          onClick={onPlaceHold}
          disabled={onHold || !reason.trim()}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Lock className="h-3.5 w-3.5" strokeWidth={2} />
          Place on Hold
        </button>
        <button
          onClick={onReleaseHold}
          disabled={!onHold}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          <Unlock className="h-3.5 w-3.5" strokeWidth={2} />
          Release
        </button>
      </div>
    </div>
  );
}
