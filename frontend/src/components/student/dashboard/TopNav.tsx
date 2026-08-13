'use client';

import { LogOut, Search, UserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { NotificationCenter } from '@/components/shared/NotificationCenter';
import Logo from '@/components/shared/Logo';
import { StudentSupportDialog } from '@/components/student/StudentSupportDialog';
import { authApi } from '@/lib/api';

const navItems = [
  { label: 'Dashboard', href: '/student' }, { label: 'Scholarships', href: '/student/scholarships' },
  { label: 'My Applications', href: '/student/applications' }, { label: 'Profile & Documents', href: '/student/profile' },
];

export function TopNav({ studentName }: { studentName: string }) {
  const pathname = usePathname(); const router = useRouter(); const [search, setSearch] = useState('');
  const initials = studentName.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const submit = (event: FormEvent) => { event.preventDefault(); if (search.trim()) router.push(`/student/scholarships?query=${encodeURIComponent(search.trim())}`); };
  return <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md"><div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
    <Link href="/student" prefetch className="shrink-0"><Logo size="sm" showSubtitle={false} /></Link>
    <nav className="hidden flex-1 items-center gap-1 md:flex">{navItems.map((item) => <Link key={item.href} href={item.href} prefetch aria-current={pathname === item.href ? 'page' : undefined}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${pathname === item.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}>{item.label}</Link>)}</nav>
    <div className="ml-auto flex items-center gap-2"><form onSubmit={submit} className="relative hidden lg:block"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search scholarships…" className="h-9 w-56 rounded-full border bg-muted/40 pl-9 pr-4 text-sm outline-none focus:border-ring focus:bg-card" /></form>
      <StudentSupportDialog /><NotificationCenter />
      <Link href="/student/profile" className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3 text-sm font-medium hover:bg-accent">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{initials}</span><span className="hidden sm:inline">{studentName.split(' ')[0]}</span><UserRound size={13} className="text-muted-foreground" /></Link>
      <button onClick={() => void authApi.logout()} className="grid h-9 w-9 place-items-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-white" aria-label="Sign out"><LogOut size={15} /></button>
    </div>
  </div><nav className="flex overflow-x-auto border-t px-3 py-1.5 md:hidden">{navItems.map((item) => <Link key={item.href} href={item.href}
    className={`shrink-0 rounded-lg px-3 py-1.5 text-[10px] font-semibold ${pathname === item.href ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>{item.label}</Link>)}</nav></header>;
}
