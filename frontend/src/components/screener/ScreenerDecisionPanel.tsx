'use client';

import { useState } from 'react';
import { Check, X, ShieldAlert, Send } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function ScreenerDecisionPanel({ onSubmit }: { onSubmit: (decision: 'Approve' | 'Reject', notes: string) => void }) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (decision: 'Approve' | 'Reject') => {
    if (!notes.trim()) {
      alert('Please add screening notes before submitting a decision.');
      return;
    }
    if (confirm(`Are you sure you want to ${decision.toUpperCase()} this application?`)) {
      setIsSubmitting(true);
      onSubmit(decision, notes);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-12 h-12 rounded-xl bg-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.02)] flex items-center justify-center shrink-0 border border-slate-100">
          <ShieldAlert className="text-[#2e86c1]" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800">Final Decision</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Record your screening outcome</p>
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        <div>
          <label className="block text-sm font-black text-slate-700 mb-2">Screening Notes / Justification <span className="text-rose-500">*</span></label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-32 bg-[#f8fafc] border border-slate-200 rounded-2xl p-4 text-sm text-slate-700 font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#2e86c1] focus:ring-2 focus:ring-[#2e86c1]/20 transition-all resize-none shadow-inner"
            placeholder="Enter your comprehensive analysis and justification for the decision..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => handleSubmit('Reject')}
            disabled={isSubmitting}
            className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 hover:border-rose-300 shadow-[4px_4px_10px_rgba(0,0,0,0.03),-4px_-4px_10px_rgba(255,255,255,1)] transition-all disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center border border-rose-100">
              <X size={20} />
            </div>
            <span className="text-sm font-black">Reject</span>
          </button>

          <button 
            onClick={() => handleSubmit('Approve')}
            disabled={isSubmitting}
            className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-[#2e86c1] hover:bg-[#256c9d] text-white shadow-[4px_4px_10px_rgba(46,134,193,0.3)] transition-all disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              {isSubmitting ? <LoadingSpinner size="sm" /> : <Check size={20} />}
            </div>
            <span className="text-sm font-black">Approve</span>
          </button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700 font-bold flex gap-3 shadow-sm">
          <ShieldAlert size={16} className="shrink-0 text-amber-500" />
          <p>By approving, this application will be sent directly to the CSR Partner for final funding disbursement.</p>
        </div>
      </div>
    </div>
  );
}
