'use client';

import { ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfileGamificationWidget() {
  const router = useRouter();
  
  // This would come from backend
  const nextTask = {
    title: 'Verify Income Details',
    reward: '24+ Scholarships',
    description: 'Students with verified income certificates are 3x more likely to get funded.'
  };

  return (
    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgba(16,185,129,0.2)] flex flex-col h-full text-white relative overflow-hidden group">
      {/* Decorative Background Elements */}
      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-[30px] group-hover:bg-white/20 transition-colors duration-700" />
      <div className="absolute top-10 -left-10 w-32 h-32 bg-teal-400/30 rounded-full blur-[20px]" />

      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white">
          <ShieldCheck size={20} />
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-wider">
          <Lock size={12} /> Unlock
        </div>
      </div>

      <div className="relative z-10 mt-auto">
        <h3 className="text-xl font-bold mb-1 drop-shadow-sm">{nextTask.title}</h3>
        <p className="text-sm text-emerald-50/90 font-medium mb-4 line-clamp-2">
          {nextTask.description}
        </p>
        
        <div className="flex items-center justify-between bg-black/10 backdrop-blur-sm p-1 pl-4 rounded-2xl border border-white/10">
          <span className="text-xs font-bold text-white">
            Unlocks <span className="text-amber-300">{nextTask.reward}</span>
          </span>
          <button 
            onClick={() => router.push('/student/profile')}
            className="p-2.5 bg-white text-emerald-600 rounded-xl hover:bg-emerald-50 hover:scale-105 active:scale-95 transition-all shadow-sm"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
