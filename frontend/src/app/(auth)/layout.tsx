import { CheckCircle2, LockKeyhole, ShieldCheck } from 'lucide-react';
import AuthBackground from '@/components/auth/AuthBackground';
import Logo from '@/components/shared/Logo';

const assurances = [
  { icon: LockKeyhole, label: 'Encrypted records' },
  { icon: ShieldCheck, label: 'Role-based access' },
  { icon: CheckCircle2, label: 'Auditable decisions' },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="relative min-h-dvh overflow-x-hidden bg-[#061b33] p-4 sm:p-6 lg:p-8">
    <AuthBackground />
    <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-2rem)] w-full max-w-[1380px] items-center gap-8 sm:min-h-[calc(100dvh-3rem)] lg:grid-cols-[1.1fr_.9fr] lg:gap-14">
      <section className="hidden max-w-2xl self-stretch py-8 lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white"><span className="h-px w-8 bg-orange-400" />Shikshavritti</div>
        <div className="py-12">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.28em] text-orange-300">Scholarships built on trust</p>
          <h1 className="max-w-xl text-5xl font-bold leading-[1.08] tracking-tight text-white xl:text-6xl">A fair path from application to award.</h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-200 xl:text-lg">One secure workspace for students, verification teams, CSR partners and controlled scholarship disbursement.</p>
          <div className="mt-9 flex flex-wrap gap-3">{assurances.map(({ icon: Icon, label }) => <span key={label} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md"><Icon className="h-4 w-4 text-emerald-300" />{label}</span>)}</div>
        </div>
        <p className="text-xs text-slate-300/80">Shikshavritti · Privacy-first scholarship operations</p>
      </section>

      <section className="flex items-center justify-center py-4 lg:justify-end">
        <div className="relative w-full max-w-[480px] overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_30px_90px_rgba(2,12,27,.42)]">
          <div className="h-1 w-full bg-gradient-to-r from-[#146cf0] via-[#2684ff] to-[#58a6ff]" />
          <div className="px-6 pb-7 pt-7 sm:px-10 sm:pb-9 sm:pt-9">
            <Logo size="sm" subtitle="CSR Scholarship Platform" />
            <div className="mt-8">{children}</div>
            <div className="mt-7 flex items-center justify-center gap-2 border-t border-slate-100 pt-5 text-[10px] font-medium text-slate-500"><ShieldCheck className="h-3.5 w-3.5 text-[#146cf0]" />Protected session · Privacy-controlled access</div>
          </div>
        </div>
      </section>
    </div>
  </main>;
}
