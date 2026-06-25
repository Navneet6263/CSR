// src/components/reviewer/ProfilePopover.tsx
'use client';

import { useState, useRef, useEffect } from "react";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

export function ProfilePopover() {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Hydration safe user fetching
  const [user, setUser] = useState<{ fullName?: string; email?: string } | null>(null);
  useEffect(() => {
    setUser(authApi.getUser());
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    authApi.logout();
    router.push('/login');
  };

  const initials = user?.fullName
    ? user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : "DR";

  return (
    <div className="relative" ref={profileDropdownRef}>
      <button
        onClick={() => setShowProfileMenu(!showProfileMenu)}
        className="flex items-center gap-2.5 rounded-full bg-white/60 px-3 py-1.5 transition-all hover:bg-white/80 hover:shadow-sm"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-300 to-sky-300 text-[11px] font-semibold text-white">
          {initials}
        </div>
        <div className="hidden text-left leading-tight md:block">
          <div className="text-xs font-semibold text-slate-800">{user?.fullName || "Loading..."}</div>
          <div className="text-[10px] text-slate-500">{user?.email || "Please wait"}</div>
        </div>
      </button>

      {showProfileMenu && (
        <div className="absolute right-0 mt-4 w-[240px] origin-top-right overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-[0_30px_80px_rgba(0,0,0,0.15)] backdrop-blur-2xl transition-all animate-in fade-in zoom-in-95 duration-200 z-50">
          <div className="border-b border-slate-100/50 bg-slate-50/50 px-6 py-5">
            <h3 className="text-sm font-bold text-slate-800">{user?.fullName || "User"}</h3>
            <p className="mt-1 text-xs text-slate-500">{user?.email || "user@test.com"}</p>
          </div>
          <div className="p-2">
            <button
              onClick={() => {
                setShowProfileMenu(false);
                const rolePath = user?.role === 'DocReviewer' ? 'reviewer' : 'officer';
                router.push(`/${rolePath}/profile`);
              }}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-indigo-600"
            >
              <User size={18} />
              My Profile
            </button>
            <button
              onClick={handleLogout}
              className="mt-1 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
