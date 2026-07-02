import { FileText, Sparkles } from "lucide-react";
import { SectionCard } from "../SectionCard";
import { TextareaInput } from "../Field";
import type { ProfileFormState } from "@/lib/profileForm";

interface Props {
  form: ProfileFormState;
  set: <K extends keyof ProfileFormState>(k: K, v: ProfileFormState[K]) => void;
}

const MIN = 200;
const MAX = 1500;

export function SopSection({ form, set }: Props) {
  const count = form.sop.trim().length;
  const ok = count >= MIN;

  return (
    <SectionCard
      icon={<FileText className="h-5 w-5" />}
      title="Statement of Purpose"
      description="Sponsors like Tata & Reliance CSR teams personally read this. Be honest, be specific."
    >
      <div className="mb-4 flex items-start gap-2 rounded-xl border border-primary/30 bg-primary-soft p-3 text-xs text-accent-foreground">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Cover: <b>your background</b>, <b>career goal</b>, <b>why you need this scholarship</b>, and <b>how you'll
          give back</b>. {MIN}–{MAX} characters.
        </p>
      </div>

      <TextareaInput
        value={form.sop}
        onChange={(e) => set("sop", e.target.value.slice(0, MAX))}
        placeholder="I come from a small town in Maharashtra where..."
        className="min-h-[260px]"
      />
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className={ok ? "text-success" : "text-muted-foreground"}>
          {ok ? "Great — minimum length reached" : `Write at least ${MIN - count} more characters`}
        </span>
        <span className="font-medium text-muted-foreground">
          {count} / {MAX}
        </span>
      </div>
    </SectionCard>
  );
}
