'use client';

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ApplicantBento from "@/components/admin/detail/ApplicantBento";
import AuditTrail from "@/components/admin/detail/AuditTrail";
import ScreenerRubric from "@/components/admin/detail/ScreenerRubric";


export default function ScreenerDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/pipeline/screener"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          Back to Screening Officers
        </Link>
        <span className="text-[10px] uppercase tracking-widest text-slate-400">
          Application / {id}
        </span>
      </div>

      <ApplicantBento />
      <AuditTrail />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="text-[10px] uppercase tracking-widest text-slate-400">Context</div>
            <h2 className="mt-1 text-base font-semibold text-slate-900">
              You are the final decision point.
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Documents and background verification have been independently cleared. Use the rubric on
              the right to weigh need and merit, then record a justification that will be permanently
              attached to this application's audit trail.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>· Cross-check the audit summaries above before scoring.</li>
              <li>· Waitlist if the cohort cap is reached this cycle.</li>
              <li>· Reject only when policy violations are documented.</li>
            </ul>
          </div>
        </div>
        <div className="lg:col-span-5">
          <ScreenerRubric />
        </div>
      </div>
    </div>
  );
}
