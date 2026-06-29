'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
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

  useEffect(() => {
    const user = authApi.getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    
    // Role-based route protection
    const role = user.role;
    if (role === 'BGCheckOfficer' && pathname.startsWith('/reviewer')) {
      window.location.href = '/officer';
      return;
    }
    if (role === 'DocReviewer' && pathname.startsWith('/officer')) {
      window.location.href = '/reviewer';
      return;
    }

    setRole(role);
    setMounted(true);
  }, [pathname]);

  // Prevent hydration mismatch by returning nothing until mounted,
  // or return a standard full-width layout temporarily.
  if (!mounted) {
    return <div className="min-h-screen bg-gradient-to-br from-[#f5f0ff] via-[#f0f4ff] to-[#f0faf5]"></div>;
  }

  const isStudent = role === 'Student';
  const isDocReviewer = role === 'DocReviewer';
  const isBGOfficer = role === 'BGCheckOfficer';
  const isScreener = role === 'ScreeningOfficer';
  const isAdmin = role === 'Admin' || pathname.startsWith('/admin');
  const hasSidebar = !isStudent && !isDocReviewer && !isBGOfficer && !isScreener;

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

  return (
    <div className={`flex min-h-screen print:bg-none print:bg-white bg-gradient-to-br from-[#f5f0ff] via-[#f0f4ff] to-[#f0faf5]`}>
      {hasSidebar && (
        <div className="print:hidden">
          <Sidebar />
        </div>
      )}
      <main className={`flex-1 min-h-screen transition-all duration-300 ${hasSidebar ? 'ml-[280px]' : 'ml-0'} print:ml-0 print:p-0`}>
        <div className={isScreener ? "" : isStudent || isDocReviewer || isBGOfficer ? "p-4 sm:p-6 lg:p-8" : "p-6 lg:p-8"}>
          {children}
        </div>
      </main>
    </div>
  );
}
