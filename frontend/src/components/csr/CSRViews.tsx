'use client';

import { CSRApplicationRow } from '@/types/domain';
import { Check, X, DollarSign, ChevronRight } from 'lucide-react';

type Props = {
  applications: CSRApplicationRow[];
  onSelect: (app: CSRApplicationRow) => void;
};

export default function CSRApplicationGrid({ applications, onSelect }: Props) {
  if (applications.length === 0) {
    return (
      <div className="col-span-full text-center py-12 text-slate-500 clay-card">
        No pending applications for funding.
      </div>
    );
  }

  return (
    <>
      {applications.map((app) => (
        <div key={app.applicationId}
          className="clickable-card clay-card p-6 border border-white/50"
          role="button" tabIndex={0}
          onClick={() => onSelect(app)}
          onKeyDown={(e) => e.key === 'Enter' && onSelect(app)}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="bg-[#2e86c1]/10 text-[#2e86c1] p-3 rounded-2xl"><DollarSign className="w-6 h-6" /></div>
            <span className="bg-teal-100 text-teal-700 text-xs font-bold px-3 py-1 rounded-full">Screened</span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-1">{app.studentName}</h3>
          <p className="text-sm text-slate-500 mb-4">{app.scholarshipName}</p>
          <div className="bg-slate-50/50 p-4 rounded-2xl mb-6 clay-input">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Amount</span>
              <span className="font-bold text-[#0e6251]">₹{app.scholarshipAmount?.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <button type="button" className="clickable w-full flex items-center justify-center gap-2 bg-slate-800 text-white py-3 rounded-2xl font-medium hover:bg-slate-700 clay-button">
            Review Application <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ))}
    </>
  );
}

export function CSRApprovalPanel({
  app, notes, onNotesChange, onClose, onApprove, onDecline,
}: {
  app: CSRApplicationRow;
  notes: string;
  onNotesChange: (v: string) => void;
  onClose: () => void;
  onApprove: () => void;
  onDecline: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm">
      <div className="clay-card w-full max-w-md p-8 overflow-y-auto border border-white animate-card-entrance">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Fund Approval</h2>
          <button type="button" onClick={onClose} className="clickable p-2 bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-lg font-semibold text-slate-800">{app.studentName}</p>
        <p className="text-sm text-[#2e86c1] mt-1">{app.studentEmail}</p>
        <div className="bg-teal-50 p-6 rounded-2xl my-6 border border-teal-100">
          <p className="font-bold text-slate-800 mb-1">{app.scholarshipName}</p>
          <p className="text-3xl font-extrabold text-[#0e6251]">₹{app.scholarshipAmount?.toLocaleString('en-IN')}</p>
        </div>
        <textarea value={notes} onChange={(e) => onNotesChange(e.target.value)} rows={4}
          placeholder="Comment (optional)..." className="clay-input w-full p-4 mb-6 resize-none" />
        <div className="space-y-3">
          <button type="button" onClick={onApprove}
            className="clickable w-full flex items-center justify-center gap-2 bg-[#0e6251] text-white py-4 rounded-2xl font-semibold clay-button hover:scale-[1.02]">
            <Check className="w-5 h-5" /> Approve
          </button>
          <button type="button" onClick={onDecline}
            className="clickable w-full flex items-center justify-center gap-2 bg-white text-red-500 py-4 rounded-2xl font-semibold border-2 border-red-100 hover:bg-red-50">
            <X className="w-5 h-5" /> Decline
          </button>
        </div>
      </div>
    </div>
  );
}

export function CSRStatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="clay-card p-6 flex items-center gap-6">
      <div className="bg-[#5b2c6f] text-white p-4 rounded-2xl">{icon}</div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <p className="text-3xl font-extrabold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
