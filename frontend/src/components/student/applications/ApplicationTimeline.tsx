import { Check, Circle, X } from "lucide-react";
import type { TimelineEvent } from "@/lib/applicationsData";
import { cn } from "@/lib/utils";

export function ApplicationTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative space-y-4 border-l-2 border-border pl-6">
      {events.map((e) => {
        const iconWrap = cn(
          "absolute -left-[13px] grid h-6 w-6 place-items-center rounded-full ring-4 ring-background",
          e.status === "complete" && "bg-success text-success-foreground",
          e.status === "current" && "bg-primary text-primary-foreground animate-pulse",
          e.status === "rejected" && "bg-destructive text-destructive-foreground",
          e.status === "pending" && "bg-muted text-muted-foreground",
        );
        return (
          <li key={e.key} className="relative">
            <span className={iconWrap}>
              {e.status === "complete" && <Check className="h-3.5 w-3.5" />}
              {e.status === "rejected" && <X className="h-3.5 w-3.5" />}
              {(e.status === "current" || e.status === "pending") && (
                <Circle className="h-2 w-2 fill-current" />
              )}
            </span>
            <div className="ml-1">
              <p
                className={cn(
                  "text-sm font-semibold",
                  e.status === "pending" && "text-muted-foreground",
                  e.status === "rejected" && "text-destructive",
                )}
              >
                {e.label}
              </p>
              {e.note && <p className="text-xs text-muted-foreground">{e.note}</p>}
              {e.status === "current" && (
                <p className="text-xs text-primary">In progress</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
