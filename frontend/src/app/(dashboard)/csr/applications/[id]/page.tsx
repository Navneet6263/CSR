import { Metadata } from "next";
import { ArrowLeft, Ban, Wallet } from "lucide-react";
import { findStudent } from "@/lib/csr-data";
import StudentDetail from "@/components/csr/StudentDetail";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Applicant Review · Tata CSR",
};

export default function ApplicationReview({ params }: { params: { id: string } }) {
  const { id } = params;
  const student = findStudent(id);

  if (!student) {
    return (
      <div className="rounded-2xl border border-pink-100 bg-white p-10 text-center shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Application not found</h2>
        <p className="mt-2 text-sm text-slate-600">The application ID "{id}" doesn't exist.</p>
        <Link
          href="/csr/approvals"
          className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Back to Queue
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/csr/approvals"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-emerald-700"
      >
        <ArrowLeft size={15} /> Back to Approvals Queue
      </Link>

      <StudentDetail s={student} />

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-pink-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Required Funding Amount
            </div>
            <div className="text-2xl font-bold text-emerald-700">{student.requestedAmount}</div>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl border-2 border-rose-200 bg-white px-5 py-2.5 text-sm font-bold text-rose-600 transition hover:bg-rose-50">
              <Ban size={16} /> Hold / Reject
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:from-emerald-600 hover:to-emerald-800">
              <Wallet size={16} /> 💸 Disburse Funds (Approve)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
