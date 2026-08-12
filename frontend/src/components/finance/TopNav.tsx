"use client";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ShieldCheck, LayoutDashboard, Wallet, History, UserCircle2, LogOut, CheckSquare, AlertOctagon, ScrollText, Menu, X } from "lucide-react";
import { NotificationCenter } from '@/components/shared/NotificationCenter';

type NavLink = { to: string; label: string; icon: typeof Wallet; exact?: boolean; access?: 'Maker' | 'Checker' };
const allLinks: NavLink[] = [
  { to: "/finance", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/finance/pending", label: "Maker Queue", icon: Wallet, access: 'Maker' },
  { to: "/finance/checker", label: "Checker Queue", icon: CheckSquare, access: 'Checker' },
  { to: "/finance/failed", label: "Failed", icon: AlertOctagon },
  { to: "/finance/history", label: "History", icon: History },
  { to: "/finance/audit", label: "Audit", icon: ScrollText },
  { to: "/finance/profile", label: "Profile", icon: UserCircle2 },
];

export function TopNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const user = authApi.getUser();
  const links = allLinks.filter((item) => !item.access || item.access === user?.financeFunction);
  const initials = user?.fullName?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'FA';

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/finance" className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-white shadow-sm">
            <ShieldCheck size={22} />
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate font-display text-lg font-bold text-navy-900">TalentBridge</div>
            <div className="truncate text-[11px] font-semibold uppercase tracking-widest text-navy-500">
              Finance &amp; Accounts
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map(({ to, label, icon: Icon, exact }) => {
            const isActive = exact ? pathname === to : pathname.startsWith(to);
            return (
              <Link
                key={to}
                href={to}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isActive ? "bg-navy-900 text-white" : "text-navy-700 hover:bg-navy-50"
                }`}
              >
                <Icon size={16} className={isActive ? "text-white" : "text-navy-400"} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <NotificationCenter />
          <div className="hidden text-right lg:block">
            <div className="text-sm font-bold text-navy-900">{user?.fullName ?? 'Finance User'}</div>
            <div className="text-[11px] font-semibold text-navy-500">Finance {user?.financeFunction ?? 'Access'}</div>
          </div>
          <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-navy-100 text-xs font-bold text-navy-700 sm:flex">
            {initials}
          </div>
          <button
            type="button"
            onClick={() => authApi.logout()}
            className="rounded-lg border border-navy-100 p-2 text-navy-700 transition hover:bg-navy-50"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-navy-100 p-2 text-navy-700 transition hover:bg-navy-50 lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-navy-100 bg-white px-4 py-3 lg:hidden">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {links.map(({ to, label, icon: Icon, exact }) => {
              const isActive = exact ? pathname === to : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  href={to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive ? "bg-navy-900 text-white" : "text-navy-700 bg-navy-50/60 hover:bg-navy-50"
                  }`}
                >
                  <Icon size={16} /> {label}
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </header>
  );
}

