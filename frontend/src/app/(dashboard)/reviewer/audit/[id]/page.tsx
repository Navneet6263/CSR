'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { applicationApi, verificationApi } from '@/lib/api';
import DocumentChecklistPanel, { DocumentViewer, parseDocumentChecklist } from '@/components/reviewer/DocumentChecklistPanel';
import type { DocumentChecklistItem } from '@/types/domain';

export default function DocumentAuditPage() {
  const { id } = useParams();
  const [studentName, setStudentName] = useState('');
  const [docs, setDocs] = useState<DocumentChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDocUrl, setActiveDocUrl] = useState<string | null>(null);
  const [rejectingDocId, setRejectingDocId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadApp = async () => {
    const res = await applicationApi.getById(Number(id));
    const data = res.data || {};
    setStudentName(String(data.StudentName ?? data.studentName ?? 'N/A'));
    setDocs(parseDocumentChecklist(data));
  };

  useEffect(() => {
    loadApp().catch(console.error).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleReview = async (docId: number, isVerified: boolean) => {
    if (!isVerified && !rejectionReason.trim()) {
      alert('Rejection reason is required.');
      return;
    }
    try {
      await verificationApi.reviewDoc(docId, {
        status: isVerified ? 'Verified' : 'Rejected',
        rejectionReason: isVerified ? undefined : rejectionReason,
      });
      await loadApp();
      setRejectingDocId(null);
      setRejectionReason('');
    } catch {
      alert('Failed to update document status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-[#5b2c6f] w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-card-entrance">
      <div className="flex items-center space-x-4">
        <Link href="/reviewer" className="clickable clay-card p-2 text-gray-500 hover:text-gray-800">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Review Documents — App #{id}</h1>
          <p className="text-gray-500 mt-1">Student: {studentName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2"><DocumentViewer url={activeDocUrl} /></div>
        <DocumentChecklistPanel
          docs={docs} activeUrl={activeDocUrl} rejectingId={rejectingDocId}
          rejectionReason={rejectionReason} onSelect={setActiveDocUrl}
          onRejectStart={setRejectingDocId} onRejectCancel={() => setRejectingDocId(null)}
          onReasonChange={setRejectionReason} onReview={handleReview}
        />
      </div>
    </div>
  );
}
