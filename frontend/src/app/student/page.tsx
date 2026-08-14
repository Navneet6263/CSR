'use client';

import { Suspense, useEffect, useState } from "react";
import { WelcomeBanner } from "@/components/student/dashboard/WelcomeBanner";
import { StatsGrid } from "@/components/student/dashboard/StatsGrid";
import { ProgressStepper } from "@/components/student/dashboard/ProgressStepper";
import { NotificationsFeed } from "@/components/student/dashboard/NotificationsFeed";
import { ApplicationsTable } from "@/components/student/dashboard/ApplicationsTable";
import { authApi, applicationApi, notificationApi, scholarshipApi, studentApi } from "@/lib/api";
import type { DashboardApplication, DashboardNotification } from '@/types/dashboard';

function Skeleton({ h = "h-40" }: { h?: string }) {
  return <div className={`${h} animate-pulse rounded-2xl bg-muted`} />;
}

export default function StudentDashboard() {
  const [stats, setStats] = useState<any[]>([]);
  const [recentApps, setRecentApps] = useState<DashboardApplication[]>([]);
  const [progressSteps, setProgressSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentProfileData, setStudentProfileData] = useState<any>(null);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [activeApplicationName, setActiveApplicationName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const u = authApi.getUser();
        const [profRes, appsRes, scholsRes, docsRes, notificationRes] = await Promise.all([
          studentApi.getProfile(), applicationApi.getMy('page=1&limit=10'),
          scholarshipApi.getAll('status=Active&page=1&limit=1'), studentApi.getDocuments(), notificationApi.list(),
        ]);

        const apps = appsRes.data?.applications || [];
        const schols = scholsRes.data?.scholarships || scholsRes.data || [];
        const openScholarshipCount = Number(scholsRes.data?.pagination?.total ?? (Array.isArray(schols) ? schols.length : 0));
        const prof = profRes.data;
        setNotifications((notificationRes.data ?? []).map((item) => ({ id: String(item.NotificationID),
          title: item.Type.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase()),
          body: item.Message, time: new Date(item.CreatedAt).toLocaleString('en-IN'),
          type: /REUPLOAD|REQUIRED|FAILED|REJECT/i.test(item.Type) ? 'action'
            : /COMPLETE|APPROVED|FUNDED/i.test(item.Type) ? 'success' : 'info' })));

        // Completion reflects the core fields required before an application can be reviewed.
        const completion = Number(prof?.profileCompletion ?? 0);

        setStudentProfileData({
          name: u?.fullName ?? "",
          profileCompletion: completion,
          classLevel: prof?.currentSemesterOrYear || prof?.course || "Not provided",
          stream: prof?.course || "Not provided",
          gender: prof?.gender?.toLowerCase() || "other",
          annualIncome: prof?.annualFamilyIncome || 0,
          category: prof?.category || "",
          state: prof?.state || "",
        });

        const totalFunded = apps
          .filter((a: any) => (a.Status || a.status) === 'PaymentCompleted')
          .reduce((acc: number, a: any) => acc + ((a.ScholarshipAmount || a.scholarshipAmount) || 0), 0);

        const activeCount = apps.filter((a: any) => {
          const st = a.Status || a.status;
          return !['EligibilityFailed', 'ScreeningRejected', 'CSRDeclined', 'PaymentCompleted', 'Cancelled'].includes(st);
        }).length;
        
        const reviewCount = apps.filter((a: any) => {
          const st = a.Status || a.status;
          return ['DocAuditInProgress', 'BGCheckInProgress', 'ScreeningPending', 'CSRPending'].includes(st);
        }).length;
        
        const documents = docsRes.data || [];
        const docsUploaded = documents.length;

        setStats([
          { 
            id: "active", 
            label: "Active Applications", 
            value: activeCount.toString(), 
            hint: reviewCount > 0 ? `${reviewCount} in review` : "Currently tracking", 
            tone: "primary" 
          },
          { 
            id: "docs", 
            label: "Documents Uploaded", 
            value: String(docsUploaded),
            hint: "Secure uploads",
            tone: docsUploaded > 0 ? "success" : "warning"
          },
          { 
            id: "open", 
            label: "Open Scholarships", 
            value: openScholarshipCount.toString(),
            hint: "Currently accepting applications",
            tone: "neutral" 
          },
          { 
            id: "funded", 
            label: "Amount Received", 
            value: `₹${totalFunded.toLocaleString('en-IN')}`, 
            hint: "This year", 
            tone: "success" 
          },
        ]);

        setRecentApps(apps.slice(0, 10).map((a: any): DashboardApplication => {
          const st = a.Status || a.status;
          const amt = a.ScholarshipAmount || a.scholarshipAmount;
          return {
            id: String(a.applicationId ?? a.ApplicationID ?? a.id ?? ''),
            scholarship: a.ScholarshipName || a.scholarshipName || "",
            appliedOn: new Date(a.CreatedAt || a.createdAt).toLocaleDateString(),
            currentStage: st,
            amount: amt ? `₹${amt}` : "Variable",
            status: st === 'PaymentCompleted' ? 'Funded'
              : ['EligibilityFailed', 'ScreeningRejected', 'CSRDeclined', 'Cancelled'].includes(st) ? 'Rejected'
                : st === 'Draft' ? 'Pending' : 'Under Review'
          };
        }).filter((application) => Boolean(application.id)));

        // Setup progress stepper for most recent app
        const lastApp = apps[0];
        const baseSteps = [
          { key: "registration", label: "Registration" },
          { key: "documents", label: "Documents" },
          { key: "auto_match", label: "Auto-Match" },
          { key: "doc_audit", label: "Doc Audit" },
          { key: "bg_check", label: "BG Check" },
          { key: "screening", label: "Screening" },
          { key: "csr_approval", label: "CSR Approval" },
          { key: "funded", label: "Funded" },
        ];
        
        let activeIdx = 0;
        if (lastApp) {
          const lst = lastApp.status;
          setActiveApplicationName(lastApp.scholarshipName || `APP-${lastApp.applicationId}`);
          if (['Submitted', 'AutoMatched', 'DocAuditInProgress', 'DocAuditComplete'].includes(lst)) activeIdx = 3;
          else if (['BGCheckInProgress', 'BGCheckComplete'].includes(lst)) activeIdx = 4;
          else if (['ScreeningPending', 'ScreeningApproved', 'ScreeningRejected'].includes(lst)) activeIdx = 5;
          else if (['CSRPending', 'CSRApproved', 'CSRDeclined', 'PaymentPending', 'PaymentInitiated'].includes(lst)) activeIdx = 6;
          else if (lst === 'PaymentCompleted') activeIdx = 7;
        }

        setProgressSteps(baseSteps.map((s, idx) => ({
          ...s,
          status: idx < activeIdx ? "complete" : (idx === activeIdx ? "current" : "pending")
        })));

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Dashboard could not be loaded.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {error ? <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}
      {loading ? (
        <Suspense fallback={<Skeleton />}>
          <Skeleton h="h-40" />
          <Skeleton h="h-24" />
          <Skeleton h="h-72" />
        </Suspense>
      ) : (
        <>
          {studentProfileData && <WelcomeBanner profile={studentProfileData} />}
          <StatsGrid stats={stats} />
          {recentApps.length > 0 && <ProgressStepper steps={progressSteps} applicationName={activeApplicationName} />}

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ApplicationsTable applications={recentApps} />
            </div>
            <NotificationsFeed items={notifications} onMarkAllRead={async () => {
              await notificationApi.markAllRead(); setNotifications([]);
            }} />
          </div>
        </>
      )}
    </main>
  );
}
