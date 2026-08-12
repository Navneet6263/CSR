'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { supportApi } from '@/lib/api';

export function useStudentActivity() {
  const pathname = usePathname();
  useEffect(() => {
    const pageCode = pathname.replace(/\/\d+(?=\/|$)/g, '/id').slice(0, 80);
    const timer = setTimeout(() => void supportApi.recordActivity({ pageCode, eventType: 'PageView' }).catch(() => undefined), 800);
    return () => clearTimeout(timer);
  }, [pathname]);
}
