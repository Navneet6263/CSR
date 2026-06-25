'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, User, ShieldCheck, KeyRound, LogOut, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { TopNav } from "@/components/reviewer/TopNav";
import { authApi } from "@/lib/api";

export default function ReviewerProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ fullName?: string; email?: string; role?: string } | null>(null);

  useEffect(() => {
    setUser(authApi.getUser());
  }, []);

  const handleLogout = () => {
    authApi.logout();
    router.push('/login');
  };

  const initials = user?.fullName
    ? user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
    : "DR";

  return (
    <div className="min-h-[calc(100vh-100px)] pb-10">
      <TopNav />
      <main className="mx-auto mt-4 max-w-5xl space-y-6">
        <div className="flex items-center gap-4 px-2">
          <Link href="/reviewer" className="rounded-lg bg-white/50 p-2 text-slate-500 shadow-sm transition-colors hover:bg-white/80 hover:text-slate-800 border border-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">My Profile</h1>
            <p className="text-sm font-medium text-slate-500">Manage your reviewer account settings</p>
          </div>
        </div>

        <div className="glass overflow-hidden rounded-[2rem] bg-white/60 shadow-sm border border-white">
          <div className="h-40 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" />
          <div className="px-6 pb-10 sm:px-10">
            <div className="relative -mt-16 mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="flex items-end gap-5">
                <div className="flex h-32 w-32 items-center justify-center rounded-[1.5rem] bg-white p-2 shadow-lg ring-1 ring-black/5">
                  <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-4xl font-bold text-white shadow-inner">
                    {initials}
                  </div>
                </div>
                <div className="mb-2 hidden sm:block">
                  <h2 className="text-2xl font-bold text-slate-800">{user?.fullName || "Doc Reviewer"}</h2>
                  <p className="font-medium text-slate-500">{user?.role || "Reviewer"}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 rounded-xl bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-600 shadow-sm transition-all hover:bg-rose-100 hover:text-rose-700 ring-1 ring-rose-200/50"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl bg-white/80 p-5 border border-white shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    <User className="h-4 w-4" /> Full Name
                  </div>
                  <div className="text-lg font-semibold text-slate-800">{user?.fullName || "Doc Reviewer"}</div>
                </div>
                <div className="rounded-2xl bg-white/80 p-5 border border-white shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    <Mail className="h-4 w-4" /> Email Address
                  </div>
                  <div className="text-lg font-semibold text-slate-800 truncate">{user?.email || "docreviewer@test.com"}</div>
                </div>
                <div className="rounded-2xl bg-white/80 p-5 border border-white shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    <ShieldCheck className="h-4 w-4" /> System Role
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold text-slate-800">{user?.role || "Reviewer"}</div>
                    <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-200/60">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-5">Security Settings</h3>
                <button className="flex w-full items-center justify-between rounded-2xl bg-white/80 p-5 border border-white shadow-sm transition-all hover:bg-white hover:shadow-md hover:scale-[1.01] group">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 transition-colors group-hover:bg-indigo-100">
                      <KeyRound className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="text-base font-semibold text-slate-800">Change Password</div>
                      <div className="text-sm font-medium text-slate-500">Update your account password regularly to stay secure</div>
                    </div>
                  </div>
                  <div className="rounded-full bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600">
                    Update
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
