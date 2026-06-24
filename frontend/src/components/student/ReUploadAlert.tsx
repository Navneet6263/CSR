'use client';

import { useEffect, useState } from 'react';
import { verificationApi } from '@/lib/api';
import { AlertCircle, UploadCloud } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { DocumentChecklistItem } from '@/types/domain';

export function ReUploadAlert() {
  const [reuploads, setReuploads] = useState<DocumentChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  const fetchReuploads = async () => {
    try {
      const res = await verificationApi.getReUploads();
      const pending = (res.data || []).filter((d) =>
        ['Rejected', 'ReUploadRequested'].includes(d.status)
      );
      setReuploads(pending);
    } catch (err) {
      console.error('Failed to fetch re-uploads', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReuploads(); }, []);

  const handleFileUpload = async (doc: DocumentChecklistItem, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingId(doc.checklistId);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        await verificationApi.uploadDoc({
          applicationId: doc.applicationId,
          documentType: doc.documentType,
          fileUrl: reader.result as string,
        });
        await fetchReuploads();
      };
      reader.readAsDataURL(file);
    } catch {
      alert('Upload failed.');
    } finally {
      setUploadingId(null);
    }
  };

  if (loading || reuploads.length === 0) return null;

  return (
    <div className="mb-8">
      <Alert className="bg-[#fdf2e9] border-none clay-card p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-[#e67e22]" />
        <div className="flex items-start">
          <AlertCircle className="h-6 w-6 text-[#e67e22] mt-1 mr-4" />
          <div className="flex-1">
            <AlertTitle className="text-xl font-bold text-[#d35400] mb-2">Action Required: Re-upload Documents</AlertTitle>
            <AlertDescription className="text-gray-700 space-y-4">
              <p>Some documents were rejected. Re-upload corrected files to proceed.</p>
              <div className="space-y-3 mt-4">
                {reuploads.map((doc) => (
                  <div key={doc.checklistId} className="bg-white/60 p-4 rounded-2xl clay-input flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[#d35400]">{doc.documentType}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Reason:</span> {doc.rejectionReason || 'No reason provided.'}
                      </p>
                    </div>
                    <label className={`clickable inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-xl clay-button ${uploadingId === doc.checklistId ? 'bg-gray-400' : 'bg-[#e67e22] hover:bg-[#d35400]'}`}>
                      {uploadingId === doc.checklistId ? 'Uploading...' : <><UploadCloud className="w-4 h-4 mr-2" /> Upload New File</>}
                      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(doc, e)} disabled={uploadingId === doc.checklistId} />
                    </label>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </div>
        </div>
      </Alert>
    </div>
  );
}
