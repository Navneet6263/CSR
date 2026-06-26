'use client';

import { FileCheck, ShieldCheck, CheckCircle2, XCircle, Eye, X, Download } from 'lucide-react';
import { useState } from 'react';

export default function ScreenerVerificationReports({ documents = [], bgChecks = [] }: { documents: any[], bgChecks: any[] }) {
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  const getStatusIcon = (status: string) => {
    if (status === 'Verified' || status === 'Pass') return <CheckCircle2 className="text-emerald-500" size={20} />;
    if (status === 'Rejected' || status === 'Fail') return <XCircle className="text-rose-500" size={20} />;
    return <ShieldCheck className="text-amber-500" size={20} />;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2 relative z-10">
          <FileCheck className="text-[#2e86c1]" /> Document Audit Report
        </h2>
        
        {documents.length === 0 ? (
          <div className="text-slate-500 italic font-medium">No document verification records found.</div>
        ) : (
          <div className="space-y-3 relative z-10">
            {documents.map((doc, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#f8fafc] border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 border border-slate-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.02)]">
                    <FileCheck size={24} className="text-[#2e86c1]" />
                  </div>
                  <div>
                    <div className="text-base font-black text-slate-700">{doc.DocumentType} Document</div>
                    <div className="text-xs font-bold text-slate-400 mt-0.5">Audited by Reviewer #{doc.ReviewedBy || 'System'}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                    {getStatusIcon(doc.Status)}
                    <span className={`text-sm font-black ${doc.Status === 'Verified' ? 'text-emerald-600' : 'text-amber-500'}`}>
                      {doc.Status}
                    </span>
                  </div>
                  <button 
                    onClick={() => setSelectedDoc(doc)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2e86c1] text-white rounded-xl text-sm font-bold shadow-[4px_4px_10px_rgba(46,134,193,0.3)] hover:bg-[#256c9d] transition-all"
                  >
                    <Eye size={16} /> Preview
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[8px_8px_16px_rgba(0,0,0,0.05),-8px_-8px_16px_rgba(255,255,255,0.8)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2 relative z-10">
          <ShieldCheck className="text-emerald-500" /> Background Check Report
        </h2>
        
        {bgChecks.length === 0 ? (
          <div className="text-slate-500 italic font-medium">No background check records found.</div>
        ) : (
          <div className="space-y-3 relative z-10">
            {bgChecks.map((check, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-[#f8fafc] border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 border border-slate-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.02)]">
                    <ShieldCheck size={20} className="text-slate-400" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-700">{check.CheckType} Verification</div>
                    <div className="text-xs font-bold text-slate-400">Completed: {new Date(check.CompletedAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                  {getStatusIcon(check.Result)}
                  <span className={`text-sm font-black ${check.Result === 'Pass' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {check.Result}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Document Viewer Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-slate-900/60 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/20">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-white/50 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#f0f4ff] flex items-center justify-center shrink-0">
                  <FileCheck size={24} className="text-[#2e86c1]" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">{selectedDoc.DocumentType}</h3>
                  <p className="text-sm font-bold text-slate-400">High-Resolution Preview</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-3 text-slate-400 hover:text-[#2e86c1] hover:bg-[#f0f4ff] rounded-xl transition-all">
                  <Download size={20} />
                </button>
                <button 
                  onClick={() => setSelectedDoc(null)}
                  className="p-3 bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-500 rounded-xl transition-all"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>
            </div>

            {/* Modal Body / Document Preview */}
            <div className="flex-1 overflow-auto p-8 bg-[#f8fafc] flex items-center justify-center">
              <div className="w-full max-w-3xl relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#2e86c1] to-emerald-400 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
                <img 
                  src={selectedDoc.FileURL || `https://placehold.co/800x1000/ffffff/2e86c1?text=${selectedDoc.DocumentType}+Document`} 
                  alt={selectedDoc.DocumentType}
                  className="relative w-full h-auto rounded-xl shadow-lg border border-slate-200 object-contain max-h-[60vh] bg-white"
                />
              </div>
            </div>

            {/* Modal Footer / Metadata */}
            <div className="px-8 py-5 border-t border-slate-100 bg-white flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</div>
                  <div className="flex items-center gap-1.5">
                    {getStatusIcon(selectedDoc.Status)}
                    <span className={`text-sm font-black ${selectedDoc.Status === 'Verified' ? 'text-emerald-600' : 'text-amber-500'}`}>{selectedDoc.Status}</span>
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Uploaded On</div>
                  <div className="text-sm font-bold text-slate-700">{selectedDoc.UploadedAt ? new Date(selectedDoc.UploadedAt).toLocaleDateString() : 'N/A'}</div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDoc(null)}
                className="px-6 py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
