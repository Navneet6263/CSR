'use client';

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import StudentInfoCard from "@/components/admin/detail/StudentInfoCard";
import VerifiedDocsAccordion from "@/components/admin/detail/VerifiedDocsAccordion";
import VerificationMatrix from "@/components/admin/detail/VerificationMatrix";


export default function BgCheckerDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/pipeline/bgchecker"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          Back to Background Checkers
        </Link>
        <span className="text-[10px] uppercase tracking-widest text-slate-400">
          Application / {id}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-4">
          <StudentInfoCard
            name="Ananya Sharma"
            appId={id}
            address="Plot 14, Sector 9, Pune, Maharashtra 411045"
            college="Fergusson College, Pune"
            course="B.Sc. Computer Science"
            income="₹ 1,80,000 / yr"
            phone="+91 98215 44012"
          />
          <VerifiedDocsAccordion />
        </div>

        <div className="lg:col-span-8">
          <VerificationMatrix />
        </div>
      </div>
    </div>
  );
}
