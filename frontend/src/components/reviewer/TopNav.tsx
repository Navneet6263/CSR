"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, LayoutDashboard, History, Settings, Circle, ChevronDown } from "lucide-react";
import { useState } from "react";
import { authApi } from "@/lib/api";

export function TopNav() {
  const [shift, setShift] = useState<"Active" | "On Break">("Active");
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border backdrop-blur-2xl bg-bg/70">
      <div className="mx-auto max-w-[1600px] px-6 h-16 flex items-center gap-6">
        <Link href="/reviewer" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 grid place-items-center">
            <ShieldCheck className="w-4 h-4 text-primary" />
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold text-sm">TalentBridge</div>
            <div className="text-[10px] font-mono text-fg-subtle tracking-wider uppercase">DocReviewer</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-8">
          {[
            { href: "/reviewer", label: "Dashboard", icon: LayoutDashboard },
            { href: "/reviewer/history", label: "My Audit History", icon: History },
            { href: "/reviewer/settings", label: "Settings", icon: Settings },
          ].map((n) => {
            const isActive = usePathname() === n.href;
            return (
            <Link key={n.href} href={n.href}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                isActive ? "text-fg bg-surface border-border-strong" : "text-fg-muted hover:text-fg hover:bg-surface/60 border-transparent"
              }`}>
              <n.icon className="w-4 h-4" /> {n.label}
            </Link>
          )})}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <button onClick={() => setShift(shift === "Active" ? "On Break" : "Active")}
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              shift === "Active" ? "border-success/40 bg-success/10 text-success" : "border-warn/40 bg-warn/10 text-warn"
            }`}>
            <Circle className="w-2 h-2 fill-current" /> {shift}
          </button>
          <div className="relative">
            <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-lg hover:bg-surface px-2 py-1.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-bg font-bold text-xs">RV</div>
              <div className="hidden md:block text-left leading-tight">
                <div className="text-xs font-semibold">Ritu Verma</div>
                <div className="text-[10px] text-fg-subtle">Reviewer · L2</div>
              </div>
              <ChevronDown className="w-3 h-3 text-fg-subtle" />
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border-strong bg-bg-elev shadow-2xl shadow-black/60 p-2 text-sm backdrop-blur-2xl z-50">
                <div className="px-3 py-2 border-b border-border">
                  <div className="font-semibold">Ritu Verma</div>
                  <div className="text-xs text-fg-subtle">ritu.v@talentbridge.org</div>
                </div>
                <button className="w-full text-left px-3 py-2 rounded-md hover:bg-surface">Profile</button>
                <button className="w-full text-left px-3 py-2 rounded-md hover:bg-surface">Preferences</button>
                <button onClick={() => authApi.logout()} className="w-full text-left px-3 py-2 rounded-md hover:bg-surface text-danger">Sign out</button>
              </div>

            )}
          </div>
        </div>
      </div>
    </header>
  );
}
