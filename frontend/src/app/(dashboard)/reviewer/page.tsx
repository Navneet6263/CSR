'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, ChevronRight, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { verificationApi } from '@/lib/api';
import type { ReviewApplicationRow } from '@/types/domain';

export default function ReviewerDashboard() {
  const [applications, setApplications] = useState<ReviewApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    verificationApi.getPendingDocs()
      .then((res) => setApplications(res.data || []))
      .catch((err: Error) => setError(err.message || 'Failed to fetch pending applications.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5b2c6f]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-card-entrance">
      <div className="flex items-center space-x-4">
        <div className="clay-card p-3"><FileText className="w-8 h-8 text-[#5b2c6f]" /></div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Document Audit Queue</h1>
          <p className="text-gray-500 mt-1">Review pending documents for scholarship applications</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="rounded-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="clay-card p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                {['App ID', 'Student Name', 'Scholarship', 'Submitted', 'Status', 'Action'].map((h) => (
                  <th key={h} className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider last:text-right">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {applications.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No pending applications to review.</td></tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.applicationId} data-clickable="true"
                    className="hover:bg-white/50 transition-colors duration-200 cursor-pointer"
                  >
                    <td className="p-4 text-gray-800 font-medium">#{app.applicationId}</td>
                    <td className="p-4 text-gray-700">{app.studentName}</td>
                    <td className="p-4 text-gray-700">{app.scholarshipName}</td>
                    <td className="p-4 text-gray-500">
                      {app.submissionDate ? new Date(app.submissionDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 text-xs font-semibold text-[#f39c12] bg-[#f39c12]/10 rounded-full">{app.status}</span>
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/reviewer/audit/${app.applicationId}`}
                        className="clickable inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#5b2c6f] rounded-xl hover:bg-[#4a235a] clay-button">
                        Review Documents <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
