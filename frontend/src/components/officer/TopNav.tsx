"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ClipboardList, History, User, Sun, LogOut, ChevronDown } from "lucide-react";
import { authApi } from "@/lib/api";
import { NotificationCenter } from '@/components/shared/NotificationCenter';

export function TopNav() {
  const pathname = usePathname();
  const user = authApi.getUser();
  const items = [
    { to: "/officer", label: "My Visits", icon: ClipboardList, exact: true },
    { to: "/officer/history", label: "History", icon: History, exact: false },
    { to: "/officer/profile", label: "Profile", icon: User, exact: false },
  ];

  return (
    <header className="relative z-20 border-b border-slate-200/70 bg-white/70 backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-4 py-3 lg:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 text-white shadow-md shadow-cyan-500/30">
            <Sun size={18} strokeWidth={2.4} />
          </div>
          <div className="min-w-0 leading-tight">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Field Officer</p>
            <p className="truncate text-sm font-bold text-black">TalentBridge · {user?.fullName ?? 'Officer'}</p>
          </div>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {items.map((it) => {
            const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
            const Icon = it.icon;
            return (
              <Link
                key={it.label}
                href={it.to}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-gradient-to-r from-cyan-50 to-white text-cyan-700 ring-1 ring-cyan-100"
                    : "text-slate-600 hover:bg-slate-100/70"
                }`}
              >
                <Icon size={16} strokeWidth={active ? 2.4 : 2} />
                {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2"><NotificationCenter /><UserMenu /></div>
      </div>

      <nav className="flex items-center gap-1 border-t border-slate-100 px-4 py-2 md:hidden">
        {items.map((it) => {
          const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
          const Icon = it.icon;
          return (
            <Link
              key={it.label}
              href={it.to}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition ${
                active ? "bg-cyan-50 text-cyan-700" : "text-slate-500"
              }`}
            >
              <Icon size={14} />
              {it.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const user = authApi.getUser();
  const initials = (user?.fullName ?? 'BG').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition hover:bg-slate-100"
      >
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200">
          {initials}
        </div>
        <div className="hidden text-left leading-tight sm:block">
          <p className="text-xs font-semibold text-black">{user?.fullName ?? 'Officer'}</p>
          <p className="font-mono text-[10px] text-slate-500">BG-{user?.userId ?? '—'}</p>
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl bg-white p-1.5 shadow-xl ring-1 ring-slate-200">
          <div className="px-3 py-2">
            <p className="text-sm font-semibold text-slate-800">{user?.fullName ?? 'Officer'}</p>
            <p className="truncate text-xs text-slate-500">{user?.email ?? ''}</p>
          </div>
          <div className="my-1 h-px bg-slate-100" />
          <Link
            href="/officer/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <User size={14} /> View profile
          </Link>
          <button
            onClick={() => { setOpen(false); authApi.logout(); }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
