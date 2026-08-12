import { Check } from "lucide-react";
import type { ProgressStep } from "@/types/dashboard";

interface Props {
  steps: ProgressStep[];
  applicationName?: string;
}

export function ProgressStepper({ steps, applicationName }: Props) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{applicationName || 'Application'} Progress</h2>
          <p className="text-sm text-muted-foreground">
            Track where your active application stands.
          </p>
        </div>
        <span className="hidden rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-accent-foreground sm:inline">
          Currently at{" "}
          <span className="font-semibold">
            {steps.find((s) => s.status === "current")?.label ?? "—"}
          </span>
        </span>
      </div>

      <ol className="relative grid grid-cols-4 gap-y-6 sm:grid-cols-8">
        {steps.map((step, idx) => {
          const isComplete = step.status === "complete";
          const isCurrent = step.status === "current";
          const nextDone = steps[idx + 1]?.status !== "pending";

          return (
            <li key={step.key} className="relative flex flex-col items-center">
              {idx < steps.length - 1 && (
                <span
                  className="absolute left-1/2 top-4 hidden h-0.5 w-full sm:block"
                  style={{
                    background: nextDone
                      ? "var(--color-primary)"
                      : "var(--color-border)",
                  }}
                />
              )}
              <span
                className={[
                  "relative z-10 grid h-8 w-8 place-items-center rounded-full text-xs font-semibold transition",
                  isComplete
                    ? "bg-primary text-primary-foreground"
                    : isCurrent
                    ? "bg-primary-soft text-accent-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground",
                ].join(" ")}
                style={isCurrent ? { boxShadow: "var(--shadow-glow)" } : undefined}
              >
                {isComplete ? <Check className="h-4 w-4" /> : idx + 1}
              </span>
              <span
                className={[
                  "mt-2 text-center text-[11px] font-medium sm:text-xs",
                  isCurrent ? "text-foreground" : "text-muted-foreground",
                ].join(" ")}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
