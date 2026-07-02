'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { TopNav } from '@/components/student/dashboard/TopNav';
import { authApi } from '@/lib/api';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const u = authApi.getUser();
    if (!u) {
      router.push('/login');
      return;
    }
    if (u.role !== 'Student') {
      router.push('/login');
      return;
    }
    setUser(u);
    setMounted(true);
  }, [router, pathname]);

  if (!mounted) {
    return <div className="min-h-screen bg-background"></div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      {user && (
        <TopNav 
          profile={{
            name: user.fullName || "Student",
            profileCompletion: 0,
            classLevel: "UG",
            stream: "Engineering",
            gender: "male",
            annualIncome: 240000,
            category: "General",
            state: "Maharashtra"
          }}
        />
      )}
      {children}
    </div>
  );
}
