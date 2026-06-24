"use client";

import { useEffect, useState } from "react";
import { screeningApi } from "@/lib/api";
import { Award, Users, Wallet } from "lucide-react";
import CSRApplicationGrid, { CSRApprovalPanel, CSRStatCard } from "@/components/csr/CSRViews";
import type { CSRApplicationRow } from "@/types/domain";

export default function CSRDashboard() {
  const [applications, setApplications] = useState<CSRApplicationRow[]>([]);
  const [selectedApp, setSelectedApp] = useState<CSRApplicationRow | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCSRApps = async () => {
    try {
      const res = await screeningApi.getPendingCSR();
      setApplications(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCSRApps(); }, []);

  const handleDecision = async (decision: 'Approve' | 'Decline') => {
    if (!selectedApp) return;
    try {
      await screeningApi.submitCSR(selectedApp.applicationId, { decision, notes: notes || undefined });
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
        <h1 className="text-4xl font-extrabold text-slate-800">CSR Partner Dashboard</h1>
        <p className="text-slate-500 mt-2">Review shortlisted students — bank details are hidden for privacy.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CSRStatCard icon={<Wallet className="w-6 h-6" />} title="Pending Review" value={String(applications.length)} />
        <CSRStatCard icon={<Award className="w-6 h-6" />} title="Scholarships" value="Active" />
        <CSRStatCard icon={<Users className="w-6 h-6" />} title="Beneficiaries" value="—" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
          <Award className="text-[#f39c12]" /> Pending Funding Approvals
        </h2>
        {loading ? (
          <div className="text-center py-10 text-slate-500">Loading applications...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CSRApplicationGrid applications={applications} onSelect={setSelectedApp} />
          </div>
        )}
      </div>

      {selectedApp && (
        <CSRApprovalPanel app={selectedApp} notes={notes} onNotesChange={setNotes}
          onClose={() => setSelectedApp(null)}
          onApprove={() => handleDecision('Approve')}
          onDecline={() => handleDecision('Decline')} />
      )}
    </div>
  );
}
