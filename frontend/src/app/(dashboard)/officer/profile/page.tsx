"use client";

import { Mail, Phone, Shield, Award, MapPin, Clock } from "lucide-react";
import { TopNav } from "@/components/officer/TopNav";

export default function OfficerProfile() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />
      <main className="relative z-10 mx-auto w-full max-w-[1400px] px-4 py-6 lg:px-8">
        <div className="space-y-6">
          <header>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Profile</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Field Officer Profile</h1>
          </header>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 text-3xl font-bold text-white shadow-lg shadow-cyan-500/30 ring-4 ring-white">
                RK
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-bold text-slate-900">Rohan Kulkarni</h2>
                <p className="mt-0.5 text-sm text-slate-500">Senior Field Officer · Pune Zone</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge icon={Shield} label="Verified Officer" tone="emerald" />
                  <Badge icon={Award} label="Top Performer" tone="amber" />
                  <Badge icon={MapPin} label="Pune · Maharashtra" tone="cyan" />
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <InfoCard title="Contact">
              <Row icon={Mail} label="Email" value="rohan.k@talentbridge.in" />
              <Row icon={Phone} label="Field Phone" value="+91 98211 40033" />
              <Row icon={Shield} label="Officer ID" value="FO-2041" />
            </InfoCard>
            <InfoCard title="Performance (30 days)">
              <Metric label="Visits completed" value="147" />
              <Metric label="Avg. visit time" value="42m" />
              <Metric label="On-time rate" value="96.4%" />
            </InfoCard>
            <InfoCard title="Assignment">
              <Row icon={Clock} label="Shift" value="09:00 — 18:00 IST" />
              <Row icon={MapPin} label="Coverage" value="Pune, Solapur, Satara" />
              <Row icon={Award} label="Languages" value="English, Hindi, Marathi" />
            </InfoCard>
          </section>
        </div>
      </main>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h3 className="mb-3 text-sm font-bold text-slate-800">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={15} className="mt-0.5 text-cyan-600" />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="truncate text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-base font-bold text-slate-900">{value}</span>
    </div>
  );
}

function Badge({ icon: Icon, label, tone }: { icon: React.ComponentType<{ size?: number }>; label: string; tone: "emerald" | "amber" | "cyan" }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    cyan: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${tones}`}>
      <Icon size={12} /> {label}
    </span>
  );
}
