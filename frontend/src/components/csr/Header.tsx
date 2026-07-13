"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardCheck, History, UserCircle2, Building2, LogOut } from "lucide-react";
import { authApi } from "@/lib/api";

const NavLink = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/csr" && pathname.startsWith(href));
  
  return (
    <Link
      href={href}
      className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-pink-50 hover:text-emerald-700 ${
        isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-600"
      }`}
    >
      <Icon size={18} className="transition-transform group-hover:scale-110" />
      {label}
    </Link>
  );
};

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-pink-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-sm">
            <Building2 size={22} />
          </div>
          <div>
            <div className="text-[15px] font-semibold tracking-tight text-slate-900">Tata CSR</div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-emerald-600">
              TalentBridge Partner Portal
            </div>
          </div>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink href="/csr" icon={LayoutDashboard} label="Dashboard" />
          <NavLink href="/csr/approvals" icon={ClipboardCheck} label="Approvals Queue" />
          <NavLink href="/csr/history" icon={History} label="Disbursement History" />
          <NavLink href="/csr/profile" icon={UserCircle2} label="Profile" />
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-3 md:flex">
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-900">Ratan M.</div>
              <div className="text-[11px] text-slate-500">CSR Head · Tata Trusts</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-sm font-bold text-pink-700 ring-2 ring-white">
              RM
            </div>
          </div>
          <button 
            onClick={() => authApi.logout()}
            className="flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-pink-50 hover:text-pink-600 transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
