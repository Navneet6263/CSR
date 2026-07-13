
import type { StudentFull } from "@/lib/csr-data";
import { CheckCircle2, ShieldCheck, Award } from "lucide-react";

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function Section({ title, children, accent }: { title: string; children: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2 border-b border-pink-100 pb-3">
        <div className={`h-6 w-1.5 rounded-full ${accent ?? "bg-emerald-500"}`} />
        <h3 className="text-base font-bold tracking-tight text-slate-900">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3">{children}</div>
    </div>
  );
}

export default function StudentDetail({ s }: { s: StudentFull }) {
  return (
    <div className="space-y-6 pb-28">
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-pink-50 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 text-xl font-bold text-white shadow">
              {s.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <div className="text-xs font-mono font-semibold text-slate-500">{s.id}</div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{s.fullName}</h1>
              <div className="text-sm text-slate-600">{s.course} · {s.city}, {s.state}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge icon={CheckCircle2} label="Documents Verified" tone="emerald" />
            <Badge icon={ShieldCheck} label="Background Passed" tone="emerald" />
            <Badge icon={Award} label={`Merit ${s.meritScore}/100 · Approved`} tone="pink" />
          </div>
        </div>
      </div>

      <Section title="Personal & Contact Information">
        <Field label="Full Name" value={s.fullName} />
        <Field label="Date of Birth" value={s.dob} />
        <Field label="Gender" value={s.gender} />
        <Field label="Category" value={s.category} />
        <Field label="Aadhar Number" value={s.aadhar} />
        <Field label="Phone" value={s.phone} />
        <Field label="Alternate Phone" value={s.altPhone} />
        <Field label="Email" value={s.email} />
        <Field label="Pincode" value={s.pincode} />
        <Field label="City" value={s.city} />
        <Field label="State" value={s.state} />
        <Field label="Address" value={s.address} />
      </Section>

      <Section title="Family & Financial Background" accent="bg-pink-500">
        <Field label="Father's Name" value={s.fatherName} />
        <Field label="Mother's Name" value={s.motherName} />
        <Field label="Family Size" value={s.familySize} />
        <Field label="Declared Annual Income" value={s.annualIncome} />
      </Section>

      <Section title="Academic & College Details" accent="bg-amber-500">
        <Field label="10th Board" value={s.tenthBoard} />
        <Field label="10th Marks" value={s.tenthMarks} />
        <Field label="12th Board" value={s.twelfthBoard} />
        <Field label="12th Marks" value={s.twelfthMarks} />
        <Field label="Current Course" value={s.course} />
        <Field label="Enrollment Year" value={s.enrollmentYear} />
        <Field label="Current Semester" value={s.currentSemMarks} />
        <Field label="College Tuition Fee" value={s.tuitionFee} />
        <Field label="Requested Funding" value={s.requestedAmount} />
      </Section>
    </div>
  );
}

function Badge({ icon: Icon, label, tone }: { icon: any; label: string; tone: "emerald" | "pink" }) {
  const cls = tone === "emerald" ? "bg-emerald-100 text-emerald-800" : "bg-pink-100 text-pink-800";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
      <Icon size={13} /> {label}
    </span>
  );
}
