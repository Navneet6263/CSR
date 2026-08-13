'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { LoginCredentials } from '@/types';
import { validateLoginForm, ValidationErrors } from '@/lib/validations';
import { authApi } from '@/lib/api';
import { roleHomePath } from '@/lib/navConfig';

const inputClass =
  'h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 ' +
  'focus:bg-white focus:border-emerald-600 focus:ring-emerald-600/15 transition rounded-xl shadow-none';

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

  useEffect(() => {
    const savedEmail = localStorage.getItem(rememberedEmailKey);
    if (savedEmail) { setForm((current) => ({ ...current, email: savedEmail })); setRememberEmail(true); }
  }, []);

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
      if (res.data?.user.mustChangePassword) { router.replace('/change-password'); return; }
      const role = res.data?.user.role || 'Student';
      router.replace(roleHomePath[role] || '/student');
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${shake ? 'animate-shake' : ''}`}>
      
      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700"><LockKeyhole className="h-3 w-3" />Secure portal</span>
        <h2 className="text-3xl font-bold tracking-tight text-slate-950">Welcome back</h2>
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
        <label className="flex cursor-pointer items-center gap-2 font-medium text-slate-600"><input type="checkbox" checked={rememberEmail} onChange={(event) => setRememberEmail(event.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-emerald-700" />Remember my email</label>
        <Link href="/forgot-password" className="font-semibold text-emerald-700 transition hover:text-emerald-800">
          Forgot password?
        </Link>
      </div>

      <button
        type="submit" disabled={loading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#123b7a] font-semibold text-white shadow-lg shadow-blue-950/15 transition hover:bg-[#0d326a] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <LoadingSpinner size="sm" className="text-white" /> : <>Sign in securely <ArrowRight className="h-4 w-4" /></>}
      </button>

      <p className="border-t border-slate-100 pt-5 text-center text-xs text-slate-500">
        New to Shikshavritti?{' '}
        <Link href="/register" className="ml-1 font-bold text-[#123b7a] transition hover:text-emerald-700">
          Create student account
        </Link>
      </p>
    </form>
  );
}
