"use client";
import { useState } from "react";
import { Megaphone, Send, LifeBuoy } from "lucide-react";
import LandingNotifications from "@/components/admin/comms/LandingNotifications";
import StudentNotifications from "@/components/admin/comms/StudentNotifications";
import SupportZone from "@/components/admin/comms/SupportZone";

type Tab = "landing" | "students" | "support";

const tabs: { id: Tab; label: string; icon: any; desc: string }[] = [
  { id: "landing", label: "Landing Banners", icon: Megaphone, desc: "Public homepage notifications" },
  { id: "students", label: "Student Notifications", icon: Send, desc: "In-app, email & SMS to applicants" },
  { id: "support", label: "Support Zone", icon: LifeBuoy, desc: "Zone-wise tickets & resolution" },
];

export default function CommunicationsPage() {
  const [tab, setTab] = useState<Tab>("landing");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight">Communications</h1>
        <p className="text-[13px] text-slate-500 mt-0.5">Push announcements, notify students, and resolve zone-wise support tickets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                "text-left rounded-2xl border p-4 transition " +
                (active
                  ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                  : "border-slate-200/80 bg-white hover:border-slate-300")
              }
            >
              <div className="flex items-center gap-2.5">
                <span className={"grid h-8 w-8 place-items-center rounded-lg " + (active ? "bg-white/15" : "bg-slate-100")}>
                  <Icon className={"h-4 w-4 " + (active ? "text-white" : "text-slate-600")} />
                </span>
                <div className="min-w-0">
                  <p className={"text-[13px] font-semibold " + (active ? "text-white" : "text-slate-900")}>{t.label}</p>
                  <p className={"text-[11px] " + (active ? "text-white/70" : "text-slate-500")}>{t.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div>
        {tab === "landing" && <LandingNotifications />}
        {tab === "students" && <StudentNotifications />}
        {tab === "support" && <SupportZone />}
      </div>
    </div>
  );
}
