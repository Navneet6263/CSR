import { AlertCircle, CheckCircle2, Clock, Upload } from "lucide-react";
import type { RequiredDoc } from "@/lib/mockData";

interface Props {
  docs: RequiredDoc[];
}

function StatusBadge({ status }: { status: RequiredDoc["status"] }) {
  if (status === "uploaded") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-medium text-success">
        <CheckCircle2 className="h-3 w-3" /> Uploaded
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive-soft px-2 py-0.5 text-[11px] font-medium text-destructive">
        <AlertCircle className="h-3 w-3" /> Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-medium text-warning-foreground">
      <Clock className="h-3 w-3" /> Pending
    </span>
  );
}

export function DocumentsGrid({ docs }: Props) {
  const uploaded = docs.filter((d) => d.status === "uploaded").length;
  const total = docs.length;
  const pct = Math.round((uploaded / total) * 100);

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Required Documents</h2>
          <p className="text-sm text-muted-foreground">
            {uploaded} of {total} documents verified
          </p>
        </div>
        <div className="flex w-full max-w-xs items-center gap-3 sm:w-64">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: "var(--gradient-primary)" }}
            />
          </div>
          <span className="text-xs font-semibold text-muted-foreground">{pct}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {docs.map((d) => {
          const rejected = d.status === "rejected";
          return (
            <article
              key={d.id}
              className={[
                "group relative flex flex-col gap-3 rounded-xl border p-4 transition",
                rejected
                  ? "border-destructive/30 bg-destructive-soft/40"
                  : "border-border bg-background hover:border-primary/40 hover:bg-primary-soft/30",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold">{d.name}</h3>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {d.description}
                  </p>
                </div>
                <StatusBadge status={d.status} />
              </div>

              {rejected && d.rejectionReason && (
                <p className="rounded-md bg-card px-2 py-1.5 text-[11px] leading-relaxed text-destructive">
                  {d.rejectionReason}
                </p>
              )}

              {d.status !== "uploaded" && (
                <button
                  type="button"
                  className={[
                    "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                    rejected
                      ? "bg-destructive text-destructive-foreground hover:opacity-90"
                      : "bg-primary text-primary-foreground hover:opacity-90",
                  ].join(" ")}
                >
                  <Upload className="h-3.5 w-3.5" />
                  {rejected ? "Re-upload" : "Upload"}
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
