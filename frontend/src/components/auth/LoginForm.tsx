'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import Logo from '@/components/shared/Logo';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { LoginCredentials } from '@/types';
import { validateLoginForm, ValidationErrors } from '@/lib/validations';
import { authApi } from '@/lib/api';
import { roleHomePath } from '@/lib/navConfig';

const inputClass =
  'pl-10 h-12 bg-white/60 border-slate-200/80 text-slate-800 placeholder:text-slate-400 ' +
  'focus:border-[#5b2c6f] focus:ring-[#5b2c6f]/20 transition-all duration-300 rounded-2xl ' +
  'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.04),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]';

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
      <Logo />

      <div className="text-center mt-6 space-y-1">
        <h2 className="text-2xl font-bold text-slate-800">
          Welcome Back
        </h2>
        <p className="text-sm text-slate-400">Sign in to continue your scholarship journey</p>
      </div>

      {apiError && (
        <div className="px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm text-center shadow-[inset_1px_1px_2px_rgba(0,0,0,0.04)]">
          {apiError}
        </div>
      )}

      {/* Email */}
      <div className="space-y-2">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input
            name="email" type="email" placeholder="Email address" value={form.email}
            onChange={handleChange} className={inputClass}
          />
        </div>
        {errors.email && <p className="text-xs text-red-500 pl-1">{errors.email}</p>}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input
            name="password" type={showPassword ? 'text' : 'password'} placeholder="Password"
            value={form.password} onChange={handleChange}
            className={`${inputClass} pr-10`}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-500 pl-1">{errors.password}</p>}
      </div>

      {/* Remember + Forgot */}
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-slate-500 cursor-pointer select-none">
          <input type="checkbox" className="rounded border-slate-300 accent-[#5b2c6f]" />
          Remember me
        </label>
        <Link href="/forgot-password" className="text-[#2e86c1] hover:text-[#1a5276] transition-colors font-medium">
          Forgot password?
        </Link>
      </div>

      {/* Submit */}
      <button
        type="submit" disabled={loading}
        className="w-full h-12 rounded-2xl font-semibold text-white bg-gradient-to-r from-[#5b2c6f] to-[#2e86c1] hover:scale-[1.02] active:scale-[0.97] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[4px_4px_12px_rgba(91,44,111,0.25),-2px_-2px_8px_rgba(255,255,255,0.5)]"
      >
        {loading ? <LoadingSpinner size="sm" className="text-white" /> : 'Sign In'}
      </button>

      <div className="relative py-2">
        <Separator className="bg-slate-200" />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/70 px-4 text-xs text-slate-400 backdrop-blur-sm">
          or
        </span>
      </div>

      <p className="text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-[#5b2c6f] hover:text-[#7d3c98] font-semibold transition-colors">
          Register
        </Link>
      </p>
    </form>
  );
}
