"use client";
import { useMemo, useState } from "react";
import {
  UserPlus, Mail, Copy, Check, Building2, Search, Shield,
  FileCheck2, ClipboardList, HandHeart, Trash2, KeyRound, Send,
} from "lucide-react";


type Role = "csr" | "reviewer" | "bgchecker" | "screener";

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  org?: string;
  fundCap?: number;   // CSR only — visible fund envelope
  fundUsed?: number;
  status: "active" | "pending" | "invited";
  createdAt: string;
};

const ROLE_META: Record<Role, { label: string; icon: React.ComponentType<{ className?: string }>; tone: string }> = {
  csr:       { label: "CSR Partner",       icon: HandHeart,     tone: "bg-emerald-50 text-emerald-700" },
  reviewer:  { label: "Document Checker",  icon: FileCheck2,    tone: "bg-blue-50 text-blue-700" },
  bgchecker: { label: "Background Checker",icon: Shield,        tone: "bg-violet-50 text-violet-700" },
  screener:  { label: "Screening Officer", icon: ClipboardList, tone: "bg-amber-50 text-amber-700" },
};

const SEED: User[] = [
  { id: "U-1001", name: "Rakesh Menon",  email: "rakesh@itc.in",         role: "csr", org: "ITC Foundation",        fundCap: 25000000, fundUsed: 11800000, status: "active",  createdAt: "12 Jun 2026" },
  { id: "U-1002", name: "Priya Ranganathan", email: "priya@reliance.com",role: "csr", org: "Reliance Foundation",   fundCap: 40000000, fundUsed: 9200000,  status: "active",  createdAt: "02 Jul 2026" },
  { id: "U-1003", name: "Arjun Kapoor",  email: "arjun@tatatrusts.org",  role: "csr", org: "Tata Trusts",           fundCap: 20000000, fundUsed: 4800000,  status: "pending", createdAt: "08 Jul 2026" },
  { id: "U-1101", name: "Neha Sharma",   email: "neha.s@scholar.gov.in", role: "reviewer",  status: "active",  createdAt: "01 May 2026" },
  { id: "U-1102", name: "Vikram Rao",    email: "vikram.r@scholar.gov.in", role: "bgchecker", status: "active", createdAt: "04 May 2026" },
  { id: "U-1103", name: "Ishita Bose",   email: "ishita.b@scholar.gov.in", role: "screener",  status: "invited", createdAt: "09 Jul 2026" },
];

const inr = (n: number) => n >= 10000000 ? `₹${(n/10000000).toFixed(2)} Cr` : n >= 100000 ? `₹${(n/100000).toFixed(1)} L` : `₹${n.toLocaleString("en-IN")}`;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(SEED);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | Role>("all");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (filter !== "all" && u.role !== filter) return false;
      if (!q) return true;
      const s = (u.name + u.email + (u.org ?? "")).toLowerCase();
      return s.includes(q.toLowerCase());
    });
  }, [users, q, filter]);

  const stats = useMemo(() => ({
    total: users.length,
    csr: users.filter((u) => u.role === "csr").length,
    staff: users.filter((u) => u.role !== "csr").length,
    pending: users.filter((u) => u.status !== "active").length,
  }), [users]);

  const addUser = (u: User) => setUsers((prev) => [u, ...prev]);
  const remove = (id: string) => setUsers((prev) => prev.filter((u) => u.id !== id));

  return (
    <div className="space-y-5 pb-10">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-slate-400">Management</div>
          <h1 className="mt-1 flex items-center gap-2 text-xl sm:text-2xl font-semibold text-slate-900">
            <KeyRound className="h-5 w-5 text-slate-500" /> User & Access Management
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">Issue credentials to CSR partners and internal roles. Login details are emailed automatically.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          <UserPlus className="h-3.5 w-3.5" /> Create new ID
        </button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: "Total Accounts",  v: stats.total,  sub: "all roles" },
          { l: "CSR Partners",    v: stats.csr,    sub: "with fund envelope" },
          { l: "Internal Staff",  v: stats.staff,  sub: "reviewers · screeners · BG" },
          { l: "Pending Invites", v: stats.pending,sub: "awaiting first login" },
        ].map((c) => (
          <div key={c.l} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm ring-4 ring-slate-100">
            <div className="text-[10px] uppercase tracking-widest text-slate-400">{c.l}</div>
            <p className="mt-2 text-[22px] font-semibold tabular-nums text-slate-900">{c.v}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, organization…"
              className="rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs w-64 outline-none focus:border-slate-400"
            />
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            {(["all","csr","reviewer","bgchecker","screener"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setFilter(r)}
                className={"rounded-md px-2 py-1 " + (filter === r ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100")}
              >
                {r === "all" ? "All" : ROLE_META[r].label}
              </button>
            ))}
          </div>
          <div className="ml-auto text-[11px] text-slate-500 tabular-nums">{filtered.length} accounts</div>
        </div>

        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1.6fr)_90px_60px] px-4 py-2 text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-100 bg-slate-50/50">
          <div>User</div>
          <div>Role</div>
          <div>Fund envelope / Organization</div>
          <div className="text-right">Status</div>
          <div />
        </div>

        <ul className="divide-y divide-slate-100">
          {filtered.map((u) => {
            const meta = ROLE_META[u.role];
            const Icon = meta.icon;
            const util = u.fundCap ? Math.round(((u.fundUsed ?? 0) / u.fundCap) * 100) : 0;
            return (
              <li key={u.id} className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1.6fr)_90px_60px] items-center px-4 py-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">{u.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{u.email} · {u.id}</div>
                </div>
                <div>
                  <span className={"inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium " + meta.tone}>
                    <Icon className="h-3 w-3" /> {meta.label}
                  </span>
                </div>
                <div className="min-w-0">
                  {u.role === "csr" && u.fundCap ? (
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-700 truncate">
                        <Building2 className="h-3 w-3 shrink-0 text-slate-400" />
                        <span className="truncate font-medium">{u.org}</span>
                        <span className="text-slate-400">·</span>
                        <span className="tabular-nums">{inr(u.fundUsed ?? 0)} / {inr(u.fundCap)}</span>
                      </div>
                      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full bg-emerald-500" style={{ width: `${util}%` }} />
                      </div>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400">Internal — no fund scope</span>
                  )}
                </div>
                <div className="text-right">
                  <span className={
                    "inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold " +
                    (u.status === "active" ? "bg-emerald-50 text-emerald-700" :
                     u.status === "pending" ? "bg-amber-50 text-amber-700" :
                     "bg-slate-100 text-slate-600")
                  }>
                    {u.status}
                  </span>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => remove(u.id)}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    title="Revoke access"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="px-4 py-10 text-center text-xs text-slate-400">No accounts match your filter.</li>
          )}
        </ul>
      </div>

      {open && <CreateModal onClose={() => setOpen(false)} onCreate={addUser} />}
    </div>
  );
}

