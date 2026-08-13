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
    <form onSubmit={handleSubmit} className={`space-y-4 ${shake ? 'animate-shake' : ''} max-w-[440px] w-full`}>

      <div className="space-y-1 mb-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Create Account</h2>
        <p className="text-slate-500 text-xs">Start your scholarship journey today</p>
      </div>

      {apiError && (
        <div className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs text-center shadow-sm">{apiError}</div>
      )}

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

      <TermsConsent accepted={form.termsAccepted} error={errors.termsAccepted}
        onChange={(termsAccepted) => { setForm((current) => ({ ...current, termsAccepted }));
          setErrors((current) => ({ ...current, termsAccepted: '' })); }} />

      <button type="submit" disabled={loading || !form.termsAccepted}
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
