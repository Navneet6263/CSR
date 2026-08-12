import Link from "next/link";
import type { DashboardApplication as Application } from "@/types/dashboard";

interface Props {
  applications: Application[];
}

const statusStyles: Record<Application["status"], string> = {
  Funded: "bg-success-soft text-success",
  "Under Review": "bg-info-soft text-info",
  Pending: "bg-warning-soft text-warning-foreground",
  Rejected: "bg-destructive-soft text-destructive",
};

export function ApplicationsTable({ applications }: Props) {
  return (
    <section className="rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold">My Applications</h2>
          <p className="text-sm text-muted-foreground">
            Status of every scholarship you've applied to.
          </p>
        </div>
        <Link
          href="/student/applications"
          className="text-sm font-medium text-accent-foreground hover:underline"
        >
          View all →
        </Link>
      </div>

      <div className="overflow-x-auto" style={{ contentVisibility: "auto" }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-6 py-3">Scholarship</th>
              <th className="px-3 py-3">Applied</th>
              <th className="px-3 py-3">Current Stage</th>
              <th className="px-3 py-3">Amount</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr
                key={app.id}
                className="border-b border-border last:border-0 transition hover:bg-muted/40"
              >
                <td className="px-6 py-3">
                  <div className="font-medium">{app.scholarship}</div>
                  <div className="text-xs text-muted-foreground">#{app.id}</div>
                </td>
                <td className="px-3 py-3 text-muted-foreground">{app.appliedOn}</td>
                <td className="px-3 py-3">{app.currentStage}</td>
                <td className="px-3 py-3 font-semibold">{app.amount}</td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[app.status]}`}
                  >
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  <Link
                    href={`/student/applications/${app.id}`}
                    className="rounded-md border border-border bg-background px-3 py-1 text-xs font-medium transition hover:bg-accent"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
