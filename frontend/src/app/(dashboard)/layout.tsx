'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { authApi } from '@/lib/api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [role, setRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const user = authApi.getUser();
    setRole(user?.role || null);
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by returning nothing until mounted,
  // or return a standard full-width layout temporarily.
  if (!mounted) {
    return <div className="min-h-screen bg-gradient-to-br from-[#f5f0ff] via-[#f0f4ff] to-[#f0faf5]"></div>;
  }

  const isStudent = role === 'Student';

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#f5f0ff] via-[#f0f4ff] to-[#f0faf5] print:bg-none print:bg-white">
      {!isStudent && (
        <div className="print:hidden">
          <Sidebar />
        </div>
      )}
      <main className={`flex-1 min-h-screen transition-all duration-300 ${!isStudent ? 'ml-[280px]' : 'ml-0'} print:ml-0 print:p-0`}>
        <div className={isStudent ? "p-4 sm:p-6 lg:p-8" : "p-6 lg:p-8"}>
          {children}
        </div>
      </main>
    </div>
  );
}
