import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { SECTIONS, type SectionId, type ProfileFormState, sectionCompletion } from "@/lib/profileForm";

interface Props {
  form: ProfileFormState;
  active: SectionId;
  onSelect: (id: SectionId) => void;
}

export function SectionNav({ form, active, onSelect }: Props) {
  return (
    <nav className="space-y-1.5">
      {SECTIONS.map((s, idx) => {
        const pct = sectionCompletion(form, s.id);
        const done = pct === 100;
        const isActive = active === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            className={cn(
              "group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition",
              isActive
                ? "border-primary/40 bg-primary-soft shadow-sm"
                : "border-border bg-card hover:border-primary/30 hover:bg-accent/40",
            )}
          >
            <div
              className={cn(
                "grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold",
                done
                  ? "bg-success text-success-foreground"
                  : isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {done ? <Check className="h-4 w-4" /> : idx + 1}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold">{s.title}</p>
                <span className="shrink-0 text-[11px] font-medium text-muted-foreground">{pct}%</span>
              </div>
              <p className="truncate text-[11px] text-muted-foreground">{s.subtitle}</p>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    done ? "bg-success" : "bg-primary",
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </button>
        );
      })}
    </nav>
  );
}
