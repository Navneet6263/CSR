'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, FileText, X } from 'lucide-react';
import PrivacyPolicyContent from '@/components/privacy/PrivacyPolicyContent';

interface Props { accepted: boolean; error?: string; onChange: (accepted: boolean) => void }

export default function TermsConsent({ accepted, error, onChange }: Props) {
  const [open, setOpen] = useState(false); const [readToEnd, setReadToEnd] = useState(false);
  useEffect(() => { if (!open) return; const close = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; window.addEventListener('keydown', close);
    return () => { document.body.style.overflow = overflow; window.removeEventListener('keydown', close); }; }, [open]);
  const modal = open && typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-[9999] grid min-h-dvh place-items-center bg-slate-950/65 p-3 backdrop-blur-md sm:p-6" role="dialog" aria-modal="true" aria-label="User Agreement and Privacy Policy">
      <section className="flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b px-4 py-3"><div><h3 className="font-semibold text-slate-900">User Agreement &amp; Privacy Policy</h3><p className="text-xs text-slate-500">Read to the end to continue registration.</p></div>
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Close policy"><X size={18} /></button></header>
        <div onScroll={(event) => { const node = event.currentTarget; if (node.scrollHeight - node.scrollTop - node.clientHeight < 32) setReadToEnd(true); }} className="overflow-y-auto bg-slate-50 p-4 sm:p-6"><PrivacyPolicyContent compact /><div className="h-1" /></div>
        <footer className="flex items-center justify-between gap-3 border-t px-4 py-3 text-xs"><span className={readToEnd ? 'text-emerald-700' : 'text-slate-500'}>{readToEnd ? 'Policy completed — acceptance is available.' : 'Continue scrolling to reach the end.'}</span>
          <button type="button" onClick={() => setOpen(false)} disabled={!readToEnd} className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-40">Continue</button></footer>
      </section>
    </div>, document.body) : null;
  return <div className="space-y-2">
    <button type="button" onClick={() => setOpen(true)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100">
      <span className="flex items-center gap-2"><FileText size={15} />Review User Agreement &amp; Privacy Policy</span>
      {readToEnd ? <CheckCircle2 size={16} className="text-emerald-600" /> : <span>Required</span>}
    </button>
    {readToEnd ? <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-slate-200 p-3 text-xs text-slate-700">
      <input type="checkbox" checked={accepted} onChange={(event) => onChange(event.target.checked)} className="mt-0.5 h-4 w-4 accent-slate-900" />
      <span>I have read and accept the User Agreement &amp; Privacy Policy (Version 1.0).</span>
    </label> : <p className="px-1 text-[10px] text-slate-500">Open and scroll through the policy to enable acceptance.</p>}
    {error && <p className="px-1 text-[10px] text-red-500">{error}</p>}
    {modal}
  </div>;
}
