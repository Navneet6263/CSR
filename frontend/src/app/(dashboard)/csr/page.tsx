"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CSRDashboard() {
  const router = useRouter();

  useEffect(() => {
    router.push('/csr/approvals');
  }, [router]);

  return null;
}
