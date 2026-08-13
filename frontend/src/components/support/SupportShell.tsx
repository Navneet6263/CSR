'use client';

import { Activity, LayoutDashboard, LifeBuoy, LogOut, Menu, Search, Users, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FormEvent, ReactNode, useState } from 'react';
import { authApi } from '@/lib/api';
import { NotificationCenter } from '@/components/shared/NotificationCenter';
import Logo from '@/components/shared/Logo';

const nav = [
  { href: '/support', label: 'Today', icon: LayoutDashboard, exact: true },
  { href: '/support/tickets', label: 'Help requests', icon: LifeBuoy },
  { href: '/support/students', label: 'Student directory', icon: Users },
  { href: '/support/activity', label: 'Live blockers', icon: Activity },
];

export function SupportShell({ children }: { children: ReactNode }) {
  const pathname = usePathname(); const router = useRouter(); const user = authApi.getUser();
  const [menu, setMenu] = useState(false); const [search, setSearch] = useState('');
  const submit = (event: FormEvent) => { event.preventDefault(); const query = search.trim();
    if (query) router.push(`/support/students?query=${encodeURIComponent(query)}`); };
  const initials = (user?.fullName ?? 'Support Agent').split(' ').filter(Boolean).slice(0, 2)
    .map((part) => part[0]).join('').toUpperCase();

  return <div className="min-h-screen bg-[#f6f7f9] text-slate-950">
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        <button onClick={() => setMenu((value) => !value)} className="rounded-lg border p-2 md:hidden" aria-label="Toggle navigation">
          {menu ? <X size={17} /> : <Menu size={17} />}
        </button>
        <Link href="/support" className="shrink-0"><Logo size="sm" subtitle="Support Operations" /></Link>
        <form onSubmit={submit} className="relative mx-auto hidden w-full max-w-xl sm:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)}
            placeholder="Search student name, email or ID"
            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-amber-400 focus:bg-white" />
        </form>
        <div className="ml-auto"><NotificationCenter /></div>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-bold text-slate-950">{initials}</span>
          <span className="hidden leading-tight lg:block"><b className="block max-w-40 truncate text-xs">{user?.fullName ?? 'Support Agent'}</b>
            <span className="text-[10px] text-slate-500">Support Agent</span></span>
        </div>
      </div>
    </header>

    <div className="flex">
      <aside className={`${menu ? 'block' : 'hidden'} fixed inset-x-0 top-16 z-30 border-b bg-white p-3 md:sticky md:top-16 md:block md:h-[calc(100vh-4rem)] md:w-64 md:shrink-0 md:border-b-0 md:border-r md:p-4`}>
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Workspace</p>
        <nav className="space-y-1">{nav.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return <Link key={item.href} href={item.href} onClick={() => setMenu(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active
              ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}>
            <item.icon size={17} className={active ? 'text-amber-400' : 'text-slate-400'} />{item.label}
          </Link>;
        })}</nav>
        <div className="mt-6 border-t pt-4"><button onClick={() => authApi.logout()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50">
          <LogOut size={17} />Sign out</button></div>
      </aside>
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  </div>;
}
