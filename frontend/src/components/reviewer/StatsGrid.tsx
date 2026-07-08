"use client";
import { Inbox, CheckCircle2, RotateCcw, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { stats } from "@/lib/mock-data";

const items = [
  { label: "Pending Queue", value: stats.pending, icon: Inbox, delta: "+8 today", trend: "up", accent: "primary" },
  { label: "Verified Today", value: stats.verifiedToday, icon: CheckCircle2, delta: "+3 vs avg", trend: "up", accent: "success" },
  { label: "Re-uploads Requested", value: stats.reuploads, icon: RotateCcw, delta: "-2 vs avg", trend: "down", accent: "warn" },
  { label: "Avg. Review Time", value: stats.avgTime, icon: Clock, delta: "-18s faster", trend: "down", accent: "primary" },
] as const;

const accentMap: Record<string, string> = {
  primary: "text-primary bg-primary/10 border-primary/30",
  success: "text-success bg-success/10 border-success/30",
  warn: "text-warn bg-warn/10 border-warn/30",
};

export function StatsGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((s) => {
        const Trend = s.trend === "up" ? TrendingUp : TrendingDown;
        return (
          <div key={s.label} className="glass p-5 relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-fg-subtle">{s.label}</div>
                <div className="mt-3 text-3xl font-display font-bold tabular-nums">{s.value}</div>
              </div>
              <div className={`w-10 h-10 rounded-lg border grid place-items-center ${accentMap[s.accent]}`}>
                <s.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-fg-muted">
              <Trend className="w-3 h-3" /> {s.delta}
            </div>
            <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition" />
          </div>
        );
      })}
    </div>
  );
}
