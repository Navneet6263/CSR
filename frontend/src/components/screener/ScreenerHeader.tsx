"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, LayoutDashboard, History, Settings, Bell, Search, LogOut } from "lucide-react";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";

const NAV = [
  { to: "/screener", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/screener/history", label: "My Decisions", icon: History, exact: false },
  { to: "/screener/profile", label: "Settings", icon: Settings, exact: false },
];

export function ScreenerHeader() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-border-soft bg-[oklch(1_0_0/0.75)] backdrop-blur-xl screener-theme">
      <div className="mx-auto flex max-w-[1400px] items-center gap-8 px-6 py-4">
        <Link href="/screener" className="flex items-center gap-2.5">
          <div className="relative grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-2 shadow-[var(--shadow-glow)]">
            <GraduationCap className="h-5 w-5 text-white" />
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-gold shadow-[var(--shadow-gold)]" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold tracking-tight text-[15px] text-text">TalentBridge</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-text-dim">Screening Portal</div>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link key={n.to} href={n.to}
                className={`group flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition ${
                  active ? "bg-brand/15 text-brand" : "text-text-muted hover:bg-brand/5 hover:text-text"
                }`}>
                <Icon className="h-4 w-4" />
                {n.label}
                {active && <span className="ml-1 h-1 w-1 rounded-full bg-gold" />}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-md border border-brand/8 bg-brand/5 px-3 py-1.5 md:flex">
            <Search className="h-3.5 w-3.5 text-text-dim" />
            <input placeholder="Search applications…"
              className="w-56 bg-transparent text-sm outline-none placeholder:text-text-dim" />
            <kbd className="rounded border border-brand/10 px-1.5 py-0.5 text-[10px] text-text-dim">⌘K</kbd>
          </div>
          <button className="relative rounded-md border border-brand/8 bg-brand/5 p-2 hover:bg-brand/10">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-gold" />
          </button>
          <div className="flex items-center gap-2 rounded-full border border-brand/8 bg-brand/5 py-1 pl-1 pr-3">
            <div className="grid h-7 w-7 place-items-center rounded-full text-xs font-semibold bg-gradient-to-br from-brand to-brand-2 text-white">MK</div>
            <div className="hidden text-left leading-tight md:block">
              <div className="text-xs font-semibold text-text">Meera Kapoor</div>
              <div className="text-[10px] text-text-dim">Merit Officer · L2</div>
            </div>
          </div>
          <button
            onClick={() => { authApi.logout(); router.push("/login"); }}
            className="flex items-center gap-1.5 rounded-md border border-brand/8 bg-brand/5 px-3 py-2 text-xs font-medium text-text-muted hover:bg-danger/10 hover:text-danger transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
