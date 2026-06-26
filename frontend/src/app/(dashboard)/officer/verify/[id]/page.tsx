'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { verificationApi } from '@/lib/api';
import { TopNav } from '@/components/officer/TopNav';
import { Shield, MapPin, User, Banknote, ArrowLeft, CheckCircle2, XCircle, AlertTriangle, FileText } from 'lucide-react';
import Link from 'next/link';
import ScreenerApplicantDetails from '@/components/screener/ScreenerApplicantDetails';

interface BGCheckDetail {
  student: {
    name: string;
    email: string;
    applicationId: number;
    applicationStatus: string;
    scholarship: string;
    aadhar: string;
    income: number;
    phone: string;
    address: string;
  };
  docs: { type: string; url: string; status: string }[];
  checks: { type: string; result: string; notes: string; evidenceUrl: string; completedAt: string }[];
}

const CHECK_CATEGORIES = [
  { id: 'Identity', label: 'Identity Verification', icon: User, desc: 'Verify person matches Aadhar & Docs' },
  { id: 'Address', label: 'Address & Home Check', icon: MapPin, desc: 'Physical visit to current address' },
  { id: 'IncomeVerification', label: 'Income Verification', icon: Banknote, desc: 'Verify family economic status' },
];

export default function VerificationDetail() {
  const params = useParams();
  const router = useRouter();
  const appId = parseInt(params.id as string, 10);

  const [data, setData] = useState<BGCheckDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  // Form states for the currently active check
  const [activeCheck, setActiveCheck] = useState<string>('Identity');
  const [result, setResult] = useState<'Pass' | 'Fail' | 'Inconclusive'>('Pass');
  const [notes, setNotes] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);

  const fetchDetails = async () => {
    try {
      const res = await verificationApi.getBGCheckDetails(appId);
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load application details');
      router.push('/officer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appId) fetchDetails();
  }, [appId]);

  const handleSubmitCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (result === 'Fail' && !notes.trim()) {
      alert('Notes are mandatory when marking as Fail.');
      return;
    }

    setSubmitting(activeCheck);
    try {
      await verificationApi.submitBGCheck(appId, {
        checkType: activeCheck,
        result,
        notes: notes || undefined,
        evidenceUrl: evidenceUrl || undefined
      });
      // Refresh to get the updated status and checks
      await fetchDetails();
      setNotes('');
      setEvidenceUrl('');
      setResult('Pass');
    } catch (err) {
      alert('Failed to submit verification check.');
      console.error(err);
    } finally {
      setSubmitting(null);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-[calc(100vh-100px)] pb-10">
        <TopNav />
        <div className="flex justify-center p-20"><div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600"></div></div>
      </div>
    );
  }

  const { student, docs, checks } = data;

  return (
    <div className="min-h-[calc(100vh-100px)] pb-10">
      <TopNav />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/officer" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 mb-2">
              <ArrowLeft className="h-4 w-4" /> Back to Queue
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
              Application #{student.applicationId} 
              <span className="text-sm font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{student.applicationStatus}</span>
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: Profile & Docs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass rounded-2xl bg-white/60 p-1 shadow-sm border border-white">
              <ScreenerApplicantDetails student={student} hideBankDetails={true} />
            </div>

            {/* Documents */}
            <div className="glass rounded-xl bg-white/60 p-4 shadow-sm border border-white">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-blue-600" /> Reference Documents
              </h2>
              <div className="space-y-2">
                {docs.length === 0 ? <p className="text-xs text-slate-500">No documents uploaded.</p> : docs.map((d, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/50 p-2.5 rounded-lg border border-white">
                    <div>
                      <div className="font-semibold text-slate-700 text-xs">{d.type}</div>
                      <div className="text-[10px] font-medium text-green-600">{d.status}</div>
                    </div>
                    <button onClick={() => setPreviewDoc(d.url)} className="text-xs font-bold text-blue-600 hover:underline px-2 py-1 bg-blue-50 rounded-md">View</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Verification Form */}
          <div className="lg:col-span-7">
            <div className="glass rounded-2xl bg-white/60 shadow-sm border border-white sticky top-24">
              <div className="p-6 border-b border-white/60 bg-white/40 rounded-t-2xl">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Shield className="h-6 w-6 text-blue-600" /> Field Verification Checklist
                </h2>
                <p className="text-sm text-slate-500 mt-1">Complete all 3 checks to finalize the background verification.</p>
              </div>

              <div className="p-6 space-y-6">
                {CHECK_CATEGORIES.map((cat) => {
                  const existingCheck = checks.find(c => c.type === cat.id);
                  const isCompleted = !!existingCheck;
                  const isSuccess = existingCheck?.result === 'Pass';
                  const isFail = existingCheck?.result === 'Fail';
                  
                  return (
                    <div key={cat.id} className={`rounded-xl border ${isCompleted ? (isSuccess ? 'border-green-200 bg-green-50/50' : isFail ? 'border-red-200 bg-red-50/50' : 'border-amber-200 bg-amber-50/50') : 'border-blue-100 bg-white/50'} overflow-hidden transition-all`}>
                      
                      {/* Check Header */}
                      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer" onClick={() => !isCompleted && setActiveCheck(cat.id)}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isCompleted ? (isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700') : (activeCheck === cat.id ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-100 text-blue-600')}`}>
                            <cat.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800">{cat.label}</h3>
                            <p className="text-xs text-slate-500">{cat.desc}</p>
                          </div>
                        </div>
                        <div>
                          {isCompleted ? (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${isSuccess ? 'bg-green-100 text-green-700' : isFail ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                              {isSuccess ? <CheckCircle2 className="h-4 w-4"/> : isFail ? <XCircle className="h-4 w-4"/> : <AlertTriangle className="h-4 w-4"/>}
                              {existingCheck.result}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending</span>
                          )}
                        </div>
                      </div>

                      {/* Check Form (Only if active and NOT completed) */}
                      {!isCompleted && activeCheck === cat.id && (
                        <div className="p-4 pt-0 border-t border-black/5">
                          <form onSubmit={handleSubmitCheck} className="mt-4 space-y-4">
                            <div>
                              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Verification Result</label>
                              <div className="grid grid-cols-3 gap-3">
                                {['Pass', 'Fail', 'Inconclusive'].map(r => (
                                  <label key={r} className={`flex items-center justify-center py-3 rounded-xl border-2 cursor-pointer font-semibold text-sm transition-all ${result === r ? (r === 'Pass' ? 'border-green-500 bg-green-50 text-green-700' : r === 'Fail' ? 'border-red-500 bg-red-50 text-red-700' : 'border-amber-500 bg-amber-50 text-amber-700') : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
                                    <input type="radio" name="result" value={r} checked={result === r} onChange={(e) => setResult(e.target.value as any)} className="sr-only" />
                                    {r}
                                  </label>
                                ))}
                              </div>
                            </div>
                            
                            {result === 'Fail' && (
                              <div className="p-3 bg-red-50 rounded-lg flex items-start gap-2 border border-red-100">
                                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                                <p className="text-xs font-medium text-red-700">Detailed notes are mandatory when marking a check as Failed. The application will be sent for review.</p>
                              </div>
                            )}

                            <div>
                              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Notes {result === 'Fail' && <span className="text-red-500">*</span>}</label>
                              <textarea 
                                value={notes} onChange={e => setNotes(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                rows={3} placeholder={`Enter findings for ${cat.label}...`}
                                required={result === 'Fail'}
                              />
                            </div>

                            <div>
                              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Evidence Photo URL (Optional)</label>
                              <input 
                                type="url" value={evidenceUrl} onChange={e => setEvidenceUrl(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder="https://..."
                              />
                            </div>

                            <button type="submit" disabled={!!submitting} className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white shadow-md hover:bg-blue-700 hover:shadow-lg transition-all disabled:opacity-50">
                              {submitting === cat.id ? 'Submitting...' : `Submit ${cat.label}`}
                            </button>
                          </form>
                        </div>
                      )}
                      
                      {/* Completed Details */}
                      {isCompleted && (
                        <div className="p-4 pt-0 border-t border-black/5 bg-white/30 text-sm">
                          <div className="mt-3 text-slate-700"><span className="font-bold text-slate-500">Notes:</span> {existingCheck.notes || 'No notes provided.'}</div>
                          {existingCheck.evidenceUrl && (
                            <div className="mt-2"><a href={existingCheck.evidenceUrl} target="_blank" className="font-bold text-blue-600 hover:underline">View Evidence</a></div>
                          )}
                          <div className="mt-2 text-xs font-medium text-slate-400">Completed on: {new Date(existingCheck.completedAt).toLocaleString()}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6" onClick={() => setPreviewDoc(null)}>
          <div className="relative w-full max-w-4xl h-[85vh] bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700/50">
              <div className="flex items-center gap-2 text-white">
                <FileText className="h-5 w-5 text-blue-400" />
                <h3 className="font-semibold text-sm">Document Preview</h3>
              </div>
              <button 
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-rose-500 hover:text-white transition-colors"
                title="Close (Cut)"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            {/* Viewer */}
            <div className="flex-1 w-full bg-slate-950 p-2">
              <iframe 
                src={previewDoc} 
                className="w-full h-full rounded-lg bg-white"
                title="Document Viewer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
