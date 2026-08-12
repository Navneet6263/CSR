'use client';

import { GraduationCap, History, LayoutDashboard, LogOut, Search, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { authApi } from '@/lib/api';
import { ScreenerNotifications } from './ScreenerNotifications';

const nav = [
  { to: '/screener', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/screener/history', label: 'My Decisions', icon: History, exact: false },
  { to: '/screener/profile', label: 'Settings', icon: Settings, exact: false },
];

export function ScreenerHeader() {
  const pathname = usePathname(); const router = useRouter(); const user = authApi.getUser(); const [search, setSearch] = useState('');
  const initials = (user?.fullName ?? 'SO').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  return <header className="screener-theme sticky top-0 z-40 border-b border-border-soft bg-[oklch(1_0_0/0.75)] backdrop-blur-xl">
    <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 sm:px-6 lg:gap-8 lg:py-4">
      <Link href="/screener" className="flex shrink-0 items-center gap-2.5"><div className="relative grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand-2 shadow-[var(--shadow-glow)]"><GraduationCap className="h-5 w-5 text-white" /><span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-gold shadow-[var(--shadow-gold)]" /></div><div className="hidden leading-tight sm:block"><div className="text-[15px] font-semibold tracking-tight text-text">TalentBridge</div><div className="text-[10px] uppercase tracking-[0.2em] text-text-dim">Screening Portal</div></div></Link>
      <nav className="hidden items-center gap-1 md:flex">{nav.map((item) => { const active = item.exact ? pathname === item.to : pathname.startsWith(item.to); const Icon = item.icon; return <Link key={item.to} href={item.to} className={`group flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition ${active ? 'bg-brand/15 text-brand' : 'text-text-muted hover:bg-brand/5 hover:text-text'}`}><Icon className="h-4 w-4" />{item.label}{active ? <span className="ml-1 h-1 w-1 rounded-full bg-gold" /> : null}</Link>; })}</nav>
      <div className="ml-auto flex items-center gap-2 lg:gap-3"><form onSubmit={(event) => { event.preventDefault(); window.dispatchEvent(new CustomEvent('screener-search', { detail: search.trim() })); router.push(`/screener?search=${encodeURIComponent(search.trim())}`); }} className="hidden items-center gap-2 rounded-md border border-brand/8 bg-brand/5 px-3 py-1.5 lg:flex"><Search className="h-3.5 w-3.5 text-text-dim" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search applications…" className="w-48 bg-transparent text-sm outline-none placeholder:text-text-dim xl:w-56" /><kbd className="rounded border border-brand/10 px-1.5 py-0.5 text-[10px] text-text-dim">Enter</kbd></form>
        <ScreenerNotifications /><div className="flex items-center gap-2 rounded-full border border-brand/8 bg-brand/5 py-1 pl-1 pr-2 sm:pr-3"><div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-2 text-xs font-semibold text-white">{initials}</div><div className="hidden text-left leading-tight xl:block"><div className="text-xs font-semibold text-text">{user?.fullName ?? 'Screening Officer'}</div><div className="text-[10px] text-text-dim">Screening Officer</div></div></div>
        <button onClick={() => void authApi.logout()} className="flex items-center gap-1.5 rounded-md border border-brand/8 bg-brand/5 px-2.5 py-2 text-xs font-medium text-text-muted transition hover:bg-danger/10 hover:text-danger"><LogOut className="h-3.5 w-3.5" /><span className="hidden xl:inline">Sign out</span></button></div>
    </div>
    <nav className="flex border-t border-border-soft px-3 py-1.5 md:hidden">{nav.map((item) => { const active = item.exact ? pathname === item.to : pathname.startsWith(item.to); const Icon = item.icon; return <Link key={item.to} href={item.to} className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[10px] font-semibold ${active ? 'bg-brand/10 text-brand' : 'text-text-dim'}`}><Icon size={12} />{item.label}</Link>; })}</nav>
  </header>;
}
