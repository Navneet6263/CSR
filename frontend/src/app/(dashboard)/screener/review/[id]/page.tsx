'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, FileText, User, AlertTriangle } from 'lucide-react';
import { screeningApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

type AppDetail = {
  applicationId: number;
  studentName: string;
  scholarshipName: string;
  bgCheckResult: string;
  bgCheckNotes: string;
  docReviewerName: string;
  eligibilitySummary: string[];
  documentsVerified: number;
  totalDocuments: number;
};

export default function ScreeningReview() {
  const params = useParams();
  const router = useRouter();
  const [app, setApp] = useState<AppDetail | null>(null);
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    screeningApi.getApplicationDetail(Number(params.id))
      .then(res => setApp(res.data))
      .catch(() => setApp(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSubmit = async () => {
    if (!decision || !notes.trim()) return;
    setSubmitting(true);
    try {
      if (decision === 'approve') {
        await screeningApi.approveApplication(Number(params.id), notes);
      } else {
        await screeningApi.rejectApplication(Number(params.id), notes);
      }
      router.push('/screener/applications');
    } catch (err) {
      alert('Failed to submit decision');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5b2c6f]" /></div>;
  if (!app) return <div className="text-center p-8">Application not found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4">
      <div className="flex items-center gap-3">
        <div className="clay-card p-3"><User className="w-6 h-6 text-[#5b2c6f]" /></div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{app.studentName}</h1>
          <p className="text-sm text-gray-500">Application #{app.applicationId} • {app.scholarshipName}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="clay-card p-5">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Document Review
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Verified</span>
              <span className="font-medium">{app.documentsVerified}/{app.totalDocuments}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Reviewed By</span>
              <span className="font-medium">{app.docReviewerName}</span>
            </div>
          </div>
        </div>

        <div className="clay-card p-5">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Background Check
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Result</span>
              <span className={`font-medium ${app.bgCheckResult === 'Pass' ? 'text-[#0e6251]' : 'text-[#c0392b]'}`}>
                {app.bgCheckResult}
              </span>
            </div>
            <p className="text-gray-600 text-xs mt-2">{app.bgCheckNotes}</p>
          </div>
        </div>
      </div>

      <div className="clay-card p-5">
        <h3 className="font-semibold text-gray-700 mb-3">Eligibility Summary</h3>
        <ul className="space-y-2">
          {app.eligibilitySummary.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-[#0e6251] mt-0.5" />
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {app.docReviewerName === 'Current User' && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-sm text-yellow-800">
            Warning: You reviewed documents for this application. Separation of duties may apply.
          </AlertDescription>
        </Alert>
      )}

      <div className="clay-card p-5">
        <h3 className="font-semibold text-gray-700 mb-4">Screening Decision</h3>
        <div className="space-y-4">
          <div className="flex gap-3">
            <Button onClick={() => setDecision('approve')} 
              className={`flex-1 h-12 ${decision === 'approve' ? 'bg-[#0e6251] text-white' : 'bg-gray-100 text-gray-700'}`}>
              <CheckCircle className="w-4 h-4 mr-2" /> Approve
            </Button>
            <Button onClick={() => setDecision('reject')} 
              className={`flex-1 h-12 ${decision === 'reject' ? 'bg-[#c0392b] text-white' : 'bg-gray-100 text-gray-700'}`}>
              <XCircle className="w-4 h-4 mr-2" /> Reject
            </Button>
          </div>

          {decision && (
            <div className="space-y-3">
              <Textarea placeholder={`Enter ${decision === 'approve' ? 'approval' : 'rejection'} notes (required)...`} 
                value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="clay-input" />
              <Button onClick={handleSubmit} disabled={!notes.trim() || submitting} 
                className={`w-full h-12 ${decision === 'approve' ? 'bg-[#0e6251]' : 'bg-[#c0392b]'} text-white`}>
                {submitting ? 'Submitting...' : `Confirm ${decision === 'approve' ? 'Approval' : 'Rejection'}`}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
