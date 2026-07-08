"use client";

import { useState } from "react";
import { Bell, Keyboard, Shield, Palette } from "lucide-react";
import { TopNav } from "@/components/reviewer/TopNav";
import { authApi } from "@/lib/api";

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} className={`relative w-11 h-6 rounded-full transition ${on ? "bg-primary" : "bg-surface border border-border"}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-bg transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

export default function SettingsPage() {
  const [notif, setNotif] = useState(true);
  const [sound, setSound] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [dense, setDense] = useState(false);

  const sections = [
    { icon: Bell, title: "Notifications", items: [
      { label: "New application in my queue", desc: "Alert when an app enters DocAuditInProgress", state: notif, set: setNotif },
      { label: "Sound alerts", desc: "Play a subtle chime on new assignments", state: sound, set: setSound },
    ] },
    { icon: Keyboard, title: "Workflow", items: [
      { label: "Auto-advance to next document", desc: "After a verify/reject action, jump to the next pending item", state: autoAdvance, set: setAutoAdvance },
    ] },
    { icon: Palette, title: "Appearance", items: [
      { label: "Compact tables", desc: "Reduce row padding to see more per screen", state: dense, set: setDense },
    ] },
  ];

  return (
    <div className="min-h-screen bg-bg text-fg pb-16">
      <TopNav />
      <main className="mx-auto max-w-[1600px] px-6 mt-8">
        <div className="space-y-6 max-w-3xl">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-primary">Preferences</div>
            <h1 className="mt-2 text-3xl font-display font-bold">Settings</h1>
          </div>
          {sections.map((s) => (
            <div key={s.title} className="glass p-6">
              <div className="flex items-center gap-2 mb-4">
                <s.icon className="w-4 h-4 text-primary" />
                <h2 className="font-display font-semibold">{s.title}</h2>
              </div>
              <div className="divide-y divide-border">
                {s.items.map((it) => (
                  <div key={it.label} className="flex items-center justify-between py-3">
                    <div>
                      <div className="text-sm font-medium">{it.label}</div>
                      <div className="text-xs text-fg-subtle mt-0.5">{it.desc}</div>
                    </div>
                    <Toggle on={it.state} onChange={it.set} />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="glass p-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-primary" />
              <h2 className="font-display font-semibold">Security</h2>
            </div>
            <p className="text-xs text-fg-subtle mb-4">All audit actions are cryptographically signed to your user ID. Contact IT to rotate keys.</p>
            <div className="flex flex-wrap gap-2">
              <button className="rounded-lg bg-surface border border-border px-4 py-2 text-sm hover:border-border-strong transition">Change password</button>
              <button className="rounded-lg bg-surface border border-border px-4 py-2 text-sm hover:border-border-strong transition">Enable 2FA</button>
              <button onClick={() => authApi.logout()} className="rounded-lg bg-danger/10 border border-danger/40 text-danger px-4 py-2 text-sm hover:bg-danger/20 transition">Sign out everywhere</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
