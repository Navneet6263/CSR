import { CheckCircle2, FolderUp, Upload } from "lucide-react";
import { SectionCard } from "../SectionCard";
import { DOC_LIST, type ProfileFormState, type DocKey } from "@/lib/profileForm";
import { cn } from "@/lib/utils";

interface Props {
  form: ProfileFormState;
  set: <K extends keyof ProfileFormState>(k: K, v: ProfileFormState[K]) => void;
}

export function DocumentsSection({ form, set }: Props) {
  const toggle = (id: DocKey) => {
    set("documents", { ...form.documents, [id]: !form.documents[id] });
  };

  return (
    <SectionCard
      icon={<FolderUp className="h-5 w-5" />}
      title="Documents"
      description="Upload clear scans (PDF or JPG). Each file under 5 MB."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {DOC_LIST.map((d) => {
          const uploaded = form.documents[d.id];
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => toggle(d.id)}
              aria-pressed={uploaded}
              className={cn(
                "group flex items-start gap-3 rounded-xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md",
                uploaded
                  ? "border-success/50 bg-success-soft/60"
                  : "border-border bg-card hover:border-primary/40",
              )}
            >
              <div
                className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-lg transition",
                  uploaded ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {uploaded ? <CheckCircle2 className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">{d.name}</p>
                  {d.required ? (
                    <span className="rounded-full bg-destructive-soft px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                      Required
                    </span>
                  ) : (
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Optional
                    </span>
                  )}
                </div>
                <p className="truncate text-[11px] text-muted-foreground">{d.hint}</p>
                <span
                  className={cn(
                    "mt-2 inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold transition",
                    uploaded
                      ? "bg-card text-foreground group-hover:bg-muted"
                      : "bg-primary text-primary-foreground group-hover:opacity-90",
                  )}
                >
                  {uploaded ? "Uploaded — tap to replace" : "Tap to upload"}
                </span>
              </div>
              {/* Toggle switch (visual state) */}
              <span
                className={cn(
                  "relative mt-1 h-5 w-9 shrink-0 rounded-full transition",
                  uploaded ? "bg-success" : "bg-muted-foreground/30",
                )}
                aria-hidden="true"
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all",
                    uploaded ? "left-[18px]" : "left-0.5",
                  )}
                />
              </span>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}
