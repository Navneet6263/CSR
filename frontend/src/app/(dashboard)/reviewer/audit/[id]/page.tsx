'use client';

import { ArrowLeft, CircleDot, Loader2, RotateCcw, ScrollText, User } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AuditPanel } from '@/components/reviewer/AuditPanel';
import { DocumentViewer } from '@/components/reviewer/DocumentViewer';
import { TopNav } from '@/components/reviewer/TopNav';
import ScreenerApplicantDetails from '@/components/screener/ScreenerApplicantDetails';
import { verificationApi } from '@/lib/api/verification';
import type { ReviewerAuditStudent, ReviewerDocument } from '@/types/reviewer';

interface DetailResponse {
  student: ReviewerAuditStudent;
  docs: Record<string, unknown>[];
  returnInstruction?: { notes?: string; returnedAt?: string; returnedBy?: string } | null;
}

function mapDocument(row: Record<string, unknown>): ReviewerDocument {
  const status = String(row.Status ?? 'Pending') as ReviewerDocument['status'];
  return {
    key: String(row.ChecklistID), checklistId: Number(row.ChecklistID),
    label: String(row.DocumentType ?? 'Document'), verifies: String(row.DocumentType ?? 'Document'),
    status, reason: row.RejectionReason ? String(row.RejectionReason) : undefined,
    required: true, url: row.FileURL ? String(row.FileURL) : undefined,
  };
}

export default function AuditWorkspace() {
  const id = Number(useParams<{ id: string }>().id);
  const router = useRouter();
  const [student, setStudent] = useState<ReviewerAuditStudent | null>(null);
  const [docs, setDocs] = useState<ReviewerDocument[]>([]);
  const [returnInstruction, setReturnInstruction] = useState<DetailResponse['returnInstruction']>(null);
  const [selectedId, setSelectedId] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionDraft, setRejectionDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!Number.isInteger(id) || id <= 0) { setError('Invalid application.'); setLoading(false); return; }
    verificationApi.getAppDocs(id).then((response) => {
      const detail = response.data as unknown as DetailResponse;
      const mapped = (detail.docs ?? []).map(mapDocument);
      setStudent(detail.student); setDocs(mapped); setSelectedId(mapped[0]?.key ?? '');
      setReturnInstruction(detail.returnInstruction ?? null);
    }).catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false));
  }, [id]);

  const selected = docs.find((doc) => doc.key === selectedId) ?? null;
  const allDone = docs.length > 0 && docs.every((doc) => doc.status === 'Verified');
  const alreadySubmitted = Boolean(student && !['Submitted', 'AutoMatched', 'DocAuditInProgress'].includes(student.applicationStatus));
  const overall = useMemo(() => docs.some((doc) => doc.status === 'ReUploadRequested')
    ? { label: 'Re-upload Required', tone: 'bg-rose-100 text-rose-700' }
    : allDone ? { label: 'Audit Complete', tone: 'bg-emerald-100 text-emerald-700' }
      : { label: 'In Review', tone: 'bg-amber-100 text-amber-700' }, [allDone, docs]);

  const review = async (docId: string, status: 'Verified' | 'Rejected', reason?: string) => {
    setError('');
    try {
      const response = await verificationApi.reviewDoc(Number(docId), { status, rejectionReason: reason });
      const result = response.data as { status?: ReviewerDocument['status'] } | undefined;
      setDocs((current) => current.map((doc) => doc.key === docId
        ? { ...doc, status: result?.status ?? (status === 'Verified' ? 'Verified' : 'ReUploadRequested'), reason }
        : doc));
      setRejectingId(null); setRejectionDraft('');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Review could not be saved.'); }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!student) return <div className="flex h-screen items-center justify-center">{error || 'Application not found.'}</div>;

  return <div className="min-h-screen pb-10"><TopNav />
    <main className="mx-auto mt-6 max-w-7xl space-y-5 px-4 sm:px-6">
      <div className="glass flex flex-col gap-3 rounded-2xl border border-white bg-white/60 px-6 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4"><Link href="/reviewer" className="rounded-lg p-2 text-muted-foreground hover:bg-white/80"><ArrowLeft className="h-4 w-4" /></Link>
          <div><div className="flex items-center gap-3"><h1 className="text-lg font-semibold">{student.name}</h1>
            <span className="font-mono text-xs text-muted-foreground">#{student.applicationId}</span></div>
            <p className="text-xs text-muted-foreground">{student.scholarship}</p></div></div>
        <div className="flex items-center gap-4 text-xs">
          <div className="hidden sm:block"><div className="text-muted-foreground">Aadhaar</div><div className="font-mono">{student.aadhar ?? '—'}</div></div>
          <div className="hidden sm:block"><div className="text-muted-foreground">Annual Income</div><div className="font-medium">₹{Number(student.income ?? 0).toLocaleString('en-IN')}</div></div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 ${overall.tone}`}><CircleDot className="h-3 w-3" />{overall.label}</span>
          <button onClick={() => setShowProfile(true)} className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 font-bold text-blue-700"><User className="h-3 w-3" />Full Profile</button>
          <Link href="/reviewer/logs" className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1"><ScrollText className="h-3 w-3" />Activity log</Link>
        </div>
      </div>
      {error && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
      {returnInstruction?.notes && <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900"><RotateCcw className="mt-0.5 h-4 w-4 shrink-0" /><div><p className="text-xs font-bold">Returned by Screening Officer</p><p className="mt-1 text-sm leading-relaxed">{returnInstruction.notes}</p>{returnInstruction.returnedAt && <p className="mt-1 text-[10px] text-amber-700">{new Date(returnInstruction.returnedAt).toLocaleString('en-IN')}</p>}</div></div>}
      <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]" style={{ minHeight: 'calc(100vh - 220px)' }}>
        <DocumentViewer doc={selected} />
        <AuditPanel docs={docs} selectedId={selectedId} onSelect={setSelectedId}
          onApprove={(docId) => review(docId, 'Verified')} onReject={(docId, reason) => review(docId, 'Rejected', reason)}
          rejectingId={rejectingId} setRejectingId={setRejectingId} rejectionDraft={rejectionDraft}
          setRejectionDraft={setRejectionDraft} onSubmit={() => router.push('/reviewer')}
          allDone={allDone} alreadySubmitted={alreadySubmitted} />
      </div>
    </main>
    {showProfile && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setShowProfile(false)}>
      <div className="h-[85vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-slate-50 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-50 flex items-center justify-between border-b bg-white px-6 py-4"><h2 className="text-xl font-bold">Applicant Details</h2>
          <button onClick={() => setShowProfile(false)} className="rounded-lg bg-slate-100 px-4 py-2 font-bold">Close</button></div>
        <div className="p-6"><ScreenerApplicantDetails student={student as unknown as Record<string, unknown>} hideBankDetails /></div>
      </div>
    </div>}
  </div>;
}
