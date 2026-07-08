"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { applications, type DocStatus, type DocItem } from "@/lib/mock-data";
import { StudentPanel } from "@/components/reviewer/StudentPanel";
import { DocChecklist } from "@/components/reviewer/DocChecklist";
import { DocViewer } from "@/components/reviewer/DocViewer";
import { ActionBar } from "@/components/reviewer/ActionBar";
import { TopNav } from "@/components/reviewer/TopNav";

export default function Workspace({ params }: { params: { id: string } }) {
  const app = applications.find((a) => a.id === params.id);
  
  if (!app) {
    return (
      <div className="min-h-screen bg-bg text-fg pb-16">
        <TopNav />
        <main className="mx-auto max-w-[1600px] px-6 mt-8">
            <div className="glass p-10 text-center max-w-md mx-auto">
            <h2 className="text-xl font-semibold">Application not found</h2>
            <Link href="/reviewer" className="mt-4 inline-flex text-primary text-sm">← Back to queue</Link>
            </div>
        </main>
      </div>
    );
  }

  const [docs, setDocs] = useState<DocItem[]>(app.documents);
  const [activeKey, setActiveKey] = useState<string>(docs[0].key);
  const [forwarded, setForwarded] = useState(false);

  const active = docs.find((d) => d.key === activeKey)!;
  const allDone = useMemo(() => docs.filter((d) => d.required).every((d) => d.status !== "Pending"), [docs]);

  const onAction = (status: DocStatus, reason?: string) => {
    setDocs((cur) => cur.map((d) => d.key === activeKey ? { ...d, status, reason } : d));
    const idx = docs.findIndex((d) => d.key === activeKey);
    const next = docs.slice(idx + 1).find((d) => d.status === "Pending" && d.key !== activeKey);
    if (next) setActiveKey(next.key);
  };

  return (
    <div className="min-h-screen bg-bg text-fg pb-16">
      <TopNav />
      <main className="mx-auto max-w-[1600px] px-6 mt-8">
        <div className="space-y-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <Link href="/reviewer" className="inline-flex items-center gap-1.5 text-xs text-fg-subtle hover:text-primary transition">
                <ArrowLeft className="w-3 h-3" /> Back to queue
              </Link>
              <h1 className="mt-2 text-2xl font-display font-bold flex items-center gap-3">
                Document Audit
                <span className="font-mono text-primary text-lg">{app.id}</span>
              </h1>
              <p className="text-fg-muted text-sm mt-1">Cross-verify every uploaded proof against student-submitted data.</p>
            </div>
            <div className="flex items-center gap-2 glass px-4 py-2 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span className="text-fg-subtle">Status:</span>
              <span className="text-primary">{forwarded ? "BGCheckInProgress" : app.status}</span>
            </div>
          </div>

          {forwarded && (
            <div className="glass p-4 border-success/40 bg-success/10 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-success" />
              <div className="flex-1">
                <div className="font-semibold text-success">Audit complete · forwarded to Background Check</div>
                <div className="text-xs text-fg-muted">Logged as AUD-8822 · Reviewer: Ritu Verma · {new Date().toLocaleString()}</div>
              </div>
              <Link href="/reviewer" className="text-xs text-primary hover:underline">Next application →</Link>
            </div>
          )}

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-6">
              <StudentPanel student={app.student} appId={app.id} scholarship={app.scholarship} />
              <DocChecklist docs={docs} activeKey={activeKey} onSelect={setActiveKey} />
            </div>
            <div className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-4">
              <DocViewer doc={active} />
              <ActionBar doc={active} onAction={onAction} allDone={allDone && !forwarded} onComplete={() => setForwarded(true)} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
