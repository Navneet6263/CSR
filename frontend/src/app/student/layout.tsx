'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/student/dashboard/TopNav';
import { authApi } from '@/lib/api';
import { useStudentActivity } from '@/hooks/useStudentActivity';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [studentName, setStudentName] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();
  useStudentActivity();

  useEffect(() => {
    let active = true;
    const cached = authApi.getUser();
    if (cached?.role === 'Student' && !cached.mustChangePassword) {
      setStudentName(cached.fullName);
      setCheckingSession(false);
    }

    authApi.restoreSession().then((user) => {
      if (!active) return;
      if (!user || user.role !== 'Student') {
        setStudentName(null);
        router.replace('/login');
      } else if (user.mustChangePassword) {
        setStudentName(null);
        router.replace('/change-password');
      } else {
        setStudentName(user.fullName);
      }
      setCheckingSession(false);
    });
    return () => { active = false; };
  }, [router]);

  if (checkingSession && !studentName) {
    return <div className="min-h-screen animate-pulse bg-background" aria-label="Loading portal" />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      {studentName ? <TopNav studentName={studentName} /> : null}
      {studentName ? children : null}
    </div>
  );
}
