import { Landmark } from "lucide-react";
import { SectionCard } from "../SectionCard";
import { Field, TextInput } from "../Field";
import type { ProfileFormState } from "@/lib/profileForm";

interface Props {
  form: ProfileFormState;
  set: <K extends keyof ProfileFormState>(k: K, v: ProfileFormState[K]) => void;
}

export function BankSection({ form, set }: Props) {
  return (
    <SectionCard
      icon={<Landmark className="h-5 w-5" />}
      title="Bank Details"
      description="Approved scholarship amount is transferred directly (DBT) to this account."
    >
      <div className="mb-5 rounded-xl border border-warning/40 bg-warning-soft p-3 text-xs text-warning-foreground">
        Account must be in <b>your name</b>. Joint accounts with parents are accepted only if you are a minor.
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Bank Account Number" required>
          <TextInput value={form.bankAccount} onChange={(e) => set("bankAccount", e.target.value)} inputMode="numeric" />
        </Field>
        <Field label="IFSC Code" required hint="11 characters, e.g. SBIN0001234">
          <TextInput value={form.ifsc} onChange={(e) => set("ifsc", e.target.value.toUpperCase())} maxLength={11} />
        </Field>
        <Field label="Bank Name" required>
          <TextInput value={form.bankName} onChange={(e) => set("bankName", e.target.value)} placeholder="e.g. State Bank of India" />
        </Field>
        <Field label="Branch Name" required>
          <TextInput value={form.branch} onChange={(e) => set("branch", e.target.value)} placeholder="e.g. Pune Main Branch" />
        </Field>
      </div>
    </SectionCard>
  );
}
