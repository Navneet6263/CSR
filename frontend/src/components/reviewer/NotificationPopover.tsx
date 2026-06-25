// src/components/reviewer/NotificationPopover.tsx
'use client';

import { useState, useRef, useEffect } from "react";
import { Bell, Info, CheckCircle2, AlertCircle } from "lucide-react";

export function NotificationPopover() {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, type: "announcement", title: "System Maintenance", message: "The document verification portal will be down for 30 minutes tonight at 2 AM.", time: "2 hours ago", unread: true },
    { id: 2, type: "status", title: "New Batch Assigned", message: "20 new Reliance Foundation applications are ready for your review.", time: "5 hours ago", unread: true },
    { id: 3, type: "action", title: "Re-evaluation Request", message: "A student updated their Aadhar Card after your rejection. Please re-check.", time: "1 day ago", unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className={`relative rounded-full p-2 transition-colors ${showNotifications ? 'bg-white/90 text-foreground' : 'text-muted-foreground hover:bg-white/70 hover:text-foreground'}`}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2 items-center justify-center rounded-full bg-rose-400 ring-2 ring-white" />
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-4 w-[340px] origin-top-right overflow-hidden rounded-[2rem] border border-white/80 bg-white/95 shadow-[0_30px_80px_rgba(0,0,0,0.15)] backdrop-blur-2xl transition-all animate-in fade-in zoom-in-95 duration-200 sm:w-[400px]">
          <div className="flex items-center justify-between border-b border-slate-100/50 bg-slate-50/50 px-6 py-5">
            <h3 className="text-lg font-bold text-slate-800">Notifications</h3>
            <button className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 transition-colors hover:bg-indigo-100 hover:text-indigo-700">
              Mark all read
            </button>
          </div>
          <div className="custom-scrollbar max-h-[420px] overflow-y-auto p-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`mb-2 flex cursor-pointer gap-4 rounded-3xl p-4 transition-all ${
                  notif.unread ? "bg-indigo-50/60 hover:bg-indigo-50" : "hover:bg-slate-50"
                }`}
              >
                <div
                  className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm border ${
                    notif.type === "announcement"
                      ? "border-blue-200 bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600"
                      : notif.type === "status"
                      ? "border-emerald-200 bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600"
                      : "border-amber-200 bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600"
                  }`}
                >
                  {notif.type === "announcement" ? (
                    <Info size={18} />
                  ) : notif.type === "status" ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <AlertCircle size={18} />
                  )}
                </div>
                <div>
                  <h4
                    className={`text-sm ${
                      notif.unread ? "font-bold text-slate-800" : "font-semibold text-slate-600"
                    }`}
                  >
                    {notif.title}
                  </h4>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">
                    {notif.message}
                  </p>
                  <span className="mt-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {notif.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
