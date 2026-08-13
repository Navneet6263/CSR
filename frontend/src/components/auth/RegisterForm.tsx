'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { RegisterData } from '@/types';
import { validateRegisterForm, ValidationErrors } from '@/lib/validations';
import { authApi } from '@/lib/api';
import TermsConsent from './TermsConsent';

const initialForm: RegisterData = {
  fullName: '', email: '', phone: '', password: '', confirmPassword: '', role: 'Student', termsAccepted: false,
};

const inputClass =
  'h-[50px] rounded-[13px] border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 ' +
  'shadow-none transition focus:border-[#146cf0] focus:ring-4 focus:ring-[#146cf0]/10';

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
  const router = useRouter();
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
      router.replace('/student');
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const InputError = ({ field }: { field: string }) =>
    errors[field] ? <p className="text-[10px] text-red-500 pl-1 absolute -bottom-4">{errors[field]}</p> : null;

  return (
    <form onSubmit={handleSubmit} className={`w-full max-w-[440px] space-y-5 ${shake ? 'animate-shake' : ''}`}>

      <div className="space-y-2">
        <h2 className="text-[30px] font-bold tracking-tight text-slate-950">Create your account</h2>
        <p className="text-sm text-slate-500">Enter your details to start your scholarship journey.</p>
      </div>

      {apiError && (
        <div className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs text-center shadow-sm">{apiError}</div>
      )}

      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="relative block space-y-2 text-xs font-semibold text-slate-700">Full name
            <Input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} className={inputClass} />
            <InputError field="fullName" />
          </label>
          <label className="relative block space-y-2 text-xs font-semibold text-slate-700">Phone number
            <Input name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} className={inputClass} />
            <InputError field="phone" />
          </label>
        </div>

        <label className="relative block space-y-2 text-xs font-semibold text-slate-700">Email address
          <Input name="email" type="email" placeholder="Email address" value={form.email} onChange={handleChange} className={inputClass} />
          <InputError field="email" />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="relative block space-y-2 text-xs font-semibold text-slate-700">Password
            <Input name="password" type={showPassword ? 'text' : 'password'} placeholder="Password" value={form.password}
              onChange={handleChange} className={`${inputClass} pr-9`} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <PasswordStrength password={form.password} />
            <InputError field="password" />
          </label>

          <label className="relative block space-y-2 text-xs font-semibold text-slate-700">Confirm password
            <Input name="confirmPassword" type="password" placeholder="Repeat password" value={form.confirmPassword}
              onChange={handleChange} className={inputClass} />
            <InputError field="confirmPassword" />
          </label>
        </div>
      </div>

      <TermsConsent accepted={form.termsAccepted} error={errors.termsAccepted}
        onChange={(termsAccepted) => { setForm((current) => ({ ...current, termsAccepted }));
          setErrors((current) => ({ ...current, termsAccepted: '' })); }} />

      <button type="submit" disabled={loading || !form.termsAccepted}
        className="mt-2 flex h-[52px] w-full items-center justify-center gap-2 rounded-[13px] bg-[#146cf0] text-sm font-semibold text-white shadow-[0_12px_28px_rgba(20,108,240,.24)] transition hover:bg-[#075dd9] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <LoadingSpinner size="sm" className="text-white" /> : 'Create Account'}
      </button>

      <p className="text-center text-xs text-slate-500 pt-1">
        Already have an account?{' '}
        <Link href="/login" className="ml-1 font-bold text-[#146cf0] transition-colors hover:text-[#075dd9]">
          Sign in now
        </Link>
      </p>
    </form>
  );
}
