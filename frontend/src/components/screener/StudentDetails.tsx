import type { Application } from "@/lib/screening-data";
import { fmtINR } from "./QueueTable";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-text-dim">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-text">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <div className="h-px flex-1 bg-gradient-to-r from-brand/20 to-transparent" />
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold">{title}</h4>
        <div className="h-px flex-1 bg-gradient-to-l from-brand/20 to-transparent" />
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3 lg:grid-cols-4">{children}</div>
    </div>
  );
}

export function StudentDetails({ app }: { app: Application }) {
  return (
    <div className="glass-card space-y-8 p-6">
      <Section title="Personal">
        <Field label="Full Name" value={app.name} />
        <Field label="Date of Birth" value={app.dob} />
        <Field label="Gender" value={app.gender} />
        <Field label="Category" value={<span className="rounded bg-brand/20 px-1.5 py-0.5 font-mono text-xs text-brand">{app.category}</span>} />
        <Field label="Aadhaar" value={<span className="font-mono">{app.aadhar}</span>} />
      </Section>
      <Section title="Contact">
        <Field label="Phone" value={app.phone} />
        <Field label="Alternate" value={app.altPhone} />
        <Field label="Email" value={app.email} />
        <Field label="Pincode" value={app.pincode} />
        <div className="col-span-2 md:col-span-3 lg:col-span-4">
          <Field label="Address" value={`${app.address}, ${app.city}, ${app.state} - ${app.pincode}`} />
        </div>
      </Section>
      <Section title="Family">
        <Field label="Father's Name" value={app.fatherName} />
        <Field label="Mother's Name" value={app.motherName} />
        <Field label="Family Size" value={app.familySize} />
        <Field label="Declared Annual Income" value={<span className="text-gold">{fmtINR(app.income)}</span>} />
      </Section>
      <Section title="Academic">
        <Field label="10th Board" value={app.board10} />
        <Field label="10th Marks" value={<span className="font-mono">{app.marks10}%</span>} />
        <Field label="12th Board" value={app.board12} />
        <Field label="12th Marks" value={<span className="font-mono">{app.marks12}%</span>} />
        <Field label="Current Course" value={app.course} />
        <Field label="Enrollment Year" value={app.enrollmentYear} />
        <Field label="Current Semester" value={`${app.currentSemester} · ${app.semesterMarks}%`} />
        <Field label="Tuition Fee (Annual)" value={fmtINR(app.tuitionFee)} />
      </Section>
    </div>
  );
}
