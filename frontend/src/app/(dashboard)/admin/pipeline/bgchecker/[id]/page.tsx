'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ApplicationRecord from '@/components/admin/detail/ApplicationRecord';

export default function BackgroundApplication() {
  const { id } = useParams<{ id: string }>();
  return <div className="space-y-5">
    <Link href="/admin/pipeline/bgchecker" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900">
      <ArrowLeft className="h-3.5 w-3.5" /> Back to Background Checkers
    </Link>
    <ApplicationRecord rawId={id} />
  </div>;
}
