// src/components/reviewer/ActivityPopover.tsx
'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowRight, Check, Send, Sparkles, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

const meta: Record<ActivityLog["action"], { Icon: typeof Check; ring: string; chip: string }> = {
  Approved: { Icon: Check, ring: "ring-emerald-200/70 bg-emerald-50 text-emerald-600", chip: "bg-emerald-100 text-emerald-700" },
  Rejected: { Icon: X, ring: "ring-rose-200/70 bg-rose-50 text-rose-600", chip: "bg-rose-100 text-rose-700" },
  Submitted: { Icon: Send, ring: "ring-indigo-200/70 bg-indigo-50 text-indigo-600", chip: "bg-indigo-100 text-indigo-700" },
};

export function ActivityPopover() {
  const [open, setOpen] = useState(false);
  const [live, setLive] = useState<ActivityLog[]>([]);

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
          timestamp: new Date(l.timestamp).toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        };
      });
      setLive(formatted);
    });
  }, []);

  const all = live;
  const recent = all.slice(0, 6);
  const rejections = all.filter((l) => l.action === "Rejected" && l.reason).length;
  const approvals = all.filter((l) => l.action === "Approved").length;
  const liveCount = live.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="group relative inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm ring-1 ring-white/60 transition-all hover:scale-[1.02] hover:bg-white"
          aria-label="Open activity log"
        >
          <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
            <Activity className="h-3 w-3" />
            {liveCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-white" />
            )}
          </span>
          <span className="hidden sm:inline">Recent</span>
          <span className="rounded-full bg-slate-900/5 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            {all.length}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="glass-strong w-[360px] rounded-2xl border-white/60 p-0 shadow-[var(--shadow-lift)]"
      >
        <div className="flex items-center justify-between border-b border-white/60 px-4 py-3">
          <div>
            <h4 className="text-sm font-semibold tracking-tight">Your Activity</h4>
            <p className="text-[11px] text-muted-foreground">Latest audit decisions with reasons</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
            <Sparkles className="h-2.5 w-2.5" /> Live
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 px-4 pt-3">
          <Stat label="Approved" value={approvals} tone="text-emerald-600" />
          <Stat label="Rejected" value={rejections} tone="text-rose-600" />
          <Stat label="Today" value={liveCount} tone="text-indigo-600" />
        </div>

        <ol className="max-h-[320px] space-y-1 overflow-y-auto px-2 py-3">
          {recent.map((l) => {
            const M = meta[l.action];
            return (
              <li key={l.id}>
                <Link
                  href={`/reviewer/audit/${l.appId}`}
                  onClick={() => setOpen(false)}
                  className="group flex items-start gap-3 rounded-xl p-2 transition-all hover:scale-[1.01] hover:bg-white/80 hover:shadow-sm"
                >
                  <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-2 ${M.ring}`}>
                    <M.Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-xs">
                        <span className={`mr-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${M.chip}`}>{l.action}</span>
                        <span className="font-medium">{l.docType}</span>
                      </p>
                      <time className="shrink-0 text-[10px] font-medium text-slate-500 whitespace-nowrap ml-2">
                        {new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </time>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">
                      Verified by <span className="font-semibold text-slate-700">You</span> <br className="sm:hidden" />
                      <span className="hidden sm:inline"> · </span>{l.studentName} <span className="font-mono text-[10px] text-slate-400">(#{l.appId})</span>
                    </p>
                    {l.reason && (
                      <div className="mt-1.5 rounded-lg border border-rose-100 bg-rose-50/80 px-2 py-1 text-[11px] leading-snug text-rose-700">
                        <span className="font-semibold">Why: </span>{l.reason}
                      </div>
                    )}
                    <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Open file <ArrowRight className="h-2.5 w-2.5" />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>

        <Link
          href="/reviewer/logs"
          onClick={() => setOpen(false)}
          className="flex items-center justify-center gap-1.5 border-t border-white/60 px-4 py-2.5 text-xs font-semibold text-primary transition-colors hover:bg-white/70"
        >
          Open full activity timeline <ArrowRight className="h-3 w-3" />
        </Link>
      </PopoverContent>
    </Popover>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl bg-white/60 px-2 py-1.5 text-center ring-1 ring-white/70">
      <div className={`text-base font-bold leading-tight ${tone}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}