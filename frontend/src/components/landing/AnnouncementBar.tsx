"use client";
import { Radio } from "lucide-react";

const announcements = [
  { tag: "NEW", text: "TCS Scholar Program 2026 applications now open — apply before Dec 20." },
  { tag: "LIVE", text: "Reliance Foundation UG Scholarship: ₹2,00,000 grant announced for MBBS students." },
  { tag: "UPDATE", text: "Document verification now 100% digital — no physical copies required." },
  { tag: "ALERT", text: "Infosys STEM Grant closes in 6 days. 1,200+ seats still available." },
  { tag: "NOTICE", text: "Merit list for HDFC Parivartan ECSS 2025 will be published on Nov 30." },
  { tag: "NEW", text: "L&T Build India Scholarship extended to ITI students across 18 states." },
];

const tagStyles: Record<string, string> = {
  NEW: "text-primary",
  LIVE: "text-red-500",
  UPDATE: "text-foreground",
  ALERT: "text-amber-600",
  NOTICE: "text-muted-foreground",
};

export function AnnouncementBar() {
  const items = [...announcements, ...announcements];
  return (
    <div className="relative border-b border-border/70 bg-foreground text-background">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-background/90">
            <Radio className="h-3.5 w-3.5" /> Live
          </span>
          <span className="hidden h-4 w-px bg-background/20 sm:block" />
        </div>

        <div className="group relative flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_5%,black_95%,transparent)]">
          <div className="ticker-track flex w-max items-center gap-12 group-hover:[animation-play-state:paused]">
            {items.map((a, i) => (
              <div key={i} className="flex shrink-0 items-center gap-2.5 text-[13px]">
                <span
                  className={`rounded-sm bg-background/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wider ${
                    tagStyles[a.tag] ?? "text-background"
                  }`}
                >
                  {a.tag}
                </span>
                <span className="text-background/90">{a.text}</span>
                <span className="ml-6 h-1 w-1 rounded-full bg-background/25" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


