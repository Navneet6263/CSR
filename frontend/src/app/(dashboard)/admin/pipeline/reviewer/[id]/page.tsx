'use client';

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import ApplicantPanel from "@/components/admin/detail/ApplicantPanel";
import AdminOverride from "@/components/admin/detail/AdminOverride";
import DocumentViewer from "@/components/admin/detail/DocumentViewer";
import CheckerLog from "@/components/admin/detail/CheckerLog";


const APPLICANT = {
  name: "Ananya Sharma",
  appId: "APP-1042",
  status: "Pending Document Check",
  avatar: "AS",
  dob: "12 Mar 2004",
  gender: "Female",
  category: "OBC",
  religion: "Hindu",
  nationality: "Indian",
  bloodGroup: "B+",
  aadhar: "XXXX-XXXX-4412",
  pan: "ABCDE1234F",
  phone: "+91 98215 44012",
  altPhone: "+91 98215 99001",
  email: "ananya.sharma@univ.ac.in",
  address: "Plot 14, Sector 9, Kothrud",
  city: "Pune",
  state: "Maharashtra",
  pincode: "411045",
  permanentAddress: "Village Khedi, Tehsil Junnar, Pune 412412",
  fatherName: "Ravi Sharma",
  fatherOccupation: "Farmer",
  motherName: "Sunita Sharma",
  motherOccupation: "Homemaker",
  familyIncome: "₹ 1,80,000 / yr",
  familySize: "5",
  dependents: "4",
  college: "Fergusson College, Pune",
  collegeId: "FC-2022-CS-091",
  course: "B.Sc. Computer Science",
  enrollmentYear: "2022",
  yearSem: "2nd Year / Sem 4",
  rollNo: "CS22B091",
  admissionDate: "08 Aug 2022",
  expectedGrad: "May 2025",
  gpa: "8.6 / 10",
  tenth: "CBSE · 92.4% (2020)",
  twelfth: "Maharashtra · 88.6% (2022)",
  entrance: "MHT-CET · 96.2 percentile",
  tuitionFee: "₹ 62,000 / yr",
  hostelFee: "₹ 48,000 / yr",
  bankName: "State Bank of India",
  accountNo: "3982 1100 4412",
  ifsc: "SBIN0004412",
  branch: "Pune Camp",
};

export default function ApplicationDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const [onHold, setOnHold] = useState(false);
  const [holdReason, setHoldReason] = useState("");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/pipeline/reviewer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          Back to Document Checkers
        </Link>
        <span className="text-[10px] uppercase tracking-widest text-slate-400">
          Application / {id}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-4">
          <ApplicantPanel applicant={{ ...APPLICANT, appId: id }} onHold={onHold} />
          <AdminOverride
            onHold={onHold}
            reason={holdReason}
            onReasonChange={setHoldReason}
            onPlaceHold={() => setOnHold(true)}
            onReleaseHold={() => setOnHold(false)}
          />
        </div>

        <div className="space-y-5 lg:col-span-8">
          <DocumentViewer locked={onHold} />
          <CheckerLog />
        </div>
      </div>
    </div>
  );
}
