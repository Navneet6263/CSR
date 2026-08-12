'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
      if (res.data?.user.mustChangePassword) { window.location.href = '/change-password'; return; }
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
        <span className="text-slate-500">Secure session</span>
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
