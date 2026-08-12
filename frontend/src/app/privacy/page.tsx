import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PrivacyPolicyContent from '@/components/privacy/PrivacyPolicyContent';

export const metadata: Metadata = {
  title: 'Privacy Policy | TalentBridge',
  description: 'User Agreement and Privacy Policy for the CSR Scholarship Portal.',
};

export default function PrivacyPolicyPage() {
  return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12"><div className="mx-auto max-w-4xl">
    <Link href="/" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-950"><ArrowLeft size={16} />Back to portal</Link>
    <div className="rounded-3xl border bg-white p-5 shadow-sm sm:p-10"><PrivacyPolicyContent /></div>
  </div></main>;
}
