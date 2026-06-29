'use client';

import { useEffect, useState } from "react";
import { Radio, Filter, Search } from "lucide-react";

type Tone = "ok" | "warn" | "info" | "danger";
type Log = {
  id: number;
  actor: string;
  role: string;
  action: string;
  target: string;
  time: string;
  tone: Tone;
};

const ACTORS = [
  { name: "Rohan Mehta", role: "Document Checker" },
  { name: "Priya Sharma", role: "Screening Officer" },
  { name: "Aman Verma", role: "Document Checker" },
  { name: "Meera Iyer", role: "Background Checker" },
  { name: "Infosys CSR", role: "CSR Partner" },
  { name: "Tata Trust", role: "CSR Partner" },
  { name: "Admin", role: "System" },
];

const ACTIONS: { text: string; tone: Tone }[] = [
  { text: "approved", tone: "ok" },
  { text: "rejected", tone: "danger" },
  { text: "flagged", tone: "warn" },
  { text: "screened", tone: "info" },
  { text: "placed on HOLD", tone: "warn" },
  { text: "funded ₹2.4L for", tone: "ok" },
  { text: "cleared docs of", tone: "ok" },
  { text: "requested re-upload for", tone: "warn" },
];

const SEED: Log[] = [
  { id: 1, actor: "Rohan Mehta", role: "Document Checker", action: "approved", target: "App #1042", time: "just now", tone: "ok" },
  { id: 2, actor: "Meera Iyer", role: "Background Checker", action: "flagged", target: "App #1031", time: "2m ago", tone: "warn" },
  { id: 3, actor: "Priya Sharma", role: "Screening Officer", action: "screened", target: "App #1029", time: "6m ago", tone: "info" },
  { id: 4, actor: "Tata Trust", role: "CSR Partner", action: "funded ₹2.4L for", target: "Batch B-19", time: "12m ago", tone: "ok" },
  { id: 5, actor: "Aman Verma", role: "Document Checker", action: "cleared docs of", target: "App #1078", time: "18m ago", tone: "ok" },
  { id: 6, actor: "Admin", role: "System", action: "placed on HOLD", target: "App #1101", time: "24m ago", tone: "warn" },
];

const toneBar: Record<Tone, string> = {
  ok: "bg-emerald-500",
  warn: "bg-amber-500",
  info: "bg-slate-400",
  danger: "bg-rose-500",
};

const tonePill: Record<Tone, string> = {
  ok: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warn: "bg-amber-50 text-amber-700 border-amber-200",
  info: "bg-slate-50 text-slate-600 border-slate-200",
  danger: "bg-rose-50 text-rose-700 border-rose-200",
};

function makeLog(id: number): Log {
  const a = ACTORS[Math.floor(Math.random() * ACTORS.length)];
  const act = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  return {
    id,
    actor: a.name,
    role: a.role,
    action: act.text,
    target: `App #${1100 + Math.floor(Math.random() * 200)}`,
    time: "just now",
    tone: act.tone,
  };
}

export default function LiveUpdatesPage() {
  const [logs, setLogs] = useState<Log[]>(SEED);
  const [q, setQ] = useState("");

  useEffect(() => {
    const i = setInterval(() => {
      setLogs((prev) => [makeLog(Date.now()), ...prev].slice(0, 60));
    }, 4000);
    return () => clearInterval(i);
  }, []);

  const filtered = logs.filter((l) =>
    (l.actor + l.role + l.action + l.target).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold tracking-tight text-slate-900 flex items-center gap-2">
            Live Updates
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Real-time activity from reviewers, officers, and partners.</p>
        </div>
      </header>

      <div className="rounded-xl border border-slate-200/80 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-200/80 px-4 py-3">
          <Radio className="h-4 w-4 text-slate-500" />
          <p className="text-sm font-medium text-slate-700">Activity Stream</p>
          <span className="text-xs text-slate-400">· {filtered.length} events</span>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search actor, action, app…"
                className="h-8 w-56 rounded-lg border border-slate-200 bg-slate-50 pl-7 pr-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-600 hover:bg-slate-50">
              <Filter className="h-3.5 w-3.5" />
              Filter
            </button>
          </div>
        </div>

        <ul className="divide-y divide-slate-100">
          {filtered.map((l) => (
            <li key={l.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/60">
              <span className={"h-2 w-2 shrink-0 rounded-full " + toneBar[l.tone]} />
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600">
                {l.actor.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-700 truncate">
                  <span className="font-medium text-slate-900">{l.actor}</span>{" "}
                  <span className="text-slate-500">{l.action}</span>{" "}
                  <span className="font-medium text-slate-900">{l.target}</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{l.role}</p>
              </div>
              <span className={"shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium " + tonePill[l.tone]}>
                {l.tone === "ok" ? "Success" : l.tone === "warn" ? "Warning" : l.tone === "danger" ? "Rejected" : "Info"}
              </span>
              <span className="shrink-0 w-20 text-right text-[11px] text-slate-400">{l.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
