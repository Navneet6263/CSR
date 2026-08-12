'use client';
import { notFound, useParams } from 'next/navigation';
import PipelineDashboard from '@/components/admin/PipelineDashboard';
export default function Page() {
  const role = useParams().role as string;
  if (!['reviewer', 'bgchecker', 'screener', 'csr'].includes(role)) return notFound();
  return <PipelineDashboard role={role as 'reviewer' | 'bgchecker' | 'screener' | 'csr'} />;
}
