'use client';

import { useEffect, useState } from 'react';
import { User, Mail, Shield, ShieldCheck, Activity, Key, CheckCircle, Clock } from 'lucide-react';
import { authApi } from '@/lib/api';
import { screeningApi } from '@/lib/api/screening';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function ScreenerProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const currentUser = authApi.getUser();
        setUser(currentUser);
        const statsRes = await screeningApi.getStats();
        if (statsRes.success) {
          setStats(statsRes.data);
        }
      } catch (err) {
        console.error('Failed to load profile data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading || !user) {
    return <div className="min-h-[80vh] flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 mt-6">
      
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-[#1a5276] p-10 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-[#5b2c6f]/30 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 rounded-full bg-white/10 border-4 border-white/20 p-2 backdrop-blur-md shadow-xl flex items-center justify-center shrink-0">
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-400 to-indigo-400 flex items-center justify-center text-4xl font-black text-white shadow-inner">
              {user.fullName?.charAt(0).toUpperCase()}
            </div>
          </div>
          
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-wider backdrop-blur-sm mb-2">
              <ShieldCheck size={14} /> {user.role} Account
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">{user.fullName}</h1>
            <p className="text-blue-200 text-lg flex items-center justify-center md:justify-start gap-2">
              <Mail size={18} className="opacity-70" /> {user.email}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Stats Column */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-[8px_8px_16px_rgba(0,0,0,0.04),-8px_-8px_16px_rgba(255,255,255,1)] border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Activity className="text-blue-500" /> Screening Activity
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Clock size={20} />
                  </div>
                  <span className="font-bold text-amber-900">Pending Review</span>
                </div>
                <span className="text-xl font-black text-amber-700">{stats?.pendingCount || 0}</span>
              </div>
              
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle size={20} />
                  </div>
                  <span className="font-bold text-emerald-900">Total Screened</span>
                </div>
                <span className="text-xl font-black text-emerald-700">{stats?.completedCount || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Settings Column */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-[8px_8px_16px_rgba(0,0,0,0.04),-8px_-8px_16px_rgba(255,255,255,1)] border border-slate-100">
            <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <User className="text-blue-500" /> Personal Details
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-800 font-semibold cursor-not-allowed">
                  {user.fullName}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <div className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-800 font-semibold cursor-not-allowed">
                  {user.email}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Role</label>
                <div className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-800 font-semibold cursor-not-allowed">
                  {user.role}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
                <div className="px-4 py-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-emerald-700 font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Key className="text-slate-500" size={18} /> Security Settings
              </h3>
              <p className="text-sm text-slate-500 mb-6">If you need to change your password or update your access permissions, please contact the System Administrator.</p>
              
              <button 
                onClick={() => alert('Password reset link sent to your email.')}
                className="px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold shadow-lg shadow-slate-900/20 hover:scale-[1.02] hover:bg-slate-800 transition-all active:scale-[0.98]"
              >
                Request Password Reset
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
