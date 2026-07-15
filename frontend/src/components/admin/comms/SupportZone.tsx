"use client";
import { useMemo, useState } from "react";
import { LifeBuoy, MapPin, Clock, User2, AlertTriangle, CheckCircle2, MessageCircle } from "lucide-react";

type Priority = "low" | "medium" | "high" | "urgent";
type Status = "open" | "in-progress" | "resolved";

type Ticket = {
  id: string;
  subject: string;
  student: string;
  zone: "North" | "South" | "East" | "West" | "Central";
  state: string;
  category: string;
  priority: Priority;
  status: Status;
  age: string;
  assignee: string;
  lastMessage: string;
};

const seed: Ticket[] = [
  { id: "TKT-1042", subject: "Document upload failing on portal", student: "Rohan Sharma", zone: "North", state: "Delhi", category: "Technical", priority: "urgent", status: "open", age: "18m", assignee: "Unassigned", lastMessage: "Getting 500 error while uploading marksheet PDF" },
  { id: "TKT-1041", subject: "Wrong bank account details submitted", student: "Priya Menon", zone: "South", state: "Kerala", category: "Payments", priority: "high", status: "in-progress", age: "2h", assignee: "Amit Kumar", lastMessage: "Need to update IFSC before disbursement batch" },
  { id: "TKT-1039", subject: "Application status stuck on 'Under Review'", student: "Aditya Patil", zone: "West", state: "Maharashtra", category: "Application", priority: "medium", status: "in-progress", age: "6h", assignee: "Neha Sethi", lastMessage: "It's been 12 days, please check" },
  { id: "TKT-1038", subject: "Merit certificate not accepted", student: "Sneha Das", zone: "East", state: "West Bengal", category: "Documents", priority: "medium", status: "open", age: "9h", assignee: "Unassigned", lastMessage: "State board certificate rejected — reason unclear" },
  { id: "TKT-1035", subject: "Login OTP not received", student: "Karthik Reddy", zone: "South", state: "Telangana", category: "Technical", priority: "high", status: "open", age: "1d", assignee: "Unassigned", lastMessage: "Tried 6 times, no OTP on registered mobile" },
  { id: "TKT-1032", subject: "Scholarship amount less than expected", student: "Faisal Khan", zone: "North", state: "Uttar Pradesh", category: "Payments", priority: "high", status: "resolved", age: "1d", assignee: "Amit Kumar", lastMessage: "Amount was adjusted for pending fees — clarified" },
  { id: "TKT-1030", subject: "How to withdraw application", student: "Meera Iyer", zone: "South", state: "Tamil Nadu", category: "Query", priority: "low", status: "resolved", age: "2d", assignee: "Neha Sethi", lastMessage: "Guided through withdrawal flow" },
  { id: "TKT-1028", subject: "Change of college — mid-year", student: "Vikas Yadav", zone: "Central", state: "Madhya Pradesh", category: "Application", priority: "medium", status: "in-progress", age: "2d", assignee: "Amit Kumar", lastMessage: "Awaiting new admission letter" },
];

const zones = ["All", "North", "South", "East", "West", "Central"] as const;

