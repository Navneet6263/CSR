'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FileText, X } from 'lucide-react';
import PrivacyPolicyContent from '@/components/privacy/PrivacyPolicyContent';

interface Props { accepted: boolean; error?: string; onChange: (accepted: boolean) => void }

export default function TermsConsent({ accepted, error, onChange }: Props) {
  const [open, setOpen] = useState(false);
  useEffect(() => { if (!open) return; const close = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; window.addEventListener('keydown', close);
    return () => { document.body.style.overflow = overflow; window.removeEventListener('keydown', close); }; }, [open]);
  const modal = open && typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-[9999] grid min-h-dvh place-items-center bg-slate-950/65 p-3 backdrop-blur-md sm:p-6" role="dialog" aria-modal="true" aria-label="User Agreement and Privacy Policy">
      <section className="flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b px-4 py-3"><div><h3 className="font-semibold text-slate-900">User Agreement &amp; Privacy Policy</h3><p className="text-xs text-slate-500">Review the policy and close this window when you are done.</p></div>
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Close policy"><X size={18} /></button></header>
        <div className="overflow-y-auto bg-slate-50 p-4 sm:p-6"><PrivacyPolicyContent compact /></div>
        <footer className="flex justify-end border-t px-4 py-3 text-xs">
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white">Close</button></footer>
      </section>
    </div>, document.body) : null;
  return <div className="space-y-2">
    <button type="button" onClick={() => setOpen(true)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100">
      <span className="flex items-center gap-2"><FileText size={15} />Read User Agreement &amp; Privacy Policy</span>
      <span className="text-slate-400">Optional</span>
    </button>
    <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-slate-200 p-3 text-xs text-slate-700">
      <input type="checkbox" checked={accepted} onChange={(event) => onChange(event.target.checked)} className="mt-0.5 h-4 w-4 accent-slate-900" />
      <span>I agree to the User Agreement &amp; Privacy Policy (Version 1.0).</span>
    </label>
    {error && <p className="px-1 text-[10px] text-red-500">{error}</p>}
    {modal}
  </div>;
}
