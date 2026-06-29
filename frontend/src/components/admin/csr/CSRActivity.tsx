import { CheckCircle2, Send, FileSignature, AlertTriangle } from "lucide-react";

type Event = { id: string; type: "auth" | "payout" | "doc" | "alert"; text: string; meta: string; when: string };

const ICONS = {
  auth: { I: FileSignature, c: "text-slate-900 bg-slate-100" },
  payout: { I: Send, c: "text-emerald-700 bg-emerald-50" },
  doc: { I: CheckCircle2, c: "text-blue-700 bg-blue-50" },
  alert: { I: AlertTriangle, c: "text-amber-700 bg-amber-50" },
};

const EVENTS: Event[] = [
  { id: "e1", type: "auth", text: "Authorized Batch #402", meta: "84 students · ₹42,00,000", when: "2d ago" },
  { id: "e2", type: "payout", text: "Disbursement complete", meta: "Batch #401 · 64 transfers", when: "5d ago" },
  { id: "e3", type: "doc", text: "Quarterly impact report signed", meta: "Q2 FY26", when: "1w ago" },
  { id: "e4", type: "alert", text: "Pending: MoU renewal", meta: "Expires in 38 days", when: "1w ago" },
  { id: "e5", type: "auth", text: "Authorized Batch #400", meta: "52 students · ₹26,00,000", when: "12d ago" },
];

export default function CSRActivity() {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400">Activity Feed</div>
          <h3 className="text-sm font-semibold text-slate-900 mt-0.5">Recent Authorizations</h3>
        </div>
        <button className="text-[11px] text-slate-500 hover:text-slate-900">View all</button>
      </div>
      <ol className="divide-y divide-slate-100">
        {EVENTS.map((e) => {
          const { I, c } = ICONS[e.type];
          return (
            <li key={e.id} className="flex items-start gap-3 px-4 py-3">
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${c}`}>
                <I className="h-3.5 w-3.5" strokeWidth={1.8} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-900 truncate">{e.text}</p>
                <p className="text-[11px] text-slate-500 truncate">{e.meta}</p>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0 tabular-nums">{e.when}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
