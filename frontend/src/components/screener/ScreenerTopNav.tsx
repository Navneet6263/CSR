'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, User, LayoutGrid, CheckCircle } from 'lucide-react';
import { authApi } from '@/lib/api';

import Logo from '@/components/shared/Logo';

export default function ScreenerTopNav() {
  const pathname = usePathname();

  const handleLogout = () => {
    authApi.logout();
    window.location.href = '/login';
  };

  const navLinks = [
    { href: '/screener', label: 'Screening Queue', icon: LayoutGrid },
    { href: '/screener/history', label: 'History', icon: CheckCircle },
  ];

  return (
    <nav className="w-full h-20 bg-white/60 backdrop-blur-xl border-b border-white/40 sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-8">
          <Link href="/screener" className="flex items-center hover:opacity-90 transition-opacity">
            <Logo size="sm" showSubtitle={false} />
            <span className="px-2.5 py-1 bg-[#2e86c1]/10 text-[#2e86c1] text-[10px] uppercase font-black rounded-lg ml-3 border border-[#2e86c1]/20 shadow-sm">
              Screener
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    active 
                      ? 'bg-white text-[#2e86c1] border border-white/50 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,1)]' 
                      : 'text-slate-500 hover:text-[#2e86c1] hover:bg-white/50 border border-transparent'
                  }`}
                >
                  <Icon size={16} className={active ? 'text-[#2e86c1]' : ''} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          <Link href="/screener/profile" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/50 bg-white/50 hover:bg-white shadow-sm transition-all text-slate-600 text-sm font-bold">
            <User size={16} />
            <span className="hidden sm:inline">Profile</span>
          </Link>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 transition-all text-sm font-bold shadow-sm"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

      </div>
    </nav>
  );
}
