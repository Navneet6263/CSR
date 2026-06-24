'use client';

import { Bell } from 'lucide-react';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <header className="h-16 bg-white/50 backdrop-blur-sm border-b border-white/40 shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex items-center justify-between px-6 lg:px-8">
      <div>
        <h1 className="text-lg font-bold text-slate-800">{title}</h1>
        {subtitle && (
          <p className="text-xs text-slate-400">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2.5 rounded-2xl bg-white/60 text-slate-500 hover:text-[#5b2c6f] hover:bg-white/80 transition-all shadow-[inset_2px_2px_4px_rgba(255,255,255,0.7),inset_-1px_-1px_3px_rgba(0,0,0,0.04)]">
          <Bell size={18} />
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-gradient-to-r from-[#c0392b] to-[#e74c3c] text-[10px] text-white flex items-center justify-center font-bold shadow-sm">
            3
          </span>
        </button>

        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#5b2c6f] to-[#2e86c1] flex items-center justify-center text-white text-sm font-bold shadow-[4px_4px_10px_rgba(91,44,111,0.15),-2px_-2px_6px_rgba(255,255,255,0.6)]">
          U
        </div>
      </div>
    </header>
  );
}
