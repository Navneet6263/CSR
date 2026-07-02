import { Users } from "lucide-react";
import { SectionCard } from "../SectionCard";
import { Field, TextInput, SelectInput } from "../Field";
import type { ProfileFormState } from "@/lib/profileForm";

interface Props {
  form: ProfileFormState;
  set: <K extends keyof ProfileFormState>(k: K, v: ProfileFormState[K]) => void;
}

export function FamilySection({ form, set }: Props) {
  return (
    <SectionCard
      icon={<Users className="h-5 w-5" />}
      title="Family & Demographics"
      description="Used for background verification & eligibility checks."
    >
      <h3 className="mb-3 text-sm font-semibold">Parents</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Father's Name" required>
          <TextInput value={form.fatherName} onChange={(e) => set("fatherName", e.target.value)} />
        </Field>
        <Field label="Father's Occupation" required>
          <TextInput value={form.fatherOccupation} onChange={(e) => set("fatherOccupation", e.target.value)} placeholder="e.g. Farmer, Driver" />
        </Field>
        <Field label="Mother's Name" required>
          <TextInput value={form.motherName} onChange={(e) => set("motherName", e.target.value)} />
        </Field>
        <Field label="Mother's Occupation" required>
          <TextInput value={form.motherOccupation} onChange={(e) => set("motherOccupation", e.target.value)} placeholder="e.g. Homemaker, Teacher" />
        </Field>
      </div>

      <h3 className="mt-7 mb-3 text-sm font-semibold">Household</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Number of Siblings" required>
          <TextInput value={form.siblings} onChange={(e) => set("siblings", e.target.value)} inputMode="numeric" />
        </Field>
        <Field label="Total Family Members" required>
          <TextInput value={form.familySize} onChange={(e) => set("familySize", e.target.value)} inputMode="numeric" />
        </Field>
        <Field label="Annual Family Income (₹)" required hint="Total household income">
          <TextInput value={form.annualIncome} onChange={(e) => set("annualIncome", e.target.value)} inputMode="numeric" />
        </Field>
      </div>

      <h3 className="mt-7 mb-3 text-sm font-semibold">Special Status</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Religion" required>
          <SelectInput value={form.religion} onChange={(e) => set("religion", e.target.value)}>
            <option value="">Select</option>
            <option>Hindu</option><option>Muslim</option><option>Christian</option>
            <option>Sikh</option><option>Buddhist</option><option>Jain</option><option>Other</option>
          </SelectInput>
        </Field>
        <Field label="Physical Disability">
          <SelectInput value={form.disability} onChange={(e) => set("disability", e.target.value)}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </SelectInput>
        </Field>
        {form.disability === "yes" && (
          <Field label="Disability %">
            <TextInput value={form.disabilityPercent} onChange={(e) => set("disabilityPercent", e.target.value)} inputMode="numeric" />
          </Field>
        )}
        <Field label="Domicile State" required>
          <TextInput value={form.domicileState} onChange={(e) => set("domicileState", e.target.value)} />
        </Field>
        <Field label="Domicile District" required>
          <TextInput value={form.domicileDistrict} onChange={(e) => set("domicileDistrict", e.target.value)} />
        </Field>
      </div>

      <h3 className="mt-7 mb-3 text-sm font-semibold">Certificate Numbers</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Caste Certificate Number">
          <TextInput value={form.casteCertNo} onChange={(e) => set("casteCertNo", e.target.value)} />
        </Field>
        <Field label="Caste Certificate Issue Date">
          <TextInput type="date" value={form.casteCertDate} onChange={(e) => set("casteCertDate", e.target.value)} />
        </Field>
        <Field label="Domicile Certificate Number">
          <TextInput value={form.domicileCertNo} onChange={(e) => set("domicileCertNo", e.target.value)} />
        </Field>
      </div>
    </SectionCard>
  );
}
