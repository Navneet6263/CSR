'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hydration safe user fetching
  const [user, setUser] = useState<{ fullName?: string } | null>(null);
  useEffect(() => {
    setUser(authApi.getUser());
  }, []);

  const profileCompletion = 85; // This would normally come from an API
  
  // Calculate SVG stroke dash offset
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (profileCompletion / 100) * circumference;

  // Mock Notifications (Status updates + Admin Announcements)
  const notifications = [
    { id: 1, type: 'announcement', title: 'New Scholarship Program', message: 'The Tata STEM Grant 2026 is now open for applications.', time: '2 hours ago', unread: true },
    { id: 2, type: 'status', title: 'Application Approved', message: 'Your application for Reliance Foundation has been approved!', time: '5 hours ago', unread: true },
    { id: 3, type: 'action', title: 'Action Required', message: 'Please upload your latest income certificate.', time: '1 day ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="h-[80px] bg-white/60 backdrop-blur-xl border-b border-white/50 shadow-[0_4px_30px_rgba(0,0,0,0.03)] flex items-center justify-between px-6 lg:px-10 relative z-50">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        
        {/* Advanced Notification Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-3 rounded-2xl transition-all shadow-[0_4px_12px_rgba(0,0,0,0.04)] border ${showNotifications ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-white/60 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-[10px] text-white flex items-center justify-center font-black shadow-md border-2 border-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-4 w-[340px] sm:w-[400px] bg-white/95 backdrop-blur-2xl rounded-[2rem] shadow-[0_30px_80px_rgba(0,0,0,0.15)] border border-white/80 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-5 border-b border-slate-100/50 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-800 text-lg">Notifications</h3>
                <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full transition-colors">Mark all read</button>
              </div>
              <div className="max-h-[420px] overflow-y-auto p-3 custom-scrollbar">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`p-4 rounded-[1.5rem] mb-2 cursor-pointer transition-all flex gap-4 ${notif.unread ? 'bg-emerald-50/60 hover:bg-emerald-50' : 'hover:bg-slate-50'}`}>
                    <div className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                      notif.type === 'announcement' ? 'bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 border border-blue-200' :
                      notif.type === 'status' ? 'bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600 border border-amber-200'
                    }`}>
                      {notif.type === 'announcement' ? <Info size={18} /> :
                       notif.type === 'status' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    </div>
                    <div>
                      <h4 className={`text-sm ${notif.unread ? 'font-bold text-slate-800' : 'font-semibold text-slate-600'}`}>{notif.title}</h4>
                      <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] font-bold text-slate-400 mt-2 block uppercase tracking-wider">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Circular Progress Avatar */}
        <div 
          className="relative flex items-center justify-center cursor-pointer group"
          onClick={() => router.push('/student/profile')}
        >
          {/* SVG Ring */}
          <svg className="w-[52px] h-[52px] transform -rotate-90 drop-shadow-sm">
            <circle cx="26" cy="26" r={radius} className="stroke-slate-200/60" strokeWidth="4" fill="transparent" />
            <circle cx="26" cy="26" r={radius} 
              className="stroke-emerald-500 transition-all duration-1000 ease-out" 
              strokeWidth="4" fill="transparent" 
              strokeDasharray={circumference} 
              strokeDashoffset={strokeDashoffset} 
              strokeLinecap="round" 
            />
          </svg>
          
          {/* Inner Avatar */}
          <div className="absolute inset-0 m-auto h-[36px] w-[36px] rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center text-white text-sm font-extrabold shadow-md group-hover:scale-95 transition-transform border-2 border-white">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          
          {/* Tooltip on hover */}
          <div className="absolute top-[60px] right-0 sm:right-auto sm:-translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs font-bold py-1.5 px-3 rounded-lg whitespace-nowrap pointer-events-none shadow-lg z-50">
            {profileCompletion}% Profile Complete
          </div>
        </div>

      </div>
    </header>
  );
}
