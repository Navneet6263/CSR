"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, GraduationCap, IndianRupee } from "lucide-react";
import { findApplication } from "@/lib/screening-data";
import { StudentDetails } from "@/components/screener/StudentDetails";
import { DocumentsChecklist, BackgroundCheck } from "@/components/screener/DocumentsChecklist";
import { RubricCard, ScoreDial } from "@/components/screener/RubricCard";
import { ActionBar } from "@/components/screener/ActionBar";
import { Toast } from "@/components/screener/Toast";
import { fmtINR } from "@/components/screener/QueueTable";
import { ScreenerHeader } from "@/components/screener/ScreenerHeader";

export default function EvaluateApplicationPage() {
  const params = useParams();
  const app = findApplication(params.id as string);
  const [toast, setToast] = useState<{ msg: string; tone: "success" | "danger" } | null>(null);
  const [finalStatus, setFinalStatus] = useState<null | "approve" | "reject">(null);

  if (!app) {
    return (
      <div className="screener-theme flex flex-col min-h-screen">
        <ScreenerHeader />
        <div className="flex flex-1 items-center justify-center text-text-muted">Application not found.</div>
      </div>
    );
  }

  const onSubmitted = (decision: "approve" | "reject") => {
    setFinalStatus(decision);
    setToast({
      msg: decision === "approve"
        ? `${app.name} approved — forwarded to CSR Partner for disbursement.`
        : `${app.name} marked as ineligible. Applicant will be notified.`,
      tone: decision === "approve" ? "success" : "danger",
    });
  };

  return (
    <div className="screener-theme flex flex-col min-h-screen" style={{ background: "radial-gradient(1200px 800px at 10% -10%, oklch(0.92 0.08 350 / 0.55), transparent 60%), radial-gradient(900px 700px at 100% 0%, oklch(0.9 0.1 340 / 0.35), transparent 55%), oklch(0.99 0.008 350)" }}>
      <ScreenerHeader />
      <main className="mx-auto w-full max-w-[1400px] px-6 py-8 space-y-6 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/screener" className="flex items-center gap-2 text-xs text-text-muted hover:text-text">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to queue
          </Link>
          {finalStatus && (
            <div className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${
              finalStatus === "approve" ? "border-success/40 bg-success/10 text-success"
                : "border-danger/40 bg-danger/10 text-danger"
            }`}>
              Decision recorded · {finalStatus === "approve" ? "Approved" : "Rejected"}
            </div>
          )}
        </div>

        {/* HERO */}
        <div className="glass-card grid-lines-bg relative overflow-hidden p-7">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-gold">
                <GraduationCap className="h-3.5 w-3.5" /> {app.scholarship}
              </div>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-text">{app.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-text-muted">
                <span className="font-mono">{app.id}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Submitted {app.submittedAt}</span>
                <span className="rounded-full bg-brand/5 px-2 py-0.5 text-text">{app.category}</span>
                <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" />{fmtINR(app.income)} / yr</span>
              </div>
            </div>
            <ScoreDial score={app.meritScore} />
          </div>
        </div>

        <StudentDetails app={app} />

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <DocumentsChecklist docs={app.documents} />
          <BackgroundCheck report={app.fieldReport} />
        </div>

        <RubricCard app={app} />

        {!finalStatus && <ActionBar onSubmitted={onSubmitted} />}

        {toast && <Toast message={toast.msg} tone={toast.tone} onClose={() => setToast(null)} />}
      </main>
    </div>
  );
}
