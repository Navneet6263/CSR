'use client';

import { useEffect, useState } from 'react';
import { verificationApi } from '@/lib/api';
import { ShieldCheck, X, Search, Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { BGCheckApplicationRow } from '@/types/domain';

const CHECK_TYPES = ['Identity', 'Address', 'IncomeVerification'] as const;

export default function OfficerDashboard() {
  const [applications, setApplications] = useState<BGCheckApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<BGCheckApplicationRow | null>(null);
  const [checkType, setCheckType] = useState<string>(CHECK_TYPES[0]);
  const [result, setResult] = useState<'Pass' | 'Fail' | 'Inconclusive'>('Pass');
  const [notes, setNotes] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPending = async () => {
    try {
      const res = await verificationApi.getPendingBGChecks();
      setApplications(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    if (result === 'Fail' && !notes.trim()) {
      alert('Notes are required when result is Fail.');
      return;
    }
    setSubmitting(true);
    try {
      await verificationApi.submitBGCheck(selectedApp.applicationId, {
        checkType, result, notes: notes || undefined, evidenceUrl: evidenceUrl || undefined,
      });
      setSelectedApp(null);
      setNotes('');
      setEvidenceUrl('');
      fetchPending();
    } catch {
      alert('Failed to submit check.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-[#2e86c1]/10 rounded-xl">
          <ShieldCheck className="w-6 h-6 text-[#2e86c1]" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Background Verification</h1>
          <p className="text-sm text-gray-500 mt-1">Conduct identity, address, and income checks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="clay-card p-4 border-l-4 border-[#2e86c1]">
          <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
            <Shield className="w-3 h-3" />Pending Checks
          </p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{applications.length}</p>
        </div>
        <div className="clay-card p-4 border-l-4 border-[#0e6251]">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Today's Completed</p>
          <p className="text-3xl font-bold text-[#0e6251] mt-2">0</p>
        </div>
        <div className="clay-card p-4 border-l-4 border-[#f39c12]">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Time (mins)</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">12</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="clay-card p-6">
            <h2 className="font-semibold text-gray-700 mb-4">Verification Queue</h2>
            {loading ? (
              <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2e86c1]" /></div>
            ) : applications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No pending applications</p>
                <p className="text-sm text-gray-400 mt-1">All checks completed</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div key={app.applicationId}
                    className={`p-5 rounded-xl transition-all cursor-pointer ${
                      selectedApp?.applicationId === app.applicationId 
                        ? 'ring-2 ring-[#2e86c1]/40 bg-[#2e86c1]/5' 
                        : 'bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedApp(app)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#2e86c1]/10 rounded-lg">
                          <Shield className="w-5 h-5 text-[#2e86c1]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{app.studentName}</h3>
                          <p className="text-xs text-gray-500 mt-1">App #{app.applicationId}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-[#f39c12]/10 text-[#f39c12] text-xs font-semibold rounded-full">
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:sticky lg:top-6 lg:h-fit">
          <div className="clay-card p-6">
            <h2 className="font-semibold text-gray-700 mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#2e86c1]" />
              Submit Verification
            </h2>
            {!selectedApp ? (
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Select application from queue</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-600 uppercase tracking-wide mb-2 font-semibold">Selected</p>
                  <p className="font-mono text-sm font-bold text-gray-800">#{selectedApp.applicationId}</p>
                  <button type="button" onClick={() => setSelectedApp(null)}
                    className="mt-2 text-xs text-blue-600 hover:underline">
                    Change
                  </button>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Check Type</label>
                  <select value={checkType} onChange={(e) => setCheckType(e.target.value)} 
                    className="clay-input w-full p-3 rounded-xl border-2">
                    {CHECK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Result</label>
                  <select value={result} onChange={(e) => setResult(e.target.value as typeof result)} 
                    className="clay-input w-full p-3 rounded-xl border-2">
                    <option value="Pass">✓ Pass</option>
                    <option value="Fail">✗ Fail</option>
                    <option value="Inconclusive">⚠ Inconclusive</option>
                  </select>
                </div>

                {result === 'Fail' && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                      <p className="text-xs text-red-700">Notes are mandatory for failed verification</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
                    Notes {result === 'Fail' && <span className="text-red-500">*</span>}
                  </label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                    placeholder="Enter verification notes..."
                    className="clay-input w-full p-3 rounded-xl border-2 resize-none" required={result === 'Fail'} />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Evidence URL</label>
                  <input type="url" value={evidenceUrl} onChange={(e) => setEvidenceUrl(e.target.value)}
                    placeholder="https://..." className="clay-input w-full p-3 rounded-xl border-2" />
                </div>

                <button type="submit" disabled={submitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2e86c1] to-[#5b2c6f] text-white font-bold hover:shadow-lg transition-all disabled:opacity-60">
                  {submitting ? 'Submitting...' : 'Submit Verification'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
