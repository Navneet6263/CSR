'use client';

import { User, BookOpen, CreditCard, FileText, CheckCircle2 } from 'lucide-react';
import type { StudentProfile } from '@/types';
import type { TabType } from '@/app/(dashboard)/student/profile/page';

interface ProfileSidebarProps {
  profile: StudentProfile;
  completionPercentage: number;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: 'personal', label: 'Personal Details', icon: User },
  { id: 'family', label: 'Family & Demographics', icon: User }, // Re-using User icon or another
  { id: 'education', label: 'Education', icon: BookOpen },
  { id: 'bank', label: 'Bank Details', icon: CreditCard },
  { id: 'corporate', label: 'Corporate Extras', icon: FileText },
  { id: 'documents', label: 'Documents', icon: FileText },
] as const;

export default function ProfileSidebar({ profile, completionPercentage, activeTab, onTabChange }: ProfileSidebarProps) {
  return (
    <div className="clay-card border border-white/60 bg-white/70 overflow-hidden flex flex-col h-full">
      {/* Profile Header */}
      <div className="p-6 text-center border-b border-slate-100">
        <div className="relative inline-block mb-4 group cursor-pointer">
          <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-[#5b2c6f] to-[#2e86c1] flex items-center justify-center text-white text-3xl font-black shadow-[4px_4px_15px_rgba(91,44,111,0.2),-4px_-4px_15px_rgba(255,255,255,0.8)] border-4 border-white transition-transform group-hover:scale-105">
            {profile.fullName?.charAt(0) || 'U'}
          </div>
          {completionPercentage === 100 && (
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1 border-2 border-white shadow-sm">
              <CheckCircle2 size={16} />
            </div>
          )}
        </div>
        
        <h2 className="text-lg font-bold text-slate-800 truncate px-2">{profile.fullName || 'Student Name'}</h2>
        <p className="text-sm font-medium text-slate-500 mb-6">{profile.user?.email || 'student@example.com'}</p>

        {/* Progress Bar */}
        <div className="px-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Profile Status</span>
            <span className={`text-xs font-black ${completionPercentage === 100 ? 'text-emerald-600' : 'text-[#5b2c6f]'}`}>
              {Math.round(completionPercentage)}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${completionPercentage === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#5b2c6f] to-[#2e86c1]'}`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="p-4 flex-1">
        <nav className="space-y-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as TabType)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-[#5b2c6f]/5 text-[#5b2c6f] shadow-[inset_2px_2px_5px_rgba(91,44,111,0.05)]' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isActive ? 'bg-[#5b2c6f]/10' : 'bg-transparent'}`}>
                  <Icon size={18} className={isActive ? 'text-[#5b2c6f]' : 'text-slate-400'} />
                </div>
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
