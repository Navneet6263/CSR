'use client';

import { FileText, CheckCircle, Clock, Sparkles } from 'lucide-react';

interface StudentHeroProps {
  userName: string;
  stats: {
    total: number;
    approved: number;
    pending: number;
    matched: number;
  };
}

export default function StudentHero({ userName, stats }: StudentHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1e3c72] via-[#2a5298] to-[#1e3c72] p-8 lg:p-10 shadow-[0_20px_50px_rgba(30,60,114,0.15)] text-white mb-8">
      {/* Mesh Gradient / Glow effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-400/20 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4" />

      <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-8 lg:items-end">
        {/* Greeting Section */}
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-widest text-emerald-100 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Dashboard Active
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3 leading-tight tracking-tight">
            Welcome back, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">
              {userName}
            </span> 👋
          </h1>
          <p className="text-blue-100/80 text-lg font-medium leading-relaxed max-w-md">
            Here is your scholarship radar for today. You are doing great!
          </p>
        </div>

        {/* Floating Stats Bento Mini-Grid */}
        <div className="grid grid-cols-2 gap-3 lg:gap-4 shrink-0 w-full lg:w-auto">
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 lg:p-5 rounded-3xl hover:bg-white/15 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
                <FileText size={18} />
              </div>
              <span className="text-sm font-semibold text-blue-100">Applications</span>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-black">{stats.total}</span>
              {/* Mini Sparkline Fake */}
              <svg className="w-12 h-6 text-emerald-400 opacity-60 mb-1" viewBox="0 0 50 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M0 20 Q 10 5, 20 15 T 50 0"/></svg>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 lg:p-5 rounded-3xl hover:bg-white/15 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                <CheckCircle size={18} />
              </div>
              <span className="text-sm font-semibold text-blue-100">Approved</span>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-black text-emerald-400">{stats.approved}</span>
              <svg className="w-12 h-6 text-emerald-400 opacity-60 mb-1" viewBox="0 0 50 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M0 20 Q 15 15, 25 10 T 50 2"/></svg>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 lg:p-5 rounded-3xl hover:bg-white/15 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                <Clock size={18} />
              </div>
              <span className="text-sm font-semibold text-blue-100">Pending</span>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-black">{stats.pending}</span>
              <svg className="w-12 h-6 text-amber-400 opacity-60 mb-1" viewBox="0 0 50 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M0 10 Q 15 15, 25 10 T 50 10"/></svg>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 lg:p-5 rounded-3xl hover:bg-white/15 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                <Sparkles size={18} />
              </div>
              <span className="text-sm font-semibold text-blue-100">Matched</span>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-black">{stats.matched}</span>
              <svg className="w-12 h-6 text-purple-400 opacity-60 mb-1" viewBox="0 0 50 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M0 20 Q 10 10, 25 15 T 50 0"/></svg>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
