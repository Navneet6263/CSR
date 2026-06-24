'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import Logo from '@/components/shared/Logo';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { RegisterData } from '@/types';
import { validateRegisterForm, ValidationErrors } from '@/lib/validations';
import { authApi } from '@/lib/api';

const initialForm: RegisterData = {
  fullName: '', email: '', phone: '', password: '', confirmPassword: '', role: 'Student',
};

const inputClass =
  'pl-10 h-12 bg-white/60 border-slate-200/80 text-slate-800 placeholder:text-slate-400 ' +
  'focus:border-[#5b2c6f] focus:ring-[#5b2c6f]/20 transition-all duration-300 rounded-2xl ' +
  'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.04),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]';

function PasswordStrength({ password }: { password: string }) {
  const checks = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/];
  const strength = checks.filter((r) => r.test(password)).length;
  const colors = ['bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-emerald-400'];
  if (!password) return null;
  return (
    <div className="flex gap-1.5 mt-1.5">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < strength ? colors[strength - 1] : 'bg-slate-200'}`} />
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
    errors[field] ? <p className="text-xs text-red-500 pl-1">{errors[field]}</p> : null;

  return (
    <form onSubmit={handleSubmit} className={`space-y-5 ${shake ? 'animate-shake' : ''}`}>
      <Logo size="sm" />

      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-slate-800">Create Account</h2>
        <p className="text-sm text-slate-400">Start your scholarship journey today</p>
      </div>

      {apiError && (
        <div className="px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm text-center shadow-[inset_1px_1px_2px_rgba(0,0,0,0.04)]">{apiError}</div>
      )}

      {/* Full Name */}
      <div className="space-y-1.5">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} className={inputClass} />
        </div>
        <InputError field="fullName" />
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input name="email" type="email" placeholder="Email address" value={form.email} onChange={handleChange} className={inputClass} />
        </div>
        <InputError field="email" />
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} className={inputClass} />
        </div>
        <InputError field="phone" />
      </div>

      {/* Role toggle */}
      <div className="space-y-1.5">
        <p className="text-xs text-slate-400 uppercase tracking-wider font-medium pl-1">I am a</p>
        <div className="grid grid-cols-2 gap-3">
          {(['Student', 'Agent'] as const).map((role) => (
            <button key={role} type="button" onClick={() => setForm((p) => ({ ...p, role }))}
              className={`h-11 rounded-2xl text-sm font-medium transition-all duration-300 border ${
                form.role === role
                  ? 'bg-gradient-to-r from-[#5b2c6f] to-[#2e86c1] text-white border-transparent shadow-[4px_4px_10px_rgba(91,44,111,0.2)]'
                  : 'bg-white/60 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 shadow-[2px_2px_6px_rgba(0,0,0,0.06),-2px_-2px_6px_rgba(255,255,255,0.8)]'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
        <InputError field="role" />
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input name="password" type={showPassword ? 'text' : 'password'} placeholder="Password" value={form.password}
            onChange={handleChange} className={`${inputClass} pr-10`} />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <PasswordStrength password={form.password} />
        <InputError field="password" />
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input name="confirmPassword" type="password" placeholder="Confirm password" value={form.confirmPassword}
            onChange={handleChange} className={inputClass} />
        </div>
        <InputError field="confirmPassword" />
      </div>

      {/* Submit */}
      <button type="submit" disabled={loading}
        className="w-full h-12 rounded-2xl font-semibold text-white bg-gradient-to-r from-[#5b2c6f] to-[#2e86c1] hover:scale-[1.02] active:scale-[0.97] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[4px_4px_12px_rgba(91,44,111,0.25),-2px_-2px_8px_rgba(255,255,255,0.5)]"
      >
        {loading ? <LoadingSpinner size="sm" className="text-white" /> : 'Create Account'}
      </button>

      <div className="relative py-1">
        <Separator className="bg-slate-200" />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/70 px-4 text-xs text-slate-400 backdrop-blur-sm">or</span>
      </div>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="text-[#5b2c6f] hover:text-[#7d3c98] font-semibold transition-colors">Login</Link>
      </p>
    </form>
  );
}
