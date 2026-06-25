'use client';

import { Check, FileCheck2, Filter, Search, Send, X, Loader2, ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { TopNav } from "@/components/reviewer/TopNav";
import { verificationApi } from "@/lib/api/verification";

type ActivityLog = {
  id: string;
  action: "Approved" | "Rejected" | "Submitted";
  docType: string;
  studentName: string;
  appId: string;
  reason?: string;
  timestamp: string;
};

const meta: Record<ActivityLog["action"], { icon: typeof Check; tone: string; verb: string }> = {
  Approved: { icon: Check, tone: "bg-emerald-100 text-emerald-600 border-emerald-200/70", verb: "Approved" },
  Rejected: { icon: X, tone: "bg-rose-100 text-rose-600 border-rose-200/70", verb: "Rejected" },
  Submitted: { icon: Send, tone: "bg-indigo-100 text-indigo-600 border-indigo-200/70", verb: "Submitted" },
};

export default function LogsPage() {
  const [q, setQ] = useState("");
  const [f, setF] = useState<"All" | ActivityLog["action"]>("All");
  const [live, setLive] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verificationApi.getReviewerLogs().then((res) => {
      const formatted = (res.data || []).map((l: Record<string, unknown>) => {
        let actionStr = 'Submitted';
        if (l.action === 'Verified') actionStr = 'Approved';
        else if (l.action === 'ReUploadRequested' || l.action === 'Rejected') actionStr = 'Rejected';
        
        const formatDocType = (str: string) => {
          if (!str) return 'Document';
          const s = str.replace(/([A-Z])/g, ' $1').trim();
          return s.charAt(0).toUpperCase() + s.slice(1);
        };
        
        return {
          id: l.id.toString(),
          action: actionStr,
          docType: formatDocType(l.docType as string),
          studentName: l.studentName,
          appId: l.appId.toString(),
          reason: l.reason,
          timestamp: new Date(l.timestamp).toLocaleString()
        };
      });
      setLive(formatted);
    }).finally(() => setLoading(false));
  }, []);

  const items = useMemo(
    () =>
      live.filter((l) => {
        const okQ = !q || `${l.studentName} ${l.appId} ${l.docType}`.toLowerCase().includes(q.toLowerCase());
        const okF = f === "All" || l.action === f;
        return okQ && okF;
      }),
    [q, f, live],
  );

  return (
    <div className="min-h-screen pb-16">
      <TopNav />
      <main className="space-y-6 mt-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Activity Timeline</h1>
            <p className="mt-1 text-sm text-muted-foreground">A complete, immutable record of every audit decision.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search logs…"
                className="h-10 w-64 rounded-xl border-white/60 bg-white/70 pl-9 shadow-sm"
              />
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-white/60 p-1 shadow-sm">
              <Filter className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
              {(["All", "Approved", "Rejected", "Submitted"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setF(opt)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    f === opt ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-white/80"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 bg-white/50 shadow-sm border border-white">
          <ol className="relative ml-3 border-l border-dashed border-slate-300">
            {loading && (
              <li className="ml-6 py-8 text-center text-sm text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" /> Loading activity logs...
              </li>
            )}
            {!loading && items.map((l) => {
              const M = meta[l.action];
              const Icon = M.icon;
              return (
                <li key={l.id} className="group mb-7 ml-6 last:mb-0">
                  <span className={`absolute -left-[14px] flex h-7 w-7 items-center justify-center rounded-full border-2 border-white shadow-sm ${M.tone}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="rounded-xl p-5 transition-all group-hover:scale-[1.01] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div>
                        <p className="text-sm sm:text-base text-slate-800 leading-snug">
                          <span className="font-bold">{M.verb}</span>{" "}
                          <span className="text-slate-600">{l.docType} for</span>{" "}
                          <span className="font-bold text-slate-900">{l.studentName}</span>{" "}
                          <span className="font-mono text-xs font-medium text-slate-400 uppercase tracking-wider">(APP-{l.appId})</span>
                        </p>
                        <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
                          <time className="font-medium">{new Date(l.timestamp).toLocaleString("en-US", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).replace(",", "")}</time>
                          <span>•</span>
                          <span>Verified by <span className="font-semibold text-slate-700">You</span></span>
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-0">
                        <Link href={`/reviewer/audit/${l.appId}`} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 shadow-sm transition-all hover:bg-indigo-100 hover:text-indigo-700 whitespace-nowrap">
                          View Application
                        </Link>
                      </div>
                    </div>
                    {l.reason && (
                      <div className="mt-4 rounded-lg bg-rose-50/80 px-4 py-3 text-sm text-rose-700 border border-rose-100">
                        <span className="font-bold uppercase text-[10px] tracking-wider text-rose-800/70 block mb-1">Reason for Rejection</span>
                        {l.reason}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
            {!loading && items.length === 0 && (
              <li className="ml-6 py-8 text-center text-sm text-muted-foreground">No logs match your filters.</li>
            )}
          </ol>
          <div className="mt-8 flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
            <FileCheck2 className="h-3.5 w-3.5" /> End of recent activity
          </div>
        </div>
      </main>
    </div>
  );
}
