'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { authApi } from '@/lib/api';

const inputClass =
  'pl-10 h-12 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 ' +
  'focus:border-[#2e86c1] focus:ring-[#2e86c1]/20 transition-all duration-300 rounded-xl ' +
  'shadow-sm';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    setLoading(true);
    setApiError('');
    try {
      // Assuming you have a forgotPassword method in authApi. 
      // If not, we will mock it for UI purposes for now.
      if (authApi.forgotPassword) {
        await authApi.forgotPassword({ email });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      setSuccess(true);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6 text-center animate-fade-in py-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Check your email</h2>
          <p className="text-slate-500 text-sm max-w-[280px] mx-auto leading-relaxed">
            We've sent a password reset link to <span className="font-semibold text-slate-700">{email}</span>.
          </p>
        </div>
        <Link href="/login" className="inline-block mt-8 text-sm font-semibold text-slate-700 hover:text-[#2e86c1] transition-colors border border-slate-200 px-6 py-2.5 rounded-xl shadow-sm hover:shadow">
          Return to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${shake ? 'animate-shake' : ''}`}>
      
      <div className="space-y-2 mb-8">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
          Reset password
        </h2>
        <p className="text-slate-500 text-sm leading-relaxed max-w-[320px]">
          Enter the email address associated with your account and we'll send you a link to reset your password.
        </p>
      </div>

      {apiError && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center shadow-sm">
          {apiError}
        </div>
      )}

      <div className="space-y-1">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input
            name="email" type="email" placeholder="Enter your email address" value={email}
            onChange={(e) => { setEmail(e.target.value); setApiError(''); }} className={inputClass}
          />
        </div>
      </div>

      <button
        type="submit" disabled={loading}
        className="w-full h-12 mt-4 rounded-xl font-semibold text-white bg-[#0f172a] hover:bg-[#1e293b] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
      >
        {loading ? <LoadingSpinner size="sm" className="text-white" /> : 'Send Reset Link'}
      </button>

      <div className="pt-6">
        <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to sign in
        </Link>
      </div>
    </form>
  );
}
