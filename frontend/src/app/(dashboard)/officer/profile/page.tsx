'use client';

import { useEffect, useState } from 'react';
import { authApi } from '@/lib/api';
import { TopNav } from '@/components/officer/TopNav';
import { User, Mail, Phone, ShieldCheck, MapPin, Building, Key } from 'lucide-react';
import type { AuthUser } from '@/types';

export default function OfficerProfile() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(authApi.getUser());
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-100px)] pb-10">
      <TopNav />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
            Officer Profile
          </h1>
          <p className="mt-2 text-slate-500">Manage your credentials, view activity summary, and update preferences.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Profile Card */}
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="glass rounded-3xl bg-white/60 p-8 shadow-sm border border-white relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-400 to-indigo-500 opacity-20"></div>
              <div className="relative z-10 flex flex-col items-center text-center mt-4">
                <div className="relative mb-6">
                  <div className="flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-5xl font-bold text-white shadow-xl ring-4 ring-white transition-transform duration-300 group-hover:scale-105">
                    {user.fullName?.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) || "U"}
                  </div>
                  <div className="absolute bottom-1 right-1 p-2.5 bg-white rounded-full shadow-lg border-2 border-white">
                    <ShieldCheck className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">{user.fullName}</h2>
                <div className="mt-3 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold tracking-wider uppercase border border-indigo-100/50 shadow-sm">
                  {user.role}
                </div>
              </div>
            </div>

            <div className="glass rounded-3xl bg-white/60 p-6 shadow-sm border border-white">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/50 border border-blue-100/50">
                  <span className="text-sm font-semibold text-slate-600">Account Status</span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Active
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-sm font-semibold text-slate-600">Member Since</span>
                  <span className="text-sm font-bold text-slate-800">2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Info */}
          <div className="w-full lg:w-2/3 space-y-6">
            <div className="glass rounded-3xl bg-white/60 p-8 shadow-sm border border-white">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" /> Personal Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Full Name</label>
                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 text-slate-700 font-semibold shadow-inner transition-colors hover:bg-white">
                    <User className="h-5 w-5 text-slate-400" />
                    {user.fullName}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Email Address</label>
                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 text-slate-700 font-semibold shadow-inner transition-colors hover:bg-white">
                    <Mail className="h-5 w-5 text-slate-400" />
                    {user.email}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Phone Number</label>
                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 text-slate-700 font-semibold shadow-inner transition-colors hover:bg-white">
                    <Phone className="h-5 w-5 text-slate-400" />
                    {user.phone || 'Not provided'}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Location / Zone</label>
                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 text-slate-700 font-semibold shadow-inner transition-colors hover:bg-white">
                    <MapPin className="h-5 w-5 text-slate-400" />
                    HQ (Headquarters)
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-3xl bg-white/60 p-8 shadow-sm border border-white">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Key className="h-5 w-5 text-rose-500" /> Security & Access
              </h3>
              
              <div className="rounded-2xl border border-slate-200/60 overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-white/40 hover:bg-white/60 transition-colors border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Password</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Last changed 3 months ago</p>
                  </div>
                  <button className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors">
                    Update
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/40 hover:bg-white/60 transition-colors">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Two-Factor Authentication</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Add an extra layer of security</p>
                  </div>
                  <button className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                    Enable
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
