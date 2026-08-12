'use client';

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CircleDashed,
  IndianRupee,
  UserCheck,
} from "lucide-react";
import { ApplicationTimeline } from "@/components/student/applications_new/ApplicationTimeline";
import { DocBadge, mapStudentApplicationDetail, MetaTile, type StudentApplicationDetail } from '@/components/student/applications/ApplicationDetailPresentation';
import { applicationApi } from "@/lib/api";

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const [appData, setAppData] = useState<StudentApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApp() {
      try {
        const res = await applicationApi.getById(Number(id));
        const data = res.data as Record<string, any>;
        if (!data) return;

        setAppData(mapStudentApplicationDetail(data));
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
              {appData.submittedDocs.map((d) => (
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
          <div className="rounded-2xl border border-border bg-muted/40 p-5 text-xs text-muted-foreground shadow-sm">Need help? Contact the portal administrator through your registered support channel.</div>
        </aside>
      </div>
    </main>
  );
}
