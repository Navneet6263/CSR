'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, ScrollText, LayoutGrid } from "lucide-react";
import { NotificationPopover } from "../reviewer/NotificationPopover";
import { ProfilePopover } from "../reviewer/ProfilePopover";

const links = [
  { to: "/officer", label: "Queue", icon: LayoutGrid },
  { to: "/officer/logs", label: "Timeline", icon: ScrollText },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-auto -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8 mb-6">
      <div className="glass-strong flex w-full items-center justify-between px-6 py-4 shadow-sm bg-white/70 backdrop-blur-xl border-b border-white/60">
        <Link href="/officer" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight text-slate-800">CSR Scholar</div>
            <div className="text-[11px] font-medium text-slate-500">Officer Console</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-1.5 md:flex">
          {links.map(({ to, label, icon: Icon }) => {
            const isActive = pathname === to;
            return (
              <Link
                key={to}
                href={to}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-blue-100 text-blue-700" 
                    : "text-slate-500 hover:bg-white/70 hover:text-slate-800"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <NotificationPopover />
          <ProfilePopover />
        </div>
      </div>
    </header>
  );
}
