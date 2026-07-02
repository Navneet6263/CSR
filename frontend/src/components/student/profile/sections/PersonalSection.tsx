import { User } from "lucide-react";
import { SectionCard } from "../SectionCard";
import { Field, TextInput, SelectInput } from "../Field";
import type { ProfileFormState } from "@/lib/profileForm";

interface Props {
  form: ProfileFormState;
  set: <K extends keyof ProfileFormState>(k: K, v: ProfileFormState[K]) => void;
}

export function PersonalSection({ form, set }: Props) {
  return (
    <SectionCard
      icon={<User className="h-5 w-5" />}
      title="Personal Details"
      description="Identity proof & where we can reach you."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone Number" required>
          <TextInput value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="10-digit mobile" inputMode="numeric" maxLength={10} />
        </Field>
        <Field label="Alternate Phone (Parent)" hint="In case we can't reach you">
          <TextInput value={form.altPhone} onChange={(e) => set("altPhone", e.target.value)} placeholder="Parent's number" inputMode="numeric" maxLength={10} />
        </Field>
        <Field label="Aadhaar Number" required>
          <TextInput value={form.aadhaar} onChange={(e) => set("aadhaar", e.target.value)} placeholder="12-digit Aadhaar" inputMode="numeric" maxLength={12} />
        </Field>
        <Field label="Date of Birth" required>
          <TextInput type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} />
        </Field>
        <Field label="Gender" required>
          <SelectInput value={form.gender} onChange={(e) => set("gender", e.target.value)}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </SelectInput>
        </Field>
        <Field label="Category" required>
          <SelectInput value={form.category} onChange={(e) => set("category", e.target.value)}>
            <option value="">Select</option>
            <option>General</option>
            <option>OBC</option>
            <option>SC</option>
            <option>ST</option>
          </SelectInput>
        </Field>
      </div>

      <h3 className="mt-7 mb-3 text-sm font-semibold">Current Address</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="House No / Street" required className="sm:col-span-2">
          <TextInput value={form.curHouse} onChange={(e) => set("curHouse", e.target.value)} placeholder="Flat, building, street" />
        </Field>
        <Field label="City" required>
          <TextInput value={form.curCity} onChange={(e) => set("curCity", e.target.value)} />
        </Field>
        <Field label="State" required>
          <TextInput value={form.curState} onChange={(e) => set("curState", e.target.value)} />
        </Field>
        <Field label="Pincode" required>
          <TextInput value={form.curPincode} onChange={(e) => set("curPincode", e.target.value)} inputMode="numeric" maxLength={6} />
        </Field>
        <Field label="Months at this address" required>
          <TextInput value={form.curMonths} onChange={(e) => set("curMonths", e.target.value)} placeholder="e.g. 24" inputMode="numeric" />
        </Field>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-muted/40 p-3">
        <div>
          <p className="text-sm font-semibold">Permanent address same as current?</p>
          <p className="text-xs text-muted-foreground">Toggle off to add separately</p>
        </div>
        <button
          type="button"
          onClick={() => set("sameAddress", !form.sameAddress)}
          className={`relative h-6 w-11 rounded-full transition ${form.sameAddress ? "bg-primary" : "bg-muted-foreground/30"}`}
          aria-pressed={form.sameAddress}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${form.sameAddress ? "left-[22px]" : "left-0.5"}`} />
        </button>
      </div>

      {!form.sameAddress && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="House No / Street" className="sm:col-span-2">
            <TextInput value={form.permHouse} onChange={(e) => set("permHouse", e.target.value)} />
          </Field>
          <Field label="City"><TextInput value={form.permCity} onChange={(e) => set("permCity", e.target.value)} /></Field>
          <Field label="State"><TextInput value={form.permState} onChange={(e) => set("permState", e.target.value)} /></Field>
          <Field label="Pincode"><TextInput value={form.permPincode} onChange={(e) => set("permPincode", e.target.value)} inputMode="numeric" maxLength={6} /></Field>
        </div>
      )}
    </SectionCard>
  );
}