const priorityStyles: Record<Priority, string> = {
  urgent: "bg-rose-50 text-rose-700 border-rose-200",
  high: "bg-amber-50 text-amber-700 border-amber-200",
  medium: "bg-slate-100 text-slate-700 border-slate-200",
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const statusStyles: Record<Status, string> = {
  open: "bg-rose-500",
  "in-progress": "bg-amber-500",
  resolved: "bg-emerald-500",
};

export default function SupportZone() {
  const [zone, setZone] = useState<(typeof zones)[number]>("All");
  const [status, setStatus] = useState<Status | "all">("all");

  const filtered = useMemo(
    () => seed.filter((t) => (zone === "All" || t.zone === zone) && (status === "all" || t.status === status)),
    [zone, status],
  );

  const zoneStats = useMemo(() => {
    const stats: Record<string, { total: number; open: number; urgent: number }> = {};
    for (const z of ["North", "South", "East", "West", "Central"]) {
      const items = seed.filter((t) => t.zone === z);
      stats[z] = {
        total: items.length,
        open: items.filter((t) => t.status !== "resolved").length,
        urgent: items.filter((t) => t.priority === "urgent").length,
      };
    }
    return stats;
  }, []);

  const totals = {
    open: seed.filter((t) => t.status === "open").length,
    inProgress: seed.filter((t) => t.status === "in-progress").length,
    urgent: seed.filter((t) => t.priority === "urgent").length,
    resolvedToday: seed.filter((t) => t.status === "resolved").length,
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Open Tickets" value={totals.open} tone="rose" icon={AlertTriangle} />
        <StatCard label="In Progress" value={totals.inProgress} tone="amber" icon={Clock} />
        <StatCard label="Urgent SLA" value={totals.urgent} tone="rose" icon={LifeBuoy} />
        <StatCard label="Resolved Today" value={totals.resolvedToday} tone="emerald" icon={CheckCircle2} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-1 rounded-2xl border border-slate-200/80 bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900">Zone Distribution</h3>
          </div>
          <ul className="space-y-2.5">
            {Object.entries(zoneStats).map(([z, s]) => {
              const active = zone === z;
              const load = Math.min(100, (s.open / Math.max(1, s.total)) * 100);
              return (
                <li key={z}>
                  <button
                    onClick={() => setZone(active ? "All" : (z as any))}
                    className={
                      "w-full text-left rounded-xl border p-3 transition " +
                      (active ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-300 bg-white")
                    }
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[12.5px] font-semibold text-slate-800">{z} Zone</p>
                      <div className="flex items-center gap-1.5 text-[10.5px]">
                        {s.urgent > 0 && <span className="text-rose-600 font-medium">{s.urgent} urgent</span>}
                        <span className="text-slate-500">{s.open}/{s.total}</span>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500" style={{ width: `${load}%` }} />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="xl:col-span-2 rounded-2xl border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/80">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Support Tickets · {zone} Zone</h3>
              <p className="text-[11.5px] text-slate-500">{filtered.length} matching tickets</p>
            </div>
            <div className="flex items-center gap-1">
              {(["all", "open", "in-progress", "resolved"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={
                    "rounded-md px-2.5 py-1.5 text-[11px] font-medium capitalize transition " +
                    (status === s ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50")
                  }
                >
                  {s.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>
          <ul className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto">
            {filtered.map((t) => (
              <li key={t.id} className="p-4 hover:bg-slate-50/60 transition">
                <div className="flex items-start gap-3">
                  <span className={"mt-1.5 h-2 w-2 rounded-full " + statusStyles[t.status]} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10.5px] font-mono text-slate-400">{t.id}</span>
                      <p className="text-[13px] font-medium text-slate-900 truncate">{t.subject}</p>
                      <span className={"text-[10px] rounded px-1.5 py-0.5 border capitalize " + priorityStyles[t.priority]}>
                        {t.priority}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-500 mt-1 line-clamp-1">{t.lastMessage}</p>
                    <div className="mt-2 flex items-center gap-3 text-[10.5px] text-slate-500 flex-wrap">
                      <span className="inline-flex items-center gap-1"><User2 className="h-3 w-3" />{t.student}</span>
                      <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{t.state} · {t.zone}</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{t.age} ago</span>
                      <span className="text-slate-400">·</span>
                      <span>{t.category}</span>
                      <span className="text-slate-400">·</span>
                      <span className={t.assignee === "Unassigned" ? "text-rose-600 font-medium" : "text-slate-600"}>{t.assignee}</span>
                    </div>
                  </div>
                  <button className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900 transition">
                    <MessageCircle className="h-3 w-3" /> Reply
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone, icon: Icon }: { label: string; value: number; tone: "rose" | "amber" | "emerald"; icon: any }) {
  const toneMap = {
    rose: "text-rose-600 bg-rose-50",
    amber: "text-amber-600 bg-amber-50",
    emerald: "text-emerald-600 bg-emerald-50",
  } as const;
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium text-slate-500">{label}</p>
        <span className={"grid h-7 w-7 place-items-center rounded-lg " + toneMap[tone]}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-900 tabular-nums">{value}</p>
    </div>
  );
}

