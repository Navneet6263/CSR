'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { screeningApi } from '@/lib/api/screening';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ScreenerApplicantHeader from '@/components/screener/ScreenerApplicantHeader';
import ScreenerApplicantDetails from '@/components/screener/ScreenerApplicantDetails';
import ScreenerVerificationReports from '@/components/screener/ScreenerVerificationReports';
import ScreenerDecisionPanel from '@/components/screener/ScreenerDecisionPanel';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EvaluateApplicationPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const appId = parseInt(params.id, 10);

  useEffect(() => {
    fetchData();
  }, [appId]);

  const fetchData = async () => {
    try {
      const res = await screeningApi.getConsolidated(appId);
      if (res.success) {
        setData(res.data);
      } else {
        router.push('/screener');
      }
    } catch (err) {
      console.error(err);
      router.push('/screener');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (decision: 'Approve' | 'Reject', notes: string) => {
    try {
      await screeningApi.submitScreeningDecision(appId, decision, notes);
      router.push('/screener');
    } catch (error) {
      console.error('Failed to submit decision', error);
      alert('Failed to submit decision. Please try again.');
    }
  };

  if (loading || !data) return <div className="h-[60vh] flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <Link href="/screener" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#2e86c1] transition-colors text-sm font-bold">
        <ArrowLeft size={16} /> Back to Queue
      </Link>

      <ScreenerApplicantHeader application={data.application} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ScreenerApplicantDetails student={data.application} />
          <ScreenerVerificationReports documents={data.documents} bgChecks={data.bgChecks} />
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <ScreenerDecisionPanel onSubmit={handleDecision} />
          </div>
        </div>
      </div>
    </div>
  );
}
