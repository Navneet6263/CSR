'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { RegisterData } from '@/types';
import { validateRegisterForm, ValidationErrors } from '@/lib/validations';
import { authApi } from '@/lib/api';

const initialForm: RegisterData = {
  fullName: '', email: '', phone: '', password: '', confirmPassword: '', role: 'Student',
};

const inputClass =
  'h-11 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 ' +
  'focus:border-[#2e86c1] focus:ring-[#2e86c1]/20 transition-all duration-300 rounded-xl ' +
  'shadow-sm text-sm';

function PasswordStrength({ password }: { password: string }) {
  const checks = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/];
  const strength = checks.filter((r) => r.test(password)).length;
  const colors = ['bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-[#2e86c1]'];
  if (!password) return null;
  return (
    <div className="flex gap-1.5 mt-1 absolute -bottom-2 w-full">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < strength ? colors[strength - 1] : 'bg-slate-200'}`} />
      ))}
    </div>
  );
}

export default function RegisterForm() {
  const [form, setForm] = useState<RegisterData>(initialForm);
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
    const v = validateRegisterForm(form);
    if (Object.keys(v).length > 0) {
      setErrors(v);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    setLoading(true);
    try {
      await authApi.register(form);
      window.location.href = '/dashboard';
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const InputError = ({ field }: { field: string }) =>
    errors[field] ? <p className="text-[10px] text-red-500 pl-1 absolute -bottom-4">{errors[field]}</p> : null;

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${shake ? 'animate-shake' : ''} max-w-[440px] w-full`}>

      <div className="space-y-1 mb-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Create Account</h2>
        <p className="text-slate-500 text-xs">Start your scholarship journey today</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button type="button" className="flex items-center justify-center gap-2 h-10 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
          <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Google
        </button>
        <button type="button" className="flex items-center justify-center gap-2 h-10 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          Facebook
        </button>
      </div>

      <div className="relative py-1">
        <Separator className="bg-slate-200" />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[10px] uppercase text-slate-600 font-medium">or register with email</span>
      </div>

      {apiError && (
        <div className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs text-center shadow-sm">{apiError}</div>
      )}

      {/* Role toggle */}
      <div className="space-y-1.5">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold pl-1">I am a</p>
        <div className="grid grid-cols-2 gap-2">
          {(['Student', 'Agent'] as const).map((role) => (
            <button key={role} type="button" onClick={() => setForm((p) => ({ ...p, role }))}
              className={`h-9 rounded-lg text-xs font-semibold transition-all duration-300 border ${
                form.role === role
                  ? 'bg-[#0f172a] text-white border-transparent shadow-md'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
        <InputError field="role" />
      </div>

      <div className="space-y-4 pt-1">
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <Input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} className={inputClass} />
            <InputError field="fullName" />
          </div>
          <div className="relative">
            <Input name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} className={inputClass} />
            <InputError field="phone" />
          </div>
        </div>

        <div className="relative">
          <Input name="email" type="email" placeholder="Email address" value={form.email} onChange={handleChange} className={inputClass} />
          <InputError field="email" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <Input name="password" type={showPassword ? 'text' : 'password'} placeholder="Password" value={form.password}
              onChange={handleChange} className={`${inputClass} pr-9`} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <PasswordStrength password={form.password} />
            <InputError field="password" />
          </div>

          <div className="relative">
            <Input name="confirmPassword" type="password" placeholder="Confirm pass" value={form.confirmPassword}
              onChange={handleChange} className={inputClass} />
            <InputError field="confirmPassword" />
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="w-full h-11 mt-2 rounded-xl font-semibold text-white bg-[#0f172a] hover:bg-[#1e293b] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg text-sm"
      >
        {loading ? <LoadingSpinner size="sm" className="text-white" /> : 'Create Account'}
      </button>

      <p className="text-center text-xs text-slate-500 pt-1">
        Already have an account?{' '}
        <Link href="/login" className="text-slate-800 hover:text-[#2e86c1] font-bold transition-colors ml-1 border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:shadow">
          Sign In &rarr;
        </Link>
      </p>
    </form>
  );
}
