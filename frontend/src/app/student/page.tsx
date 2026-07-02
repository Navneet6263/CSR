'use client';

import { Suspense, useEffect, useState } from "react";
import { WelcomeBanner } from "@/components/student/dashboard/WelcomeBanner";
import { StatsGrid } from "@/components/student/dashboard/StatsGrid";
import { ProgressStepper } from "@/components/student/dashboard/ProgressStepper";
import { NotificationsFeed } from "@/components/student/dashboard/NotificationsFeed";
import { ApplicationsTable } from "@/components/student/dashboard/ApplicationsTable";
import { authApi, applicationApi, scholarshipApi, studentApi } from "@/lib/api";
import { notifications, stats as mockStats } from "@/lib/mockData";
import { overallCompletion, INITIAL_FORM } from "@/lib/profileForm";

function Skeleton({ h = "h-40" }: { h?: string }) {
  return <div className={`${h} animate-pulse rounded-2xl bg-muted`} />;
}

export default function StudentDashboard() {
  const [userName, setUserName] = useState("Student");
  const [stats, setStats] = useState<any[]>([]);
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [progressSteps, setProgressSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentProfileData, setStudentProfileData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const u = authApi.getUser();
        if (u) setUserName(u.fullName);

        const [profRes, appsRes, scholsRes] = await Promise.all([
          studentApi.getProfile().catch(() => ({ data: null })),
          applicationApi.getMy().catch(() => ({ data: [] })),
          scholarshipApi.getAll().catch(() => ({ data: [] }))
        ]);

        const apps = appsRes.data || [];
        const schols = scholsRes.data?.scholarships || scholsRes.data || [];
        const prof = profRes.data;

        // Calculate profile completion using dummy form map logic or simplify
        let completion = 0;
        if (prof) {
          // Just a fast heuristic mapping
          let filled = 0, total = 0;
          const check = (v: any) => { total++; if (v) filled++; };
          check(prof.phone); check(prof.aadharNumber); check(prof.address); check(prof.gender);
          check(prof.fatherName); check(prof.annualFamilyIncome); check(prof.domicileState);
          check(prof.tenthBoardName); check(prof.institutionId); check(prof.bankAccountNo);
          completion = total > 0 ? Math.round((filled / total) * 100) : 0;
        }

        setStudentProfileData({
          name: u?.fullName || "Student",
          profileCompletion: completion,
          classLevel: "UG",
          stream: "Engineering",
          gender: prof?.gender?.toLowerCase() || "male",
          annualIncome: prof?.annualFamilyIncome || 240000,
          category: prof?.category || "General",
          state: prof?.domicileState || "Maharashtra",
        });

        const totalFunded = apps
          .filter((a: any) => (a.Status || a.status) === 'Funded' || (a.Status || a.status) === 'Disbursed')
          .reduce((acc: number, a: any) => acc + ((a.ScholarshipAmount || a.scholarshipAmount) || 0), 0);

        const activeCount = apps.filter((a: any) => {
          const st = a.Status || a.status;
          return st !== 'Rejected' && st !== 'Funded' && st !== 'Approved' && st !== 'Disbursed';
        }).length;
        
        const reviewCount = apps.filter((a: any) => {
          const st = a.Status || a.status;
          return st === 'CommitteeReview' || st === 'DocVerification';
        }).length;
        
        // Approximate documents uploaded based on completion for now
        const docsUploaded = Math.max(0, Math.min(9, Math.round((completion / 100) * 9)));

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
            value: `${docsUploaded}/9`, 
            hint: docsUploaded < 9 ? "Action needed" : "All set", 
            tone: docsUploaded === 9 ? "success" : "warning" 
          },
          { 
            id: "open", 
            label: "Open Scholarships", 
            value: schols.length.toString(), 
            hint: "Matched to your profile", 
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

        setRecentApps(apps.slice(0, 10).map((a: any) => {
          const st = a.Status || a.status;
          const amt = a.ScholarshipAmount || a.scholarshipAmount;
          return {
            id: a.ApplicationID || a.id,
            scholarship: a.ScholarshipName || a.scholarshipName || "Scholarship",
            appliedOn: new Date(a.CreatedAt || a.createdAt).toLocaleDateString(),
            currentStage: st,
            amount: amt ? `₹${amt}` : "Variable",
            status: st === 'Approved' ? 'Funded' : (st === 'Rejected' ? 'Rejected' : 'Pending')
          };
        }));

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
          const lst = lastApp.Status || lastApp.status;
          if (lst === 'DocVerification') activeIdx = 3;
          else if (lst === 'BGCheck') activeIdx = 4;
          else if (lst === 'CommitteeReview') activeIdx = 5;
          else if (lst === 'Approved' || lst === 'Disbursed') activeIdx = 7;
          else if (lst === 'Rejected') activeIdx = 3;
        }

        setProgressSteps(baseSteps.map((s, idx) => ({
          ...s,
          status: idx < activeIdx ? "complete" : (idx === activeIdx ? "current" : "pending")
        })));

      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
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
          {recentApps.length > 0 && <ProgressStepper steps={progressSteps} />}

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ApplicationsTable applications={recentApps} />
            </div>
            <NotificationsFeed items={notifications} />
          </div>
        </>
      )}
    </main>
  );
}
