import { GraduationCap } from "lucide-react";
import { SectionCard } from "../SectionCard";
import { Field, TextInput, SelectInput } from "../Field";
import type { ProfileFormState } from "@/lib/profileForm";

interface Props {
  form: ProfileFormState;
  set: <K extends keyof ProfileFormState>(k: K, v: ProfileFormState[K]) => void;
}

export function EducationSection({ form, set }: Props) {
  return (
    <SectionCard
      icon={<GraduationCap className="h-5 w-5" />}
      title="Education Background"
      description="Drives academic merit scoring for matched scholarships."
    >
      <h3 className="mb-3 text-sm font-semibold">Past Academics</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="10th Board" required>
          <SelectInput value={form.board10} onChange={(e) => set("board10", e.target.value)}>
            <option value="">Select</option>
            <option>CBSE</option><option>ICSE</option><option>State Board</option><option>Other</option>
          </SelectInput>
        </Field>
        <Field label="10th Passing Year" required>
          <TextInput value={form.year10} onChange={(e) => set("year10", e.target.value)} inputMode="numeric" maxLength={4} />
        </Field>
        <Field label="10th Marks (%)" required>
          <TextInput value={form.marks10} onChange={(e) => set("marks10", e.target.value)} inputMode="decimal" />
        </Field>
        <Field label="12th Board" required>
          <SelectInput value={form.board12} onChange={(e) => set("board12", e.target.value)}>
            <option value="">Select</option>
            <option>CBSE</option><option>ICSE</option><option>State Board</option><option>Other</option>
          </SelectInput>
        </Field>
        <Field label="12th Passing Year" required>
          <TextInput value={form.year12} onChange={(e) => set("year12", e.target.value)} inputMode="numeric" maxLength={4} />
        </Field>
        <Field label="12th Marks (%)" required>
          <TextInput value={form.marks12} onChange={(e) => set("marks12", e.target.value)} inputMode="decimal" />
        </Field>
      </div>

      <h3 className="mt-7 mb-3 text-sm font-semibold">Current Degree</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="College / Institution" required>
          <SelectInput value={form.college} onChange={(e) => set("college", e.target.value)}>
            <option value="">Select institution</option>
            <option>COEP Pune</option>
            <option>IIT Bombay</option>
            <option>VJTI Mumbai</option>
            <option>NIT Surat</option>
            <option>Other</option>
          </SelectInput>
        </Field>
        <Field label="Course" required>
          <SelectInput value={form.course} onChange={(e) => set("course", e.target.value)}>
            <option value="">Select</option>
            <option>B.Tech</option><option>B.Sc</option><option>B.Com</option>
            <option>B.A</option><option>MBBS</option><option>Other</option>
          </SelectInput>
        </Field>
        <Field label="Current Semester" required>
          <TextInput value={form.semester} onChange={(e) => set("semester", e.target.value)} inputMode="numeric" />
        </Field>
        <Field label="Admission / Registration No" required>
          <TextInput value={form.regNo} onChange={(e) => set("regNo", e.target.value)} />
        </Field>
        <Field label="Previous Year Marks (%)" required>
          <TextInput value={form.prevMarks} onChange={(e) => set("prevMarks", e.target.value)} inputMode="decimal" />
        </Field>
      </div>

      <h3 className="mt-7 mb-3 text-sm font-semibold">Accommodation & Gaps</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Accommodation" required>
          <SelectInput value={form.accommodation} onChange={(e) => set("accommodation", e.target.value)}>
            <option value="">Select</option>
            <option value="home">Living at home</option>
            <option value="hostel">Hosteller</option>
            <option value="pg">PG / Rented</option>
          </SelectInput>
        </Field>
        <Field label="Distance from home to college (km)" required>
          <TextInput value={form.distanceKm} onChange={(e) => set("distanceKm", e.target.value)} inputMode="numeric" />
        </Field>
        <Field label="Any gap year?">
          <SelectInput value={form.gapYear} onChange={(e) => set("gapYear", e.target.value)}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </SelectInput>
        </Field>
        {form.gapYear === "yes" && (
          <Field label="Reason for gap">
            <TextInput value={form.gapReason} onChange={(e) => set("gapReason", e.target.value)} placeholder="Briefly explain" />
          </Field>
        )}
        <Field label="Received any previous scholarship?">
          <SelectInput value={form.prevScholarship} onChange={(e) => set("prevScholarship", e.target.value)}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </SelectInput>
        </Field>
        {form.prevScholarship === "yes" && (
          <Field label="Details (source, amount, year)">
            <TextInput value={form.prevScholarshipDetails} onChange={(e) => set("prevScholarshipDetails", e.target.value)} placeholder="e.g. NSP, ₹12,000, 2024" />
          </Field>
        )}
      </div>
    </SectionCard>
  );
}
