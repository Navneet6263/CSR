'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import AdminSidebar from '@/components/admin/Sidebar';
import AdminTopbar from '@/components/admin/Topbar';
import { authApi } from '@/lib/api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [role, setRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let active = true;
    authApi.restoreSession().then((user) => {
      if (!active) return;
      if (!user) { router.replace('/login'); return; }
      if (user.mustChangePassword) { router.replace('/change-password'); return; }
      const expectedPrefix: Record<string, string> = {
        Admin: '/admin', Agent: '/agent', DocReviewer: '/reviewer', BGCheckOfficer: '/officer',
        ScreeningOfficer: '/screener', CSRPartner: '/csr', Finance: '/finance',
        SupportAgent: '/support',
      };
      const prefix = expectedPrefix[user.role];
      if (prefix && !pathname.startsWith(prefix)) { router.replace(prefix); return; }
      setRole(user.role);
      setMounted(true);
    });
    return () => { active = false; };
  }, [pathname, router]);

  // Prevent hydration mismatch by returning nothing until mounted,
  // or return a standard full-width layout temporarily.
  if (!mounted) {
    return <div className="min-h-screen bg-slate-50 p-6" aria-label="Opening secure workspace"><div className="mx-auto max-w-7xl space-y-4">
      <div className="h-16 animate-pulse rounded-2xl bg-white" /><div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-2xl bg-white" />)}</div>
      <div className="h-96 animate-pulse rounded-2xl bg-white" /></div></div>;
  }

  const isStudent = role === 'Student';
  const isDocReviewer = role === 'DocReviewer';
  const isBGOfficer = role === 'BGCheckOfficer';
  const isScreener = role === 'ScreeningOfficer';
  const isCSRPartner = role === 'CSRPartner' || pathname.startsWith('/csr');
  const isFinance = role === 'Finance' || pathname.startsWith('/finance');
  const isAdmin = role === 'Admin' || pathname.startsWith('/admin');
  const isSupport = role === 'SupportAgent' || pathname.startsWith('/support');
  const hasSidebar = !isStudent && !isDocReviewer && !isBGOfficer && !isScreener && !isCSRPartner && !isFinance;

  if (isAdmin) {
    return (
      <div className="h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans antialiased">
        <div className="flex h-full">
          <AdminSidebar />
          <main className="flex-1 min-w-0 flex flex-col h-full">
            <AdminTopbar />
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (isSupport) return <div className="min-h-screen bg-slate-50 text-slate-900">{children}</div>;

  if (isDocReviewer) {
    return <div className="doc-reviewer-bg min-h-screen">{children}</div>;
  }

  if (isBGOfficer) {
    return (
      <div className="officer-theme min-h-screen bg-slate-50 text-slate-900">
        <div
          aria-hidden
          className="pointer-events-none fixed top-0 right-0 z-0 h-[520px] w-[520px]"
          style={{
            background:
              "radial-gradient(circle at 85% 15%, rgba(253, 224, 71, 0.55) 0%, rgba(253, 224, 71, 0.18) 22%, rgba(255,255,255,0) 55%)",
          }}
        />
        {children}
      </div>
    );
  }

  if (isCSRPartner) {
    return <div className="h-full">{children}</div>;
  }

  if (isFinance) {
    return <div className="h-full">{children}</div>;
  }

  return (
    <div className={`flex min-h-screen print:bg-none print:bg-white bg-gradient-to-br from-[#f5f0ff] via-[#f0f4ff] to-[#f0faf5]`}>
      {hasSidebar && (
        <div className="print:hidden">
          <Sidebar />
        </div>
      )}
      <main className={`flex-1 min-h-screen transition-all duration-300 ${hasSidebar ? 'ml-[280px]' : 'ml-0'} print:ml-0 print:p-0`}>
        <div className={isScreener ? "" : isStudent ? "p-4 sm:p-6 lg:p-8" : "p-6 lg:p-8"}>
          {children}
        </div>
      </main>
    </div>
  );
}
