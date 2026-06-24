'use client';

import { ScreeningApplicationRow } from '@/types/domain';
import { CheckCircle, XCircle, FileText, User } from 'lucide-react';

type Props = {
  applications: ScreeningApplicationRow[];
  selectedId: number | null;
  onSelect: (app: ScreeningApplicationRow) => void;
};

export function ScreenerList({ applications, selectedId, onSelect }: Props) {
  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
      {applications.map((app) => (
        <button key={app.applicationId} type="button" onClick={() => onSelect(app)}
          className={`clickable w-full text-left p-5 rounded-2xl transition-all ${
            selectedId === app.applicationId
              ? 'bg-[#5b2c6f] text-white shadow-lg'
              : 'bg-white hover:bg-slate-50 text-slate-700 clay-card'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-full ${selectedId === app.applicationId ? 'bg-white/20' : 'bg-purple-100 text-[#5b2c6f]'}`}>
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{app.studentName}</h3>
              <p className={`text-sm ${selectedId === app.applicationId ? 'text-purple-200' : 'text-slate-500'}`}>
                {app.scholarshipName}
              </p>
            </div>
          </div>
        </button>
      ))}
      {applications.length === 0 && <p className="text-center text-slate-400 py-10">No pending applications.</p>}
    </div>
  );
}

export function ScreenerDetail({
  app, notes, onNotesChange, onApprove, onReject,
}: {
  app: ScreeningApplicationRow;
  notes: string;
  onNotesChange: (v: string) => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="clay-card p-8 animate-card-entrance">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">{app.studentName}</h2>
          <p className="text-[#2e86c1] font-medium flex items-center gap-2">
            <FileText className="w-5 h-5" /> {app.scholarshipName}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Amount</p>
          <p className="text-2xl font-bold text-[#0e6251]">₹{app.scholarshipAmount?.toLocaleString('en-IN')}</p>
        </div>
      </div>
      <p className="text-sm text-slate-600 mb-6">{app.studentEmail}</p>
      <textarea value={notes} onChange={(e) => onNotesChange(e.target.value)} rows={4}
        placeholder="Screening notes (required for rejection)..."
        className="clay-input w-full p-5 mb-8 resize-none" />
      <div className="flex gap-4">
        <button type="button" onClick={onApprove}
          className="clickable flex-1 flex items-center justify-center gap-2 bg-[#0e6251] text-white py-4 rounded-2xl font-semibold clay-button hover:scale-[1.02]">
          <CheckCircle className="w-5 h-5" /> Approve
        </button>
        <button type="button" onClick={onReject}
          className="clickable flex-1 flex items-center justify-center gap-2 bg-[#c0392b] text-white py-4 rounded-2xl font-semibold clay-button hover:scale-[1.02]">
          <XCircle className="w-5 h-5" /> Reject
        </button>
      </div>
    </div>
  );
}
