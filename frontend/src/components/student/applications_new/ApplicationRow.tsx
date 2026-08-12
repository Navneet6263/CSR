import Link from "next/link";
import type { DashboardApplication as Application } from "@/types/dashboard";

const statusStyles: Record<Application["status"], string> = {
  Funded: "bg-success-soft text-success",
  "Under Review": "bg-info-soft text-info",
  Pending: "bg-warning-soft text-warning-foreground",
  Rejected: "bg-destructive-soft text-destructive",
};

export function ApplicationRow({ app }: { app: Application }) {
  return (
    <Link
      href={`/student/applications/${app.id}`}
      className="cv-auto flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md sm:flex-row sm:items-center sm:gap-4"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-semibold">{app.scholarship}</h3>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyles[app.status]}`}
          >
            {app.status}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          #{app.id} • Applied {app.appliedOn}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm sm:flex sm:items-center sm:gap-6">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Stage</p>
          <p className="font-medium">{app.currentStage}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Amount</p>
          <p className="font-semibold">{app.amount}</p>
        </div>
        <span className="hidden rounded-full border border-border px-3 py-1.5 text-xs font-semibold sm:inline-block">
          View →
        </span>
      </div>
    </Link>
  );
}
