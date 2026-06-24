'use client';

import { useEffect, useState } from 'react';
import { verificationApi } from '@/lib/api';
import { ShieldCheck, X, Search } from 'lucide-react';
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
    <div className="max-w-6xl mx-auto space-y-8 animate-card-entrance">
      <div className="flex items-center space-x-4">
        <div className="clay-card p-3"><ShieldCheck className="w-8 h-8 text-[#2e86c1]" /></div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Background Check Queue</h1>
          <p className="text-gray-500 mt-1">Conduct identity, address, and income verification</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 clay-card p-6">
          {loading ? (
            <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2e86c1]" /></div>
          ) : applications.length === 0 ? (
            <p className="text-center p-8 text-gray-500">No applications pending background check.</p>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.applicationId} role="button" tabIndex={0}
                  className={`clickable-card p-5 rounded-2xl ${selectedApp?.applicationId === app.applicationId ? 'ring-2 ring-[#2e86c1]/40 bg-[#2e86c1]/5' : 'bg-white'}`}
                  onClick={() => setSelectedApp(app)}
                >
                  <h3 className="font-bold text-gray-800">App #{app.applicationId}</h3>
                  <p className="text-sm text-gray-500 mt-1">Student: {app.studentName}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-[#0e6251]/10 text-[#0e6251] text-xs font-semibold rounded-full">{app.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="clay-card p-6 sticky top-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Submit Check</h2>
          {!selectedApp ? (
            <div className="text-center p-8 clay-input rounded-2xl">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Select an application from the list.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-[#2e86c1]">App #{selectedApp.applicationId}</span>
                <button type="button" onClick={() => setSelectedApp(null)} className="clickable text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
              </div>
              <select value={checkType} onChange={(e) => setCheckType(e.target.value)} className="clay-input w-full p-3">
                {CHECK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={result} onChange={(e) => setResult(e.target.value as typeof result)} className="clay-input w-full p-3">
                <option value="Pass">Pass</option>
                <option value="Fail">Fail</option>
                <option value="Inconclusive">Inconclusive</option>
              </select>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                placeholder={result === 'Fail' ? 'Notes (required on Fail)...' : 'Notes...'}
                className="clay-input w-full p-3 resize-none" required={result === 'Fail'} />
              <input type="url" value={evidenceUrl} onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="Evidence URL (optional)" className="clay-input w-full p-3" />
              <button type="submit" disabled={submitting}
                className="clickable w-full py-3 rounded-xl bg-[#2e86c1] text-white font-bold clay-button hover:bg-[#21618c] disabled:opacity-60">
                {submitting ? 'Submitting...' : 'Submit Verification'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
