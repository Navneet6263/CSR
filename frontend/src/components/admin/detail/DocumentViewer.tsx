import { useState } from "react";
import { FileText, Download, Maximize2, Lock } from "lucide-react";

type DocStatus = "verified" | "pending" | "rejected";

const DOCS: { id: string; name: string; status: DocStatus; size: string }[] = [
  { id: "aadhar", name: "Aadhar Card", status: "verified", size: "1.2 MB" },
  { id: "pan", name: "PAN Card", status: "verified", size: "640 KB" },
  { id: "photo", name: "Passport Photo", status: "verified", size: "210 KB" },
  { id: "birth", name: "Birth Certificate", status: "verified", size: "780 KB" },
  { id: "caste", name: "Caste Certificate", status: "pending", size: "1.1 MB" },
  { id: "income", name: "Income Certificate", status: "pending", size: "840 KB" },
  { id: "domicile", name: "Domicile Certificate", status: "verified", size: "920 KB" },
  { id: "ration", name: "Ration Card", status: "verified", size: "560 KB" },
  { id: "itr", name: "Father's ITR / Form 16", status: "pending", size: "1.4 MB" },
  { id: "affidavit", name: "Income Affidavit", status: "pending", size: "720 KB" },
  { id: "marks10", name: "10th Marksheet", status: "rejected", size: "2.1 MB" },
  { id: "marks12", name: "12th Marksheet", status: "verified", size: "1.9 MB" },
  { id: "entrance", name: "Entrance Scorecard", status: "verified", size: "480 KB" },
  { id: "admission", name: "Admission Letter", status: "verified", size: "650 KB" },
  { id: "bonafide", name: "Bonafide Certificate", status: "pending", size: "320 KB" },
  { id: "fee", name: "Fee Receipt (Current Sem)", status: "pending", size: "410 KB" },
  { id: "idcard", name: "College ID Card", status: "verified", size: "290 KB" },
  { id: "hostel", name: "Hostel Receipt", status: "pending", size: "380 KB" },
  { id: "passbook", name: "Bank Passbook", status: "verified", size: "880 KB" },
  { id: "cheque", name: "Cancelled Cheque", status: "verified", size: "240 KB" },
  { id: "sop", name: "Statement of Purpose", status: "verified", size: "190 KB" },
  { id: "lor", name: "Recommendation Letter", status: "pending", size: "340 KB" },
];

const DOT: Record<DocStatus, string> = {
  verified: "bg-emerald-500",
  pending: "bg-amber-500",
  rejected: "bg-rose-500",
};

const LABEL: Record<DocStatus, string> = {
  verified: "Verified",
  pending: "Pending",
  rejected: "Rejected",
};

export default function DocumentViewer({ locked }: { locked: boolean }) {
  const [active, setActive] = useState(DOCS[0].id);
  const [showReason, setShowReason] = useState(false);
  const [reason, setReason] = useState("");
  const doc = DOCS.find((d) => d.id === active)!;

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <div className="text-[10px] uppercase tracking-widest text-slate-400">
          Document Checklist
        </div>
        <div className="text-[10px] uppercase tracking-widest text-slate-400">
          {DOCS.filter((d) => d.status === "verified").length} / {DOCS.length} verified
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 border-b border-slate-100 px-4 py-3">
        {DOCS.map((d) => {
          const isActive = d.id === active;
          return (
            <button
              key={d.id}
              onClick={() => setActive(d.id)}
              className={`group inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                isActive
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${DOT[d.status]}`} />
              {d.name}
            </button>
          );
        })}
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-slate-900">{doc.name}</div>
            <div className="text-xs text-slate-500">
              {doc.size} · Status:{" "}
              <span className="text-slate-700">{LABEL[doc.status]}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50">
              <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
            <button className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50">
              <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <div className="relative flex h-[360px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50">
          {locked ? (
            <div className="flex flex-col items-center text-slate-400">
              <Lock className="h-10 w-10" strokeWidth={1.25} />
              <div className="mt-3 text-sm font-medium text-slate-600">
                Document Locked
              </div>
              <div className="mt-1 text-xs">Released only by Admin override.</div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-slate-400">
              <FileText className="h-12 w-12" strokeWidth={1.25} />
              <div className="mt-3 text-xs uppercase tracking-widest">
                Preview unavailable
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          {showReason && (
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for rejection…"
              className="w-full rounded-lg border border-rose-200 bg-rose-50/40 px-3 py-1.5 text-xs text-slate-800 placeholder:text-rose-400 focus:border-rose-400 focus:bg-white focus:outline-none sm:w-64"
            />
          )}
          <button
            disabled={locked}
            onClick={() => setShowReason((v) => !v)}
            className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
          >
            ❌ Reject Document
          </button>
          <button
            disabled={locked}
            className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
          >
            ✅ Verify Document
          </button>
        </div>
      </div>
    </div>
  );
}
