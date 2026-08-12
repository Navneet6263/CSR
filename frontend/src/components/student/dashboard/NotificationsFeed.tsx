import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import type { DashboardNotification as NotificationItem } from "@/types/dashboard";

const iconFor = {
  info: { Icon: Info, cls: "bg-info-soft text-info" },
  action: { Icon: AlertCircle, cls: "bg-destructive-soft text-destructive" },
  success: { Icon: CheckCircle2, cls: "bg-success-soft text-success" },
} as const;

interface Props {
  items: NotificationItem[];
  onMarkAllRead?: () => void;
}

export function NotificationsFeed({ items, onMarkAllRead }: Props) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Notifications</h2>
        <button disabled={!items.length} onClick={onMarkAllRead} className="text-xs font-medium text-accent-foreground hover:underline disabled:opacity-40">
          Mark all read
        </button>
      </div>
      <ul className="space-y-3">
        {items.map((n) => {
          const { Icon, cls } = iconFor[n.type];
          return (
            <li
              key={n.id}
              className="flex gap-3 rounded-xl border border-transparent p-2 transition hover:border-border hover:bg-muted/40"
            >
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${cls}`}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{n.title}</p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {n.time}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
      {!items.length && <p className="py-6 text-center text-sm text-muted-foreground">No recent notifications.</p>}
    </section>
  );
}
