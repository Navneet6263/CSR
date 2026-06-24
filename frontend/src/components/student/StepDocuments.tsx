'use client';

import { useState, useRef } from 'react';
import { Upload, CheckCircle, Clock, FileCheck } from 'lucide-react';
import { studentApi } from '@/lib/api';

interface DocItem {
  type: string;
  label: string;
  status: 'pending' | 'uploaded' | 'verified';
  progress?: number;
}

interface StepDocumentsProps {
  documents: DocItem[];
  onUpload: (docType: string) => void;
}

const defaultDocs: DocItem[] = [
  { type: 'aadhar', label: 'Aadhar Card', status: 'pending' },
  { type: 'pan', label: 'PAN Card', status: 'pending' },
  { type: 'income', label: 'Income Certificate', status: 'pending' },
  { type: 'caste', label: 'Caste Certificate', status: 'pending' },
  { type: 'education', label: 'Education Proof', status: 'pending' },
  { type: 'bank', label: 'Bank Proof', status: 'pending' },
  { type: 'photo', label: 'Photo ID', status: 'pending' },
];

const statusConfig = {
  pending: { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-50', label: 'Pending' },
  uploaded: { icon: FileCheck, color: 'text-[#2e86c1]', bg: 'bg-[#2e86c1]/5', label: 'Uploaded' },
  verified: { icon: CheckCircle, color: 'text-[#0e6251]', bg: 'bg-[#0e6251]/5', label: 'Verified' },
};

export default function StepDocuments({ documents, onUpload }: StepDocumentsProps) {
  const docs = documents.length > 0 ? documents : defaultDocs;
  const [uploading, setUploading] = useState<Record<string, number>>({});
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileChange = async (docType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploading((prev) => ({ ...prev, [docType]: 20 })); // Start progress

      try {
        await studentApi.uploadDocument(docType, file);
        setUploading((prev) => ({ ...prev, [docType]: 100 })); // Finish progress
        setTimeout(() => {
          setUploading((prev) => {
            const next = { ...prev };
            delete next[docType];
            return next;
          });
          onUpload(docType);
        }, 500);
      } catch (err) {
        console.error('Upload failed:', err);
        alert('File upload failed. Please try again.');
        setUploading((prev) => {
          const next = { ...prev };
          delete next[docType];
          return next;
        });
      }
    }
  };

  return (
    <div className="clay-card p-6 space-y-5 animate-card-entrance">
      <h3 className="text-lg font-bold text-slate-800">Document Upload</h3>
      <p className="text-sm text-slate-400">Upload required documents for verification</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docs.map((doc) => {
          const config = statusConfig[doc.status];
          const StatusIcon = config.icon;
          const currentProgress = uploading[doc.type] ?? doc.progress;
          const isUploading = doc.type in uploading;

          return (
            <div key={doc.type}
              className="p-4 rounded-2xl bg-white/60 border border-white/60 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.02),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] hover:shadow-[4px_4px_12px_rgba(0,0,0,0.06),-4px_-4px_12px_rgba(255,255,255,0.8)] transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-700">{doc.label}</span>
                <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-xl ${config.bg} ${config.color}`}>
                  <StatusIcon size={12} />
                  {isUploading ? 'Uploading...' : config.label}
                </span>
              </div>

              {doc.status === 'pending' && !isUploading ? (
                <>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    ref={(el) => { fileRefs.current[doc.type] = el; }}
                    onChange={(e) => handleFileChange(doc.type, e)}
                  />
                  <button onClick={() => fileRefs.current[doc.type]?.click()}
                    className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center gap-1.5 text-slate-400 hover:text-[#5b2c6f] hover:border-[#5b2c6f]/20 transition-colors cursor-pointer"
                  >
                    <Upload size={20} />
                    <span className="text-xs font-medium">Click to select file</span>
                  </button>
                </>
              ) : (
                <div className="w-full">
                  {currentProgress !== undefined && currentProgress < 100 && (
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-4">
                      <div className="h-full bg-gradient-to-r from-[#5b2c6f] to-[#2e86c1] rounded-full transition-all duration-300"
                        style={{ width: `${currentProgress}%` }} />
                    </div>
                  )}
                  {(currentProgress === undefined || currentProgress === 100) && (
                    <p className="text-xs text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
                      <FileCheck size={14} className="text-[#2e86c1]" /> Document uploaded successfully
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
