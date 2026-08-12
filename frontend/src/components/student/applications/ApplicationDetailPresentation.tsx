import { CheckCircle2, CircleDashed, XCircle } from 'lucide-react';
import { applicationTimeline, displayStatus, stageIndex } from '@/lib/applicationPresentation';

type DocumentRow = { name: string; status: 'verified' | 'pending' | 'rejected'; reason?: string };
export type StudentApplicationDetail = {
  id: number; scholarship: string; provider: string; category: string; status: string; amount: string;
  appliedOn: string; currentStage: string; reviewer: string; progressPct: number; nextAction: string;
  disbursedOn?: string | null; timeline: ReturnType<typeof applicationTimeline>; submittedDocs: DocumentRow[];
};

export function mapStudentApplicationDetail(data: Record<string, any>): StudentApplicationDetail {
  const status = String(data.Status ?? data.status ?? 'Draft'); const display = displayStatus(status);
  const activeIndex = stageIndex(status); const amount = Number(data.ScholarshipAmount ?? data.scholarshipAmount ?? 0);
  return {
    id: Number(data.ApplicationID ?? data.id), scholarship: String(data.ScholarshipName ?? data.scholarshipName ?? 'Scholarship'),
    provider: String(data.SponsorName ?? ''), category: String(data.SubmittedSnapshot?.profile?.category ?? ''),
    status: display, amount: amount ? `₹${amount.toLocaleString('en-IN')}` : 'Variable',
    appliedOn: new Date(data.CreatedAt ?? data.createdAt).toLocaleDateString('en-IN'), currentStage: status,
    reviewer: data.AssignedScreener || data.AssignedBGOfficer || data.AssignedDocReviewer ? 'Assigned' : 'Unassigned',
    progressPct: Math.round(((activeIndex + 1) / 6) * 100),
    nextAction: display === 'Funded' ? 'Payment completed.' : display === 'Rejected'
      ? 'Review the recorded decision and requested action.' : 'Your application is being processed.',
    disbursedOn: status === 'PaymentCompleted' ? data.UpdatedAt : null, timeline: applicationTimeline(status),
    submittedDocs: (data.documentChecklist ?? []).map((document: Record<string, any>) => ({
      name: String(document.DocumentType), status: document.Status === 'Verified' ? 'verified'
        : ['Rejected', 'ReUploadRequested'].includes(document.Status) ? 'rejected' : 'pending',
      reason: document.RejectionReason ? String(document.RejectionReason) : undefined,
    })),
  };
}

export function MetaTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-xl bg-white/10 p-3 shadow-sm backdrop-blur"><div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-white/80">{icon}{label}</div>
    <p className="mt-1 truncate text-sm font-semibold text-white">{value}</p></div>;
}

export function DocBadge({ status }: { status: DocumentRow['status'] }) {
  if (status === 'verified') return <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-medium text-success"><CheckCircle2 className="h-3 w-3"/>Verified</span>;
  if (status === 'rejected') return <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-destructive-soft px-2 py-0.5 text-[11px] font-medium text-destructive"><XCircle className="h-3 w-3"/>Rejected</span>;
  return <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-medium text-warning-foreground"><CircleDashed className="h-3 w-3"/>Pending</span>;
}