function CreateModal({ onClose, onCreate }: { onClose: () => void; onCreate: (u: User) => void }) {
  const [role, setRole] = useState<Role>("csr");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [fundCap, setFundCap] = useState<number>(10000000);
  const [issued, setIssued] = useState<{ id: string; pwd: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const submit = () => {
    if (!name || !email) return;
    const id = "U-" + Math.floor(2000 + Math.random() * 7999);
    const pwd = Math.random().toString(36).slice(-10).toUpperCase();
    onCreate({
      id, name, email, role,
      org: role === "csr" ? org : undefined,
      fundCap: role === "csr" ? fundCap : undefined,
      fundUsed: role === "csr" ? 0 : undefined,
      status: "invited",
      createdAt: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    });
    setIssued({ id, pwd });
  };

  const copy = async () => {
    if (!issued) return;
    await navigator.clipboard.writeText(`${email} / ${issued.pwd}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-slate-100 px-5 py-3.5">
          <div className="text-[10px] uppercase tracking-widest text-slate-400">Provision Access</div>
          <h3 className="text-sm font-semibold text-slate-900 mt-0.5">
            {issued ? "Credentials issued" : "Create new user ID"}
          </h3>
        </div>

        {!issued ? (
          <div className="p-5 space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-slate-400">Role</label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {(Object.keys(ROLE_META) as Role[]).map((r) => {
                  const m = ROLE_META[r];
                  const Icon = m.icon;
                  const active = role === r;
                  return (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={"flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition " +
                        (active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300")}
                    >
                      <Icon className="h-3.5 w-3.5" /> {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-slate-400">Full name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-slate-400" placeholder="e.g. Rakesh Menon" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-slate-400">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-slate-400" placeholder="name@company.com" />
              </div>
            </div>

            {role === "csr" && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 space-y-3">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                  <HandHeart className="h-3.5 w-3.5" /> CSR partner scope
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-slate-400">Organization</label>
                    <input value={org} onChange={(e) => setOrg(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-slate-400" placeholder="e.g. ITC Foundation" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-slate-400">Fund envelope (₹)</label>
                    <input type="number" value={fundCap} onChange={(e) => setFundCap(+e.target.value || 0)} className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs tabular-nums outline-none focus:border-slate-400" />
                  </div>
                </div>
                <p className="text-[11px] text-emerald-800/70">
                  The partner dashboard will only expose scholarships and disbursements funded within this envelope — ITC sees ITC, Reliance sees Reliance.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button onClick={onClose} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={submit} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">
                <Send className="h-3.5 w-3.5" /> Create & email credentials
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Mail className="h-3.5 w-3.5" /> Sent to <span className="font-medium text-slate-800">{email}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-400">Login ID</div>
                  <div className="mt-0.5 font-mono text-slate-900">{email}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-400">Temporary password</div>
                  <div className="mt-0.5 font-mono text-slate-900">{issued.pwd}</div>
                </div>
              </div>
              <button onClick={copy} className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-100">
                {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy credentials"}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Onboarding email dispatched with reset link and role-scoped welcome guide. The user must change password on first login.
            </p>
            <div className="flex justify-end">
              <button onClick={onClose} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

