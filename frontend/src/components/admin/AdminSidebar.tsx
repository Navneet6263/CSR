'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileCheck, 
  Search, 
  ShieldCheck, 
  Handshake, 
  GraduationCap,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react';
import Logo from '@/components/shared/Logo';
import { authApi } from '@/lib/api';
import { useState } from 'react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isRoleOpen, setIsRoleOpen] = useState(true);

  const handleLogout = () => {
    authApi.logout();
    window.location.href = '/login';
  };

  const menuItems = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  ];

  const roleItems = [
    { href: '/admin/pipeline/reviewer', label: 'Document Checkers', icon: FileCheck },
    { href: '/admin/pipeline/bgchecker', label: 'Background Checkers', icon: Search },
    { href: '/admin/pipeline/screener', label: 'Screening Officers', icon: ShieldCheck },
    { href: '/admin/pipeline/csr', label: 'CSR Partners', icon: Handshake },
  ];

  const settingsItems = [
    { href: '/admin/scholarships', label: 'Scholarships', icon: GraduationCap },
    { href: '/admin/settings', label: 'System Settings', icon: Settings },
  ];

  const NavItem = ({ href, label, icon: Icon, isActive }: any) => (
    <Link 
      href={href}
      className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all duration-300 ${
        isActive 
          ? 'text-slate-900 bg-slate-50/50 border-r-2 border-slate-900 font-bold' 
          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50/50'
      }`}
    >
      <Icon size={18} className={isActive ? 'text-slate-900' : 'text-slate-400'} strokeWidth={isActive ? 2.5 : 2} />
      {label}
    </Link>
  );

  return (
    <div className="fixed left-0 top-0 z-50 w-64 bg-white border-r border-slate-200 h-screen flex flex-col">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <LayoutDashboard size={16} className="text-white" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight text-lg">NexaDash</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-6">
        
        {/* Main Section */}
        <div className="space-y-1">
          <div className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Main</div>
          {menuItems.map(item => (
            <NavItem key={item.href} {...item} isActive={pathname === item.href} />
          ))}
        </div>

        {/* Role Dashboard Tree */}
        <div className="space-y-1">
          <div className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Role Dashboard</div>
          {roleItems.map(item => (
            <NavItem key={item.href} {...item} isActive={pathname === item.href} />
          ))}
        </div>

        {/* Settings */}
        <div className="space-y-1">
          <div className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Management</div>
          {settingsItems.map(item => (
            <NavItem key={item.href} {...item} isActive={pathname === item.href} />
          ))}
        </div>
      </div>

      {/* Profile Area */}
      <div className="p-6 shrink-0">
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 group-hover:border-slate-300 transition-colors">
            <span className="text-sm font-bold text-slate-600">AD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">Admin User</p>
            <p className="text-xs text-slate-500 truncate">System Administrator</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
