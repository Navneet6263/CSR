'use client';

import { Megaphone } from 'lucide-react';

export default function AnnouncementsWidget() {
  // In a real app, this would be fetched from the API (Admin pushed announcements)
  const announcements = [
    {
      id: 1,
      title: 'HDFC Parivartan Deadline Extended',
      content: 'The deadline for the HDFC Parivartan Scholarship has been extended to 30th August 2026. Make sure to complete your applications!',
      date: 'Today',
      isNew: true,
    },
    {
      id: 2,
      title: 'New Verification Process',
      content: 'We have partnered with DigiLocker for instant income certificate verification. Connect your account from the Profile section.',
      date: '2 Days Ago',
      isNew: false,
    }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.1)] border border-slate-700 flex flex-col h-full text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-[40px] pointer-events-none" />
      
      <div className="relative z-10 flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
          <Megaphone size={18} />
        </div>
        <div>
          <h2 className="text-lg font-bold">Announcements</h2>
          <p className="text-xs text-slate-400">Updates from TalentBridge</p>
        </div>
      </div>

      <div className="relative z-10 flex-1 space-y-4">
        {announcements.map((ann) => (
          <div key={ann.id} className="group relative">
            <div className="flex items-start justify-between mb-1.5">
              <h3 className="font-semibold text-sm text-slate-100 group-hover:text-blue-400 transition-colors pr-2">
                {ann.title}
              </h3>
              {ann.isNew && (
                <span className="shrink-0 px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[9px] font-black uppercase tracking-wider border border-blue-500/30">
                  New
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
              {ann.content}
            </p>
            <p className="text-[10px] text-slate-500 mt-2 font-medium uppercase tracking-wider">
              {ann.date}
            </p>
            
            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-slate-700 to-transparent mt-4"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
