'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CircleDot, ScrollText, Loader2, User } from "lucide-react";
import { TopNav } from "@/components/reviewer/TopNav";
import { DocumentViewer } from "@/components/reviewer/DocumentViewer";
import { AuditPanel } from "@/components/reviewer/AuditPanel";
import { verificationApi } from "@/lib/api/verification";
import ScreenerApplicantDetails from "@/components/screener/ScreenerApplicantDetails";

export default function AuditWorkspace() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  
  const [student, setStudent] = useState<Record<string, unknown> | null>(null);
  const [docs, setDocs] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  const [selectedId, setSelectedId] = useState<string>("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionDraft, setRejectionDraft] = useState("");
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  useEffect(() => {
    verificationApi.getAppDocs(parseInt(id)).then(res => {
      setStudent(res.data.student);
      
      const mappedDocs = res.data.docs.map((d: Record<string, unknown>) => ({
        id: d.ChecklistID.toString(),
        type: d.DocumentType,
        status: d.Status === 'Uploaded' || d.Status === 'Pending' ? 'Pending' : d.Status === 'Verified' ? 'Approved' : d.Status,
        url: d.FileURL,
        rejectionReason: d.RejectionReason,
      }));
      setDocs(mappedDocs);
      if (mappedDocs.length > 0) {
        setSelectedId(mappedDocs[0].id);
        // If all documents are already audited upon loading, this application was previously submitted.
        if (mappedDocs.every((d: any) => d.status !== 'Pending')) {
          setAlreadySubmitted(true);
        }
      }
    }).finally(() => setLoading(false));
  }, [id]);

  const selected = docs.find((d) => d.id === selectedId) ?? null;
  const allDone = docs.length > 0 && docs.every((d) => d.status === 'Approved' || d.status === 'Rejected');

  const approve = async (docId: string) => {
    await verificationApi.reviewDoc(parseInt(docId), { status: 'Verified' });
    setDocs((ds) => ds.map((d) => (d.id === docId ? { ...d, status: "Approved", rejectionReason: undefined } : d)));
    setRejectingId(null); setRejectionDraft("");
  };

  const reject = async (docId: string, reason: string) => {
    await verificationApi.reviewDoc(parseInt(docId), { status: 'Rejected', rejectionReason: reason });
    setDocs((ds) => ds.map((d) => (d.id === docId ? { ...d, status: "Rejected", rejectionReason: reason } : d)));
    setRejectingId(null); setRejectionDraft("");
  };

  const overall = docs.some((d) => d.status === "Rejected")
    ? { label: "Action Required", tone: "bg-rose-100 text-rose-700" }
    : allDone
    ? { label: "Ready to Submit", tone: "bg-emerald-100 text-emerald-700" }
    : { label: "In Review", tone: "bg-amber-100 text-amber-700" };

  const handleSubmit = () => {
    // In our backend, documents are updated one-by-one. 
    // Submitting the whole audit just means going back to the logs/dashboard.
    // If we wanted to change the overall application status to "DocAuditComplete", 
    // we would call another API here. For now, just navigate.
    
    const approvedCount = docs.filter((d) => d.status === "Approved").length;
    const rejectedCount = docs.filter((d) => d.status === "Rejected").length;
    alert(`Audit submitted successfully\n${approvedCount} approved · ${rejectedCount} rejected`);
    router.push("/reviewer/logs");
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!student) {
    return <div className="flex h-screen items-center justify-center">Student not found</div>;
  }

  return (
    <div className="min-h-screen pb-10">
      <TopNav />
      <main className="mx-auto mt-6 max-w-7xl space-y-5 px-4 sm:px-6">
        <div className="glass flex flex-col gap-3 rounded-2xl px-6 py-5 sm:flex-row sm:items-center sm:justify-between bg-white/60 shadow-sm border border-white">
          <div className="flex items-center gap-4">
            <Link href="/reviewer" className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/80 hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold tracking-tight">{student.name}</h1>
                <span className="font-mono text-xs text-muted-foreground">#{student.applicationId}</span>
              </div>
              <p className="text-xs text-muted-foreground">{student.scholarship}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="hidden sm:block">
              <div className="text-muted-foreground">Aadhar</div>
              <div className="font-mono text-foreground">{student.aadhar}</div>
            </div>
            <div className="hidden sm:block">
              <div className="text-muted-foreground">Annual Income</div>
              <div className="font-medium text-foreground">₹{student.income}</div>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${overall.tone}`}>
              <CircleDot className="h-3 w-3" /> {overall.label}
            </span>
            <button
              onClick={() => setShowProfile(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 transition-all hover:scale-[1.02] hover:bg-blue-100"
            >
              <User className="h-3 w-3" /> Full Profile
            </button>
            <Link
              href="/reviewer/logs"
              className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-foreground transition-all hover:scale-[1.02] hover:bg-white"
            >
              <ScrollText className="h-3 w-3" /> Activity log
            </Link>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]" style={{ minHeight: "calc(100vh - 220px)" }}>
          <DocumentViewer doc={selected} />
          <AuditPanel
            docs={docs}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onApprove={approve}
            onReject={reject}
            rejectingId={rejectingId}
            setRejectingId={setRejectingId}
            rejectionDraft={rejectionDraft}
            setRejectionDraft={setRejectionDraft}
            onSubmit={handleSubmit}
            allDone={allDone}
            alreadySubmitted={alreadySubmitted}
          />
        </div>
      </main>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6" onClick={() => setShowProfile(false)}>
          <div className="relative w-full max-w-5xl h-[85vh] bg-slate-50 rounded-2xl shadow-2xl overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">Applicant Details</h2>
              <button 
                onClick={() => setShowProfile(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200"
              >
                Close
              </button>
            </div>
            <div className="p-6">
              <ScreenerApplicantDetails student={student} hideBankDetails={true} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
