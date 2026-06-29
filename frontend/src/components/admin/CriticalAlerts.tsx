import { AlertTriangle, PauseCircle, Clock, ArrowRight } from "lucide-react";
import ChartCard from "./ChartCard";

type Alert = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
  tone: "danger" | "warn" | "info";
};

// Alerts will be built dynamically inside the component

const styles: Record<Alert["tone"], { wrap: string; dot: string }> = {
  danger: { wrap: "border-rose-200/70 bg-rose-50/40", dot: "text-rose-600 bg-rose-100" },
  warn: { wrap: "border-amber-200/70 bg-amber-50/40", dot: "text-amber-700 bg-amber-100" },
  info: { wrap: "border-slate-200/80 bg-slate-50", dot: "text-slate-600 bg-slate-100" },
};

export default function CriticalAlerts({ data }: { data?: any }) {
  const stuck = data?.stuckAtBGCheck || 0;
  const held = data?.heldApplications || 0;

  const alerts: Alert[] = [];
  
  if (stuck > 0) {
    alerts.push({
      icon: Clock,
      title: `${stuck} stuck in Background Check`,
      detail: "Pending more than 5 days. Reassign or escalate.",
      tone: "danger",
    });
  }
  
  if (held > 0) {
    alerts.push({
      icon: PauseCircle,
      title: `${held} applications on HOLD`,
      detail: "Manually paused by admin. Awaiting review.",
      tone: "warn",
    });
  }
  
  if (alerts.length === 0) {
    alerts.push({
      icon: AlertTriangle,
      title: "No critical bottlenecks",
      detail: "Pipelines are flowing smoothly.",
      tone: "info",
    });
  }

  return (
    <ChartCard title="Critical Alerts" subtitle="Bottlenecks needing attention">
      <ul className="px-3 pb-2 space-y-2.5">
        {alerts.map((a) => {
          const Icon = a.icon;
          const s = styles[a.tone];
          return (
            <li
              key={a.title}
              className={"group flex items-start gap-3 rounded-lg border p-3 transition hover:shadow-sm " + s.wrap}
            >
              <div className={"grid h-7 w-7 shrink-0 place-items-center rounded-md " + s.dot}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-slate-900 leading-tight">{a.title}</p>
                <p className="mt-0.5 text-[11.5px] text-slate-500">{a.detail}</p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400 mt-1 opacity-0 group-hover:opacity-100 transition" />
            </li>
          );
        })}
      </ul>
    </ChartCard>
  );
}
