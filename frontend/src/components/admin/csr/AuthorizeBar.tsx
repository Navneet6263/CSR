import { ShieldCheck, X } from "lucide-react";

export default function AuthorizeBar({
  count, amount, onClear, onAuthorize, pending,
}: { count: number; amount: number; onClear: () => void; onAuthorize: () => void; pending: boolean }) {
  if (count === 0) return null;
  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-[min(720px,calc(100%-2rem))] -translate-x-1/2 animate-in slide-in-from-bottom-4">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-2xl shadow-slate-900/10 backdrop-blur">
        <button onClick={onClear} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
          <X className="h-3.5 w-3.5" />
        </button>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {count} student{count > 1 ? "s" : ""} selected
            <span className="ml-2 text-slate-500 font-normal">·</span>
            <span className="ml-2 tabular-nums">₹{amount.toLocaleString("en-IN")}</span>
          </p>
          <p className="text-[11px] text-slate-500 truncate">Funds will be reserved instantly; payout in T+1 banking day.</p>
        </div>
        <button
          onClick={onAuthorize}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-slate-800 disabled:opacity-60"
        >
          <ShieldCheck className="h-4 w-4" />
          {pending ? "Authorizing…" : "Authorize Funding"}
        </button>
      </div>
    </div>
  );
}
