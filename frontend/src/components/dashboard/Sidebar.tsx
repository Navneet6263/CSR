'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard, FileText, GraduationCap, User,
  Users, CreditCard, Shield, ClipboardList, LogOut,
} from 'lucide-react';
import Logo from '@/components/shared/Logo';
import { authApi } from '@/lib/api';
import { navByRole } from '@/lib/navConfig';
import type { AuthUser } from '@/types';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, FileText, GraduationCap, User,
  Users, CreditCard, Shield, ClipboardList,
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const u = authApi.getUser();
    if (!u) { router.push('/login'); return; }
    setUser(u);
  }, [router]);

  const role = user?.role || 'Student';
  const navItems = navByRole[role] || navByRole.Student;

  const handleLogout = () => {
    authApi.logout();
    router.push('/login');
  };

  const isActive = (href: string) =>
    pathname === href || (href !== `/${role.toLowerCase()}` && pathname.startsWith(href));

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[280px] bg-white/70 backdrop-blur-sm border-r border-white/60 shadow-[4px_0_20px_rgba(0,0,0,0.04)] flex flex-col">
      <div className="p-6 pb-4"><Logo size="sm" showSubtitle={false} /></div>
      <div className="h-px mx-5 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={`clickable flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium group ${
                active
                  ? 'bg-[#5b2c6f]/5 text-[#5b2c6f] border-l-4 border-[#5b2c6f]'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <Icon size={20} className={active ? 'text-[#5b2c6f]' : 'text-slate-400 group-hover:text-slate-600'} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/40">
        {user && (
          <div className="clay-card p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#5b2c6f] to-[#2e86c1] flex items-center justify-center text-white text-sm font-bold">
              {user.fullName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user.fullName}</p>
              <p className="text-xs text-slate-400">{role}</p>
            </div>
            <button onClick={handleLogout} title="Logout"
              className="clickable p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
