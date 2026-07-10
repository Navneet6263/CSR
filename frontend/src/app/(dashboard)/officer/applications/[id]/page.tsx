"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Phone,
  Home,
  Users,
  IdCard,
  Camera,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MapPin,
  Wallet,
  GraduationCap,
} from "lucide-react";
import { getVisit } from "@/lib/officer-data";
import { TopNav } from "@/components/officer/TopNav";

type Decision = "pass" | "flag" | "fail" | null;

export default function FieldWorkspace({ params }: { params: { id: string } }) {
  const id = params.id;
  const router = useRouter();
  const visit = getVisit(id);

  const [photos, setPhotos] = useState({ home: false, family: false, college: false });
  const [notes, setNotes] = useState("");
  const [decision, setDecision] = useState<Decision>(null);
  const [reason, setReason] = useState("");

  if (!visit) return (
    <div className="flex flex-col min-h-screen">
      <TopNav />
      <p className="p-6 text-slate-500">Visit {id} not found.</p>
    </div>
  );

  const allPhotos = photos.home && photos.family && photos.college;
  const needsReason = decision === "flag" || decision === "fail";

  const submit = () => {
    if (!decision) return;
    if (needsReason && !reason.trim()) return;
    alert(`Submitted: ${decision.toUpperCase()} for ${visit.id}`);
    router.push("/officer");
  };

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <TopNav />
      <main className="relative z-10 mx-auto w-full max-w-[1400px] px-4 py-6 lg:px-8 space-y-5">
        <Link href="/officer" className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800">
          <ArrowLeft size={14} /> Back to queue
        </Link>

        {/* Student Card */}
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="font-mono text-[11px] text-slate-400">{visit.id}</p>
          <h1 className="mt-0.5 text-xl font-bold text-slate-900">{visit.studentName}</h1>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <InfoRow icon={Phone} label="Primary" value={visit.phone} />
            <InfoRow icon={Phone} label="Alternate" value={visit.altPhone} />
            <InfoRow icon={Wallet} label="Annual Income" value={`₹ ${visit.annualIncome.toLocaleString("en-IN")}`} />
            <InfoRow icon={GraduationCap} label="Enrolled" value={String(visit.enrollmentYear)} />
          </div>

          <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3 text-xs ring-1 ring-slate-100">
            <p className="flex items-start gap-2 text-slate-700">
              <MapPin size={14} className="mt-0.5 shrink-0 text-cyan-600" />
              <span>
                {visit.address.house}, {visit.address.street}, {visit.address.city}, {visit.address.state} — {visit.address.pincode}
              </span>
            </p>
            <p className="flex items-start gap-2 text-slate-700">
              <GraduationCap size={14} className="mt-0.5 shrink-0 text-cyan-600" />
              <span>{visit.college} · {visit.course} · {visit.isHosteller ? "Hosteller" : "Day Scholar"}</span>
            </p>
          </div>
        </section>

        {/* Evidence Upload */}
        <section>
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Evidence Checklist</h2>
          <div className="grid grid-cols-3 gap-2.5">
            <PhotoTile icon={Home} label="Home" done={photos.home} onClick={() => setPhotos((p) => ({ ...p, home: !p.home }))} />
            <PhotoTile icon={Users} label="Family" done={photos.family} onClick={() => setPhotos((p) => ({ ...p, family: !p.family }))} />
            <PhotoTile icon={IdCard} label="College ID" done={photos.college} onClick={() => setPhotos((p) => ({ ...p, college: !p.college }))} />
          </div>
          <div className="mt-3 rounded-xl bg-white p-3 text-xs ring-1 ring-slate-200">
            <p className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <MapPin size={14} className="text-cyan-600" /> Geolocation Snapshot
              </span>
              <span className="font-mono text-[11px] text-slate-500">19.9975° N, 73.7898° E</span>
            </p>
          </div>
        </section>

        {/* Notes */}
        <section>
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Officer Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., House is kutcha with tin roof. Family owns one buffalo. Income claim appears genuine..."
            rows={4}
            className="w-full resize-none rounded-xl border-0 bg-white p-3 text-sm text-slate-800 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </section>

        {/* Decision */}
        <section>
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Final Decision</h2>
          <div className="grid grid-cols-3 gap-2">
            <DecisionBtn active={decision === "pass"} onClick={() => setDecision("pass")} tone="emerald" icon={CheckCircle2} label="Pass" />
            <DecisionBtn active={decision === "flag"} onClick={() => setDecision("flag")} tone="amber" icon={AlertTriangle} label="Flag" />
            <DecisionBtn active={decision === "fail"} onClick={() => setDecision("fail")} tone="rose" icon={XCircle} label="Fail" />
          </div>
          {needsReason && (
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason (e.g., House was locked, address mismatch)"
              className="mt-3 w-full rounded-xl border-0 bg-white p-3 text-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          )}
          {!allPhotos && (
            <p className="mt-2 text-[11px] text-amber-600">Tip: upload all 3 evidence photos before submitting.</p>
          )}
        </section>

      </main>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-lg">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 lg:px-4">
          <div className="flex-1 text-[11px] text-slate-500">
            {decision ? <>Ready to submit: <span className="font-semibold text-slate-800 capitalize">{decision}</span></> : "Select a decision to continue"}
          </div>
          <button
            onClick={submit}
            disabled={!decision || (needsReason && !reason.trim())}
            className="rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-cyan-500/30 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none"
          >
            Submit Report
          </button>
        </div>
      </div>

    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: string }) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
        <Icon size={11} /> {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

function PhotoTile({ icon: Icon, label, done, onClick }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; done: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl p-2 text-xs font-semibold transition ${
        done
          ? "bg-gradient-to-br from-cyan-500 to-sky-600 text-white shadow-md shadow-cyan-500/30"
          : "bg-white text-slate-600 ring-1 ring-dashed ring-slate-300 hover:ring-cyan-400"
      }`}
    >
      {done ? <CheckCircle2 size={22} /> : <Camera size={22} className="text-slate-400 group-hover:text-cyan-500" />}
      <span>{label}</span>
      {done && <span className="absolute bottom-1.5 text-[9px] font-normal opacity-80">Uploaded</span>}
      <Icon size={0} className="hidden" />
    </button>
  );
}

function DecisionBtn({ active, onClick, tone, icon: Icon, label }: { active: boolean; onClick: () => void; tone: "emerald" | "amber" | "rose"; icon: React.ComponentType<{ size?: number }>; label: string }) {
  const styles = {
    emerald: active ? "bg-emerald-500 text-white ring-emerald-500 shadow-md shadow-emerald-500/30" : "bg-white text-emerald-700 ring-emerald-200 hover:ring-emerald-400",
    amber: active ? "bg-amber-500 text-white ring-amber-500 shadow-md shadow-amber-500/30" : "bg-white text-amber-700 ring-amber-200 hover:ring-amber-400",
    rose: active ? "bg-rose-500 text-white ring-rose-500 shadow-md shadow-rose-500/30" : "bg-white text-rose-700 ring-rose-200 hover:ring-rose-400",
  }[tone];
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 rounded-xl py-3 text-xs font-semibold ring-1 transition active:scale-[0.98] ${styles}`}>
      <Icon size={20} />
      {label}
    </button>
  );
}
