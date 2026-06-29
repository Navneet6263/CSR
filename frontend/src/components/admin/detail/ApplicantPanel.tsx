import { AlertTriangle } from "lucide-react";

export type Applicant = {
  name: string;
  appId: string;
  status: string;
  avatar: string;
  // Personal
  dob: string;
  gender: string;
  category: string;
  religion: string;
  nationality: string;
  bloodGroup: string;
  aadhar: string;
  pan: string;
  phone: string;
  altPhone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  permanentAddress: string;
  // Family
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  familyIncome: string;
  familySize: string;
  dependents: string;
  // Academic
  college: string;
  collegeId: string;
  course: string;
  enrollmentYear: string;
  yearSem: string;
  rollNo: string;
  admissionDate: string;
  expectedGrad: string;
  gpa: string;
  tenth: string;
  twelfth: string;
  entrance: string;
  // Financial
  tuitionFee: string;
  hostelFee: string;
  bankName: string;
  accountNo: string;
  ifsc: string;
  branch: string;
};

function Row({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`min-w-0 space-y-1 ${wide ? "col-span-2" : ""}`}>
      <div className="text-[10px] uppercase tracking-widest text-slate-400">{label}</div>
      <div className="break-words text-sm text-slate-900">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="mb-4 text-[10px] uppercase tracking-widest text-slate-400">{title}</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">{children}</div>
    </div>
  );
}

export default function ApplicantPanel({
  applicant,
  onHold,
}: {
  applicant: Applicant;
  onHold: boolean;
}) {
  const a = applicant;
  return (
    <>
      {onHold && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span className="min-w-0 break-words font-medium">
            Application is currently on HOLD by Admin.
          </span>
        </div>
      )}

      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
            {a.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-base font-semibold text-slate-900">{a.name}</div>
            <div className="text-xs text-slate-500">{a.appId}</div>
          </div>
        </div>
        <div className="mt-3 inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
          {a.status}
        </div>
      </div>

      <Section title="Personal Details">
        <Row label="DOB" value={a.dob} />
        <Row label="Gender" value={a.gender} />
        <Row label="Category" value={a.category} />
        <Row label="Religion" value={a.religion} />
        <Row label="Nationality" value={a.nationality} />
        <Row label="Blood Group" value={a.bloodGroup} />
        <Row label="Aadhar" value={a.aadhar} wide />
        <Row label="PAN" value={a.pan} />
        <Row label="Phone" value={a.phone} />
        <Row label="Alt Phone" value={a.altPhone} />
        <Row label="Email" value={a.email} wide />
        <Row label="Current Address" value={a.address} wide />
        <Row label="City" value={a.city} />
        <Row label="State" value={a.state} />
        <Row label="Pincode" value={a.pincode} />
        <Row label="Permanent Address" value={a.permanentAddress} wide />
      </Section>

      <Section title="Family Details">
        <Row label="Father's Name" value={a.fatherName} />
        <Row label="Occupation" value={a.fatherOccupation} />
        <Row label="Mother's Name" value={a.motherName} />
        <Row label="Occupation" value={a.motherOccupation} />
        <Row label="Annual Family Income" value={a.familyIncome} />
        <Row label="Family Size" value={a.familySize} />
        <Row label="Dependents" value={a.dependents} />
      </Section>

      <Section title="Academic Details">
        <Row label="College" value={a.college} wide />
        <Row label="College ID" value={a.collegeId} />
        <Row label="Roll No" value={a.rollNo} />
        <Row label="Course" value={a.course} />
        <Row label="Enrollment Year" value={a.enrollmentYear} />
        <Row label="Year / Sem" value={a.yearSem} />
        <Row label="Admission" value={a.admissionDate} />
        <Row label="Expected Grad" value={a.expectedGrad} />
        <Row label="Current GPA" value={a.gpa} />
        <Row label="10th Board" value={a.tenth} />
        <Row label="12th Board" value={a.twelfth} />
        <Row label="Entrance Score" value={a.entrance} wide />
      </Section>

      <Section title="Financials & Bank">
        <Row label="Tuition Fee" value={a.tuitionFee} />
        <Row label="Hostel Fee" value={a.hostelFee} />
        <Row label="Bank Name" value={a.bankName} wide />
        <Row label="Account No" value={a.accountNo} />
        <Row label="IFSC" value={a.ifsc} />
        <Row label="Branch" value={a.branch} wide />
      </Section>
    </>
  );
}
