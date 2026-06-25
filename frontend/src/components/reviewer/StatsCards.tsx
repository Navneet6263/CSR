// src/components/reviewer/StatsCards.tsx
'use client';

import { useState, useEffect } from "react";
import { Clock, FileCheck2, ShieldAlert, Timer, Loader2 } from "lucide-react";
import { verificationApi } from "@/lib/api/verification";

const icons = [Clock, FileCheck2, ShieldAlert, Timer];
const toneStyles: Record<string, string> = {
  primary: "from-indigo-100 to-sky-100 text-indigo-600",
  success: "from-emerald-100 to-teal-100 text-emerald-600",
  rose: "from-rose-100 to-pink-100 text-rose-500",
  amber: "from-amber-100 to-orange-100 text-amber-600",
};

export function StatsCards() {
  const [statsData, setStatsData] = useState<any>(null);

  useEffect(() => {
    verificationApi.getReviewerStats().then((res) => {
      setStatsData(res.data);
    });
  }, []);

  if (!statsData) {
    return <div className="h-28 flex items-center justify-center text-muted-foreground"><Loader2 className="animate-spin h-5 w-5 mr-2" /> Loading stats...</div>;
  }

  const STATS = [
    { label: "Pending Review", value: statsData.pendingReview, tone: "primary", hint: "Documents waiting for action" },
    { label: "Approved Today", value: statsData.approvedToday, tone: "success", hint: "Verified in this session" },
    { label: "Rejected Today", value: statsData.rejectedToday, tone: "rose", hint: "Requires student re-upload" },
    { label: "Avg Audit Time", value: statsData.avgAuditTime, tone: "amber", hint: "Based on recent audits" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STATS.map((s, i) => {
        const Icon = icons[i];
        return (
          <div
            key={s.label}
            className="glass group rounded-2xl p-5 transition-all hover:scale-[1.02] bg-white/70 shadow-sm border border-white hover:shadow-[var(--shadow-lift)]"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </div>
                <div className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                  {s.value}
                </div>
              </div>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${toneStyles[s.tone]} transition-transform group-hover:scale-110`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">{s.hint}</div>
          </div>
        );
      })}
    </div>
  );
}