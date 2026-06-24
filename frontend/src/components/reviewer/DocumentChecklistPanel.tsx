'use client';

import { FileText, CheckCircle, XCircle, FileImage } from 'lucide-react';
import { mapDocument } from '@/lib/mappers';
import type { DocumentChecklistItem } from '@/types/domain';

type Props = {
  docs: DocumentChecklistItem[];
  activeUrl: string | null;
  rejectingId: number | null;
  rejectionReason: string;
  onSelect: (url: string) => void;
  onRejectStart: (id: number) => void;
  onRejectCancel: () => void;
  onReasonChange: (v: string) => void;
  onReview: (id: number, verified: boolean) => void;
};

export default function DocumentChecklistPanel(props: Props) {
  const { docs, activeUrl, rejectingId, rejectionReason, onSelect, onRejectStart, onRejectCancel, onReasonChange, onReview } = props;

  return (
    <div className="clay-card p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Uploaded Documents</h2>
      {docs.length === 0 ? (
        <p className="text-gray-500 text-sm">No documents found for this application.</p>
      ) : (
        <div className="space-y-4">
          {docs.map((doc) => (
            <div key={doc.checklistId}
              className={`clickable-card p-4 rounded-2xl ${activeUrl === doc.fileUrl ? 'bg-[#5b2c6f]/10 ring-2 ring-[#5b2c6f]/20' : 'bg-white'}`}
              onClick={() => doc.fileUrl && onSelect(doc.fileUrl)}
              role="button" tabIndex={0}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{doc.documentType}</p>
                  <p className="text-xs text-gray-500 mt-1">Status: <span className="font-medium text-[#2e86c1]">{doc.status}</span></p>
                </div>
                <FileText className="w-5 h-5 text-gray-400" />
              </div>

              {doc.status !== 'Verified' && (
                <div className="mt-4 space-y-2" onClick={(e) => e.stopPropagation()}>
                  {rejectingId === doc.checklistId ? (
                    <>
                      <textarea className="clay-input w-full text-sm p-2 resize-none" rows={2}
                        placeholder="Reason for rejection..." value={rejectionReason}
                        onChange={(e) => onReasonChange(e.target.value)} />
                      <div className="flex space-x-2">
                        <button type="button" onClick={() => onReview(doc.checklistId, false)}
                          className="clickable flex-1 bg-[#c0392b] text-white py-1.5 rounded-lg text-xs font-medium">Confirm Reject</button>
                        <button type="button" onClick={onRejectCancel}
                          className="clickable flex-1 bg-gray-200 text-gray-700 py-1.5 rounded-lg text-xs font-medium">Cancel</button>
                      </div>
                    </>
                  ) : (
                    <div className="flex space-x-2">
                      <button type="button" onClick={() => onReview(doc.checklistId, true)}
                        className="clickable flex-1 flex items-center justify-center gap-1 bg-[#0e6251] text-white py-2 rounded-xl text-xs font-medium hover:bg-[#0b4e41]">
                        <CheckCircle className="w-3.5 h-3.5" /> Verify
                      </button>
                      <button type="button" onClick={() => onRejectStart(doc.checklistId)}
                        className="clickable flex-1 flex items-center justify-center gap-1 bg-[#c0392b] text-white py-2 rounded-xl text-xs font-medium hover:bg-[#a93226]">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function parseDocumentChecklist(raw: unknown): DocumentChecklistItem[] {
  const list = (raw as Record<string, unknown>)?.documentChecklist
    || (raw as Record<string, unknown>)?.documents
    || [];
  return (list as Record<string, unknown>[]).map(mapDocument);
}

export function DocumentViewer({ url }: { url: string | null }) {
  return (
    <div className="clay-card p-6 h-[600px] flex flex-col">
      <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
        <FileImage className="w-5 h-5 mr-2 text-[#5b2c6f]" /> Document Viewer
      </h2>
      <div className="flex-1 clay-input flex justify-center items-center overflow-hidden">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="Document" className="max-w-full max-h-full object-contain" />
        ) : (
          <div className="text-center text-gray-400">
            <FileText className="w-16 h-16 mx-auto mb-2 opacity-50" />
            <p>Select a document to view</p>
          </div>
        )}
      </div>
    </div>
  );
}
