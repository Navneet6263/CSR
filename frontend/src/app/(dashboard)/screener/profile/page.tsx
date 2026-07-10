"use client";

import { useState } from "react";
import { Bell, Lock, Palette, User } from "lucide-react";
import { ScreenerHeader } from "@/components/screener/ScreenerHeader";

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)}
      className={`relative h-6 w-11 rounded-full transition ${on ? "bg-gradient-to-r from-brand to-brand-2" : "bg-brand/10"}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

export default function SettingsPage() {
  const [notifs, setNotifs] = useState(true);
  const [digest, setDigest] = useState(false);
  const [twoFa, setTwoFa] = useState(true);

  return (
    <div className="screener-theme flex flex-col min-h-screen" style={{ background: "radial-gradient(1200px 800px at 10% -10%, oklch(0.92 0.08 350 / 0.55), transparent 60%), radial-gradient(900px 700px at 100% 0%, oklch(0.9 0.1 340 / 0.35), transparent 55%), oklch(0.99 0.008 350)" }}>
      <ScreenerHeader />
      <main className="mx-auto w-full max-w-[1400px] px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-text">Settings</h1>
          <p className="mt-1 text-sm text-text-muted">Manage your profile, security, and screening preferences.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card icon={User} title="Profile">
            <Field label="Full Name" value="Meera Kapoor" />
            <Field label="Officer ID" value="TB-SO-0284" />
            <Field label="Role" value="Merit Officer · Level 2" />
            <Field label="Region" value="North & West Zone" />
          </Card>

          <Card icon={Lock} title="Security">
            <Row label="Two-factor authentication" desc="Required for approving high-value scholarships.">
              <Toggle on={twoFa} onChange={setTwoFa} />
            </Row>
            <Row label="Session timeout" desc="Automatically sign out after 30 minutes of inactivity.">
              <span className="text-xs font-mono text-text-muted">30 min</span>
            </Row>
          </Card>

          <Card icon={Bell} title="Notifications">
            <Row label="New applications in queue" desc="Get notified when 5+ new applications arrive.">
              <Toggle on={notifs} onChange={setNotifs} />
            </Row>
            <Row label="Daily digest email" desc="Summary of pending & decided applications at 6 PM.">
              <Toggle on={digest} onChange={setDigest} />
            </Row>
          </Card>

          <Card icon={Palette} title="Screening Preferences">
            <Row label="Default queue filter" desc="Applied whenever you open the dashboard.">
              <span className="rounded-md bg-brand/5 px-2 py-1 text-xs text-text">All applications</span>
            </Row>
            <Row label="Auto-open next after decision" desc="Streamline your workflow between reviews.">
              <Toggle on={true} onChange={() => {}} />
            </Row>
          </Card>
        </div>
      </main>
    </div>
  );
}

function Card({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-md bg-brand/15 text-brand"><Icon className="h-4 w-4" /></div>
        <h2 className="text-base font-semibold text-text">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-brand/5 pb-2 last:border-0">
      <span className="text-xs text-text-dim">{label}</span>
      <span className="text-sm font-medium text-text">{value}</span>
    </div>
  );
}

function Row({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-brand/5 pb-3 last:border-0">
      <div>
        <div className="text-sm font-medium text-text">{label}</div>
        <div className="text-xs text-text-dim">{desc}</div>
      </div>
      {children}
    </div>
  );
}
