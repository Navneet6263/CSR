"use client";
import { useState } from "react";
import { Megaphone, Pin, Trash2, Eye, Plus, Calendar, Globe2 } from "lucide-react";

type Banner = {
  id: string;
  title: string;
  body: string;
  tone: "info" | "success" | "warning" | "critical";
  pinned: boolean;
  audience: string;
  starts: string;
  ends: string;
  status: "live" | "scheduled" | "draft";
};

const seed: Banner[] = [
  {
    id: "b1",
    title: "Merit Scholarship 2026 — Applications Open",
    body: "Class 10–12 students can apply till 30 April. Documents required: Marksheet, Aadhaar, Income Cert.",
    tone: "info",
    pinned: true,
    audience: "All Visitors",
    starts: "2026-06-01",
    ends: "2026-07-30",
    status: "live",
  },
  {
    id: "b2",
    title: "Disbursement Complete — Batch #402",
    body: "₹12,00,000 released to 84 students across Maharashtra & Karnataka.",
    tone: "success",
    pinned: false,
    audience: "Homepage",
    starts: "2026-07-04",
    ends: "2026-07-15",
    status: "live",
  },
  {
    id: "b3",
    title: "Server Maintenance — 12 July, 2 AM IST",
    body: "Portal will be unavailable for 40 minutes for scheduled upgrades.",
    tone: "warning",
    pinned: false,
    audience: "All Visitors",
    starts: "2026-07-12",
    ends: "2026-07-12",
    status: "scheduled",
  },
];

const toneStyles: Record<Banner["tone"], string> = {
  info: "bg-slate-50 text-slate-700 border-slate-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  critical: "bg-rose-50 text-rose-700 border-rose-200",
};

const statusStyles: Record<Banner["status"], string> = {
  live: "bg-emerald-500",
  scheduled: "bg-amber-500",
  draft: "bg-slate-300",
};

export default function LandingNotifications() {
  const [banners, setBanners] = useState<Banner[]>(seed);
  const [tone, setTone] = useState<Banner["tone"]>("info");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const add = () => {
    if (!title.trim()) return;
    setBanners((b) => [
      {
        id: crypto.randomUUID(),
        title,
        body,
        tone,
        pinned: false,
        audience: "Homepage",
        starts: new Date().toISOString().slice(0, 10),
        ends: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10),
        status: "draft",
      },
      ...b,
    ]);
    setTitle("");
    setBody("");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <div className="xl:col-span-1 rounded-2xl border border-slate-200/80 bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900">New Landing Banner</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-medium text-slate-500">Headline</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Applications closing soon"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="Short description shown under the headline"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500">Tone</label>
            <div className="mt-1 grid grid-cols-4 gap-1.5">
              {(["info", "success", "warning", "critical"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={
                    "rounded-md border px-2 py-1.5 text-[11px] font-medium capitalize transition " +
                    (tone === t ? toneStyles[t] : "bg-white text-slate-500 border-slate-200 hover:border-slate-300")
                  }
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={add}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-xs font-medium text-white hover:bg-slate-800 transition"
          >
            <Plus className="h-3.5 w-3.5" /> Publish to Landing
          </button>
        </div>
      </div>

      <div className="xl:col-span-2 rounded-2xl border border-slate-200/80 bg-white">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/80">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Active & Scheduled</h3>
            <p className="text-[11.5px] text-slate-500">{banners.length} banners in rotation on scholarship.gov landing</p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Eye className="h-3.5 w-3.5" /> 24.8k impressions / day
          </div>
        </div>
        <ul className="divide-y divide-slate-100">
          {banners.map((b) => (
            <li key={b.id} className="p-4 hover:bg-slate-50/60 transition">
              <div className="flex items-start gap-3">
                <span className={"mt-1.5 h-2 w-2 rounded-full " + statusStyles[b.status]} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-slate-900 truncate">{b.title}</p>
                    <span className={"text-[10px] rounded px-1.5 py-0.5 border capitalize " + toneStyles[b.tone]}>{b.tone}</span>
                    {b.pinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 border border-slate-200 rounded px-1.5 py-0.5">
                        <Pin className="h-2.5 w-2.5" /> Pinned
                      </span>
                    )}
                  </div>
                  <p className="text-[12.5px] text-slate-600 mt-1 line-clamp-2">{b.body}</p>
                  <div className="mt-2 flex items-center gap-4 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1"><Globe2 className="h-3 w-3" /> {b.audience}</span>
                    <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {b.starts} → {b.ends}</span>
                    <span className="capitalize">{b.status}</span>
                  </div>
                </div>
                <button
                  onClick={() => setBanners((x) => x.filter((y) => y.id !== b.id))}
                  className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

