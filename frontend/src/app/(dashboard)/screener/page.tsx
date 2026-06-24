"use client";

import { useEffect, useState } from "react";
import { screeningApi } from "@/lib/api";
import { ScreenerList, ScreenerDetail } from "@/components/screener/ScreenerViews";
import type { ScreeningApplicationRow } from "@/types/domain";

export default function ScreenerDashboard() {
  const [applications, setApplications] = useState<ScreeningApplicationRow[]>([]);
  const [selectedApp, setSelectedApp] = useState<ScreeningApplicationRow | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const res = await screeningApi.getPendingScreening();
      setApplications(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, []);

  const handleDecision = async (decision: 'Approve' | 'Reject') => {
    if (!selectedApp) return;
    if (decision === 'Reject' && !notes.trim()) {
      alert('Rejection reason is required.');
      return;
    }
    try {
      await screeningApi.submitScreening(selectedApp.applicationId, { decision, notes: notes || undefined });
      setApplications((prev) => prev.filter((a) => a.applicationId !== selectedApp.applicationId));
      setSelectedApp(null);
      setNotes("");
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Decision failed');
    }
  };

  return (
    <div className="space-y-8 animate-card-entrance">
      <header>
        <h1 className="text-4xl font-extrabold text-[#5b2c6f]">Screening Dashboard</h1>
        <p className="text-slate-500 mt-2">Final accept/reject — cannot be the same user as doc reviewer on a case.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 clay-card p-6">
          {loading ? <p className="text-slate-400 py-10 text-center">Loading...</p> : (
            <ScreenerList applications={applications} selectedId={selectedApp?.applicationId ?? null} onSelect={setSelectedApp} />
          )}
        </div>
        <div className="lg:col-span-2">
          {selectedApp ? (
            <ScreenerDetail app={selectedApp} notes={notes} onNotesChange={setNotes}
              onApprove={() => handleDecision('Approve')}
              onReject={() => handleDecision('Reject')} />
          ) : (
            <div className="clay-card h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400">
              Select an application to review
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
