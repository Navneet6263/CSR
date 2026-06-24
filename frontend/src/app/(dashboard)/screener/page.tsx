"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ScreenerDashboard() {
  const router = useRouter();

  useEffect(() => {
    router.push('/screener/applications');
  }, [router]);

  return null;
}
