'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { LoginCredentials } from '@/types';
import { validateLoginForm, ValidationErrors } from '@/lib/validations';
import { authApi } from '@/lib/api';
import { roleHomePath } from '@/lib/navConfig';

const inputClass =
  'h-12 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 ' +
  'focus:border-[#2e86c1] focus:ring-[#2e86c1]/20 transition-all duration-300 rounded-xl ' +
  'shadow-sm';

export default function LoginForm() {
  const [form, setForm] = useState<LoginCredentials>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

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
      const role = res.data?.user.role || 'Student';
      window.location.href = roleHomePath[role] || '/student';
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${shake ? 'animate-shake' : ''}`}>
      
      <div className="space-y-2 mb-8">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
          Welcome back
        </h2>
        <p className="text-slate-500 text-sm">Sign in to your TalentBridge account</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button type="button" className="flex items-center justify-center gap-2 h-11 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Google
        </button>
        <button type="button" className="flex items-center justify-center gap-2 h-11 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          Facebook
        </button>
      </div>

      <div className="relative py-2">
        <Separator className="bg-slate-200" />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-xs text-slate-600 font-medium">
          or continue with email
        </span>
      </div>

      {apiError && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center shadow-sm">
          {apiError}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-1 relative">
          <Input
            name="email" type="email" placeholder="Email address" value={form.email}
            onChange={handleChange} className={inputClass}
          />
          {errors.email && <p className="text-xs text-red-500 pl-1 absolute -bottom-5">{errors.email}</p>}
        </div>

        <div className="space-y-1 relative pt-2">
          <div className="relative">
            <Input
              name="password" type={showPassword ? 'text' : 'password'} placeholder="Password"
              value={form.password} onChange={handleChange}
              className={`${inputClass} pr-12`}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500 pl-1 absolute -bottom-5">{errors.password}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm pt-4">
        <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
          <input type="checkbox" className="rounded border-slate-300 w-4 h-4 text-[#2e86c1] focus:ring-[#2e86c1]" />
          Remember me for 30 days
        </label>
        <Link href="/forgot-password" className="text-slate-700 hover:text-[#2e86c1] transition-colors font-semibold">
          Forgot password?
        </Link>
      </div>

      <button
        type="submit" disabled={loading}
        className="w-full h-12 mt-4 rounded-xl font-semibold text-white bg-[#0f172a] hover:bg-[#1e293b] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
      >
        {loading ? <LoadingSpinner size="sm" className="text-white" /> : 'Sign In'}
      </button>

      <p className="text-center text-sm text-slate-500 pt-6">
        New to TalentBridge?{' '}
        <Link href="/register" className="text-slate-800 hover:text-[#2e86c1] font-bold transition-colors ml-1 border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:shadow">
          Create account &rarr;
        </Link>
      </p>
    </form>
  );
}
