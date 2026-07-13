"use client";

import { Mail, Phone, MapPin, ShieldCheck, KeyRound, Fingerprint } from "lucide-react";



export default function () {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-navy-500">Account</div>
        <h1 className="mt-1 font-display text-3xl font-bold text-navy-900">Finance Officer Profile</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm lg:col-span-1">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-navy-900 font-display text-2xl font-bold text-white">MI</div>
          <div className="mt-4 font-display text-xl font-bold text-navy-900">Meera Iyer</div>
          <div className="text-sm text-navy-500">Senior Finance Officer · L3</div>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-xs font-bold text-success-700">
            <ShieldCheck size={12} /> VERIFIED
          </div>

          <ul className="mt-6 space-y-3 text-sm text-navy-700">
            <li className="flex items-center gap-2"><Mail size={14} className="text-navy-500" /> meera.iyer@talentbridge.org</li>
            <li className="flex items-center gap-2"><Phone size={14} className="text-navy-500" /> +91 98450 12345</li>
            <li className="flex items-center gap-2"><MapPin size={14} className="text-navy-500" /> Bengaluru, IN</li>
          </ul>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
            <div className="font-display text-lg font-bold text-navy-900">Security</div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <SecurityRow icon={KeyRound} label="Password" value="Rotated 12 days ago" />
              <SecurityRow icon={Fingerprint} label="Biometric 2FA" value="Enabled" ok />
              <SecurityRow icon={ShieldCheck} label="Maker-Checker" value="Enabled" ok />
              <SecurityRow icon={ShieldCheck} label="Withdrawal Limit" value="₹10,00,000 / day" />
            </div>
          </div>

          <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
            <div className="font-display text-lg font-bold text-navy-900">Activity (30 days)</div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <Stat k="Transfers" v="184" />
              <Stat k="Disbursed" v="₹92.4L" />
              <Stat k="Reconciled" v="100%" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityRow({ icon: Icon, label, value, ok }: { icon: typeof KeyRound; label: string; value: string; ok?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-navy-100 bg-navy-50/40 p-4">
      <div className="flex items-center gap-3">
        <Icon size={16} className="text-navy-700" />
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-navy-500">{label}</div>
          <div className="text-sm font-semibold text-navy-900">{value}</div>
        </div>
      </div>
      {ok ? <span className="rounded-full bg-success-500 px-2 py-0.5 text-[10px] font-bold text-white">ON</span> : null}
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-navy-100 bg-navy-50/40 p-4 text-center">
      <div className="font-display text-2xl font-bold text-navy-900">{v}</div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-navy-500">{k}</div>
    </div>
  );
}



