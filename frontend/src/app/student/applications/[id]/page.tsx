'use client';

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  CircleDashed,
  IndianRupee,
  UserCheck,
  XCircle,
} from "lucide-react";
import { ApplicationTimeline } from "@/components/student/applications_new/ApplicationTimeline";
import { applicationApi } from "@/lib/api";

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const [appData, setAppData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApp() {
      try {
        const res = await applicationApi.getById(Number(id));
        const data = res.data;
        if (!data) return;

        // Map status
        const st = data.Status || data.status;
        let mappedStatus = 'Pending';
        if (st === 'Approved' || st === 'Disbursed') mappedStatus = 'Funded';
        else if (st === 'Rejected') mappedStatus = 'Rejected';
        else if (st === 'DocVerification' || st === 'BGCheck' || st === 'CommitteeReview') mappedStatus = 'Under Review';
        
        let progressPct = 20;
        let activeIdx = 0;
        if (st === 'DocVerification') { activeIdx = 1; progressPct = 40; }
        else if (st === 'BGCheck') { activeIdx = 2; progressPct = 60; }
        else if (st === 'CommitteeReview') { activeIdx = 3; progressPct = 80; }
        else if (st === 'Approved' || st === 'Disbursed') { activeIdx = 4; progressPct = 100; }
        else if (st === 'Rejected') { activeIdx = 1; progressPct = 40; }

        const baseSteps = [
          { key: "submitted", label: "Submitted", note: "Application received" },
          { key: "review", label: "Doc Review", note: "Verifying attached proofs" },
          { key: "bg", label: "Background Check", note: "Home or tele-verification" },
          { key: "committee", label: "Committee", note: "Final CSR decision" },
          { key: "funded", label: "Funded", note: "Grant disbursed" },
        ];

        const timeline = baseSteps.map((s, idx) => ({
          ...s,
          status: st === 'Rejected' && idx === activeIdx ? 'rejected' 
                : idx < activeIdx ? "complete" 
                : (idx === activeIdx ? "current" : "pending")
        }));

        const amt = data.ScholarshipAmount || data.scholarshipAmount;
        setAppData({
          id: data.ApplicationID || data.id,
          scholarship: data.ScholarshipName || data.scholarshipName || "Scholarship Grant",
          provider: "TalentBridge Partner",
          category: "Merit / Need-based",
          status: mappedStatus,
          amount: amt ? `₹${amt}` : "Variable",
          appliedOn: new Date(data.CreatedAt || data.createdAt).toLocaleDateString(),
          currentStage: st,
          reviewer: "CSR Officer",
          progressPct,
          nextAction: mappedStatus === 'Funded' ? "Check your bank account for disbursement." : mappedStatus === 'Rejected' ? "Application was declined." : "Wait for the review committee to process your documents.",
          disbursedOn: st === 'Disbursed' ? new Date().toLocaleDateString() : null,
          timeline,
          submittedDocs: [
            { name: "Aadhaar Card", status: "verified" },
            { name: "10th Marksheet", status: "verified" },
            { name: "12th Marksheet", status: "verified" },
            { name: "Income Certificate", status: st === 'DocVerification' ? 'pending' : 'verified' },
          ]
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadApp();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen p-8 text-center text-muted-foreground">Loading application...</div>;
  }

  if (!appData) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Application not found.{" "}
        <Link href="/student/applications" className="text-primary underline">
          Go back
        </Link>
      </div>
    );
  }

  const statusTone =
    appData.status === "Funded"
      ? "bg-success text-success-foreground"
      : appData.status === "Rejected"
        ? "bg-destructive text-destructive-foreground"
        : appData.status === "Under Review"
          ? "bg-info text-white"
          : "bg-warning text-warning-foreground";

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Link
        href="/student/applications"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> All applications
      </Link>

      <section
        className="relative overflow-hidden rounded-2xl p-5 text-primary-foreground sm:p-7 shadow-lg"
        style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-glow)" }}
      >
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium backdrop-blur shadow-sm">
              #{appData.id} • {appData.category}
            </span>
            <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">{appData.scholarship}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-white/85">
              <Building2 className="h-3.5 w-3.5" /> by {appData.provider}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${statusTone}`}>
            {appData.status}
          </span>
        </div>

        <div className="relative mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetaTile icon={<IndianRupee className="h-4 w-4" />} label="Amount" value={appData.amount} />
          <MetaTile
            icon={<Calendar className="h-4 w-4" />}
            label="Applied on"
            value={appData.appliedOn}
          />
          <MetaTile
            icon={<CircleDashed className="h-4 w-4" />}
            label="Current stage"
            value={appData.currentStage}
          />
          <MetaTile
            icon={<UserCheck className="h-4 w-4" />}
            label="Reviewer"
            value={appData.reviewer ?? "—"}
          />
        </div>

        <div className="relative mt-5">
          <div className="mb-1.5 flex items-center justify-between text-xs text-white/85">
            <span>Overall progress</span>
            <span className="font-semibold">{appData.progressPct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all duration-500 ease-out"
              style={{ width: `${appData.progressPct}%` }}
            />
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">Application timeline</h2>
            <p className="mb-4 text-xs text-muted-foreground">
              Track every stage from submission to funding.
            </p>
            <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-muted" />}>
              <ApplicationTimeline events={appData.timeline} />
            </Suspense>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">Documents submitted</h2>
            <p className="mb-4 text-xs text-muted-foreground">
              Files attached to this application.
            </p>
            <ul className="divide-y divide-border">
              {appData.submittedDocs.map((d: any) => (
                <li key={d.name} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{d.name}</p>
                    {d.reason && (
                      <p className="text-xs text-destructive">{d.reason}</p>
                    )}
                  </div>
                  <DocBadge status={d.status} />
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground">What happens next</h3>
            <p className="mt-2 text-sm text-muted-foreground">{appData.nextAction}</p>
            {appData.disbursedOn && (
              <p className="mt-3 rounded-lg bg-success-soft px-3 py-2 text-xs font-medium text-success border border-success-soft">
                Disbursed on {appData.disbursedOn}
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-border bg-muted/40 p-5 text-xs text-muted-foreground shadow-sm">
            Need help? Reach out at{" "}
            <a href="mailto:support@talentbridge.in" className="text-primary font-medium hover:underline">
              support@talentbridge.in
            </a>
          </div>
        </aside>
      </div>
    </main>
  );
}

function MetaTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 p-3 backdrop-blur shadow-sm">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-white/80">
        {icon} {label}
      </div>
      <p className="mt-1 truncate text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function DocBadge({ status }: { status: "verified" | "pending" | "rejected" }) {
  if (status === "verified")
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-medium text-success">
        <CheckCircle2 className="h-3 w-3" /> Verified
      </span>
    );
  if (status === "rejected")
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-destructive-soft px-2 py-0.5 text-[11px] font-medium text-destructive">
        <XCircle className="h-3 w-3" /> Rejected
      </span>
    );
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-medium text-warning-foreground">
      <CircleDashed className="h-3 w-3" /> Pending
    </span>
  );
}
