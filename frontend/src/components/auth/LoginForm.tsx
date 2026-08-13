'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, LockKeyhole, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { LoginCredentials } from '@/types';
import { validateLoginForm, ValidationErrors } from '@/lib/validations';
import { authApi } from '@/lib/api';
import { roleHomePath } from '@/lib/navConfig';

const inputClass =
  'h-[52px] rounded-[13px] border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 ' +
  'shadow-none transition focus:border-[#146cf0] focus:ring-4 focus:ring-[#146cf0]/10';

const rememberedEmailKey = 'shikshavritti.remembered-email';

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState<LoginCredentials>({ email: '', password: '' });
  const [rememberEmail, setRememberEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [otp, setOtp] = useState({ challengeId: '', maskedEmail: '', code: '' });
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    const savedEmail = localStorage.getItem(rememberedEmailKey);
    if (savedEmail) { setForm((current) => ({ ...current, email: savedEmail })); setRememberEmail(true); }
  }, []);
  useEffect(() => { if (resendIn <= 0) return; const timer = window.setTimeout(() => setResendIn((value) => value - 1), 1000);
    return () => window.clearTimeout(timer); }, [resendIn]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateLoginForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login(form);
      if (rememberEmail) localStorage.setItem(rememberedEmailKey, form.email.trim().toLowerCase());
      else localStorage.removeItem(rememberedEmailKey);
      if (res.data?.otpRequired && res.data.challengeId) {
        setOtp({ challengeId: res.data.challengeId, maskedEmail: res.data.maskedEmail ?? form.email, code: '' }); setResendIn(60); return;
      }
      if (res.data?.user?.mustChangePassword) { router.replace('/change-password'); return; }
      const role = res.data?.user?.role || 'Student';
      router.replace(roleHomePath[role] || '/student');
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  async function verifyOtp(event: React.FormEvent) {
    event.preventDefault(); if (!/^\d{6}$/.test(otp.code)) { setApiError('Enter the 6-digit OTP.'); return; }
    setLoading(true); setApiError('');
    try {
      const response = await authApi.verifyLoginOtp({ challengeId: otp.challengeId, code: otp.code });
      if (response.data?.user?.mustChangePassword) { router.replace('/change-password'); return; }
      const role = response.data?.user?.role ?? 'Student'; router.replace(roleHomePath[role] || '/student');
    } catch (error) { setApiError(error instanceof Error ? error.message : 'OTP verification failed.'); }
    finally { setLoading(false); }
  }
  async function resendOtp() {
    setLoading(true); setApiError('');
    try { const response = await authApi.resendLoginOtp(otp.challengeId);
      setOtp({ challengeId: response.data?.challengeId ?? '', maskedEmail: response.data?.maskedEmail ?? otp.maskedEmail, code: '' }); setResendIn(60); }
    catch (error) { setApiError(error instanceof Error ? error.message : 'OTP could not be resent.'); }
    finally { setLoading(false); }
  }

  if (otp.challengeId) return <form onSubmit={verifyOtp} className={`space-y-6 ${shake ? 'animate-shake' : ''}`}>
    <div className="space-y-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#146cf0]"><KeyRound className="h-3 w-3" />Email verification</span>
      <h2 className="text-[30px] font-bold tracking-tight text-slate-950">Check your email</h2><p className="text-sm leading-6 text-slate-500">We sent a 6-digit sign-in code to <b className="text-slate-700">{otp.maskedEmail}</b>. It expires in 10 minutes.</p></div>
    {apiError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600">{apiError}</div>}
    <label className="block space-y-2 text-xs font-semibold text-slate-700">One-time code<input autoFocus inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp.code} onChange={(event) => setOtp((current) => ({ ...current, code: event.target.value.replace(/\D/g, '').slice(0, 6) }))} placeholder="000000" className="h-14 w-full rounded-[13px] border border-slate-200 bg-white px-4 text-center font-mono text-2xl font-bold tracking-[0.45em] text-slate-950 outline-none focus:border-[#146cf0] focus:ring-4 focus:ring-[#146cf0]/10" /></label>
    <button disabled={loading || otp.code.length !== 6} className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[13px] bg-[#146cf0] font-semibold text-white shadow-[0_12px_28px_rgba(20,108,240,.24)] transition hover:bg-[#075dd9] disabled:opacity-50">{loading ? <LoadingSpinner size="sm" className="text-white" /> : <>Verify & continue <ArrowRight className="h-4 w-4" /></>}</button>
    <div className="text-center text-xs text-slate-600">Didn’t receive the code? <button type="button" disabled={loading || resendIn > 0} onClick={() => void resendOtp()} className="font-bold text-emerald-800 disabled:text-slate-400">{resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend OTP'}</button></div>
    <button type="button" onClick={() => { setOtp({ challengeId: '', maskedEmail: '', code: '' }); setApiError(''); }} className="mx-auto flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950"><ArrowLeft className="h-3.5 w-3.5" />Use a different account</button>
    <p className="rounded-xl border border-amber-200/70 bg-amber-50/80 p-3 text-[11px] leading-5 text-amber-900">For security, staff accounts require email verification on every new sign-in.</p>
  </form>;

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${shake ? 'animate-shake' : ''}`}>
      
      <div className="space-y-2">
        <h2 className="text-[30px] font-bold tracking-tight text-slate-950">Welcome back</h2>
        <p className="text-sm leading-6 text-slate-500">Sign in to continue to your Shikshavritti workspace.</p>
      </div>

      {apiError && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center shadow-sm">
          {apiError}
        </div>
      )}

      <div className="space-y-5">
        <label className="relative block space-y-2 text-xs font-semibold text-slate-700">Email address
          <Mail className="pointer-events-none absolute bottom-3.5 left-3.5 h-4 w-4 text-slate-400" />
          <Input name="email" type="email" autoComplete="username" placeholder="you@company.com" value={form.email}
            onChange={handleChange} className={`${inputClass} pl-10`} />
          {errors.email && <p className="text-xs text-red-500 pl-1 absolute -bottom-5">{errors.email}</p>}
        </label>

        <label className="relative block space-y-2 text-xs font-semibold text-slate-700">Password
          <div className="relative"><LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              name="password" type={showPassword ? 'text' : 'password'} placeholder="Password"
              autoComplete="current-password" value={form.password} onChange={handleChange}
              className={`${inputClass} pl-10 pr-12`}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500 pl-1 absolute -bottom-5">{errors.password}</p>}
        </label>
      </div>

      <div className="flex items-center justify-between gap-3 text-xs">
        <label className="flex cursor-pointer items-center gap-2 font-medium text-slate-600"><input type="checkbox" checked={rememberEmail} onChange={(event) => setRememberEmail(event.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-[#146cf0]" />Remember my email</label>
        <Link href="/forgot-password" className="font-semibold text-[#146cf0] transition hover:text-[#075dd9]">
          Forgot password?
        </Link>
      </div>

      <button
        type="submit" disabled={loading}
        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[13px] bg-[#146cf0] font-semibold text-white shadow-[0_12px_28px_rgba(20,108,240,.24)] transition hover:bg-[#075dd9] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <LoadingSpinner size="sm" className="text-white" /> : <>Sign in securely <ArrowRight className="h-4 w-4" /></>}
      </button>

      <p className="border-t border-slate-100 pt-5 text-center text-xs text-slate-500">
        New to Shikshavritti?{' '}
        <Link href="/register" className="ml-1 font-bold text-[#146cf0] transition hover:text-[#075dd9]">
          Create student account
        </Link>
      </p>
    </form>
  );
}
