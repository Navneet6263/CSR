'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, FileText, LockKeyhole, X } from 'lucide-react';
import PrivacyPolicyContent from '@/components/privacy/PrivacyPolicyContent';

interface Props { accepted: boolean; error?: string; onChange: (accepted: boolean) => void }

export default function TermsConsent({ accepted, error, onChange }: Props) {
  const [open, setOpen] = useState(false); const [hasRead, setHasRead] = useState(accepted); const [progress, setProgress] = useState(accepted ? 100 : 0);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!open) return; const close = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; window.addEventListener('keydown', close);
    return () => { document.body.style.overflow = overflow; window.removeEventListener('keydown', close); }; }, [open]);
  useEffect(() => { if (!open || hasRead) return; const timer = window.setTimeout(() => {
    const node = scrollRef.current; if (node && node.scrollHeight <= node.clientHeight + 8) { setHasRead(true); setProgress(100); onChange(true); }
  }, 100); return () => window.clearTimeout(timer); }, [hasRead, onChange, open]);

  function trackReading(event: React.UIEvent<HTMLDivElement>) {
    const node = event.currentTarget; const available = Math.max(1, node.scrollHeight - node.clientHeight);
    const value = Math.min(100, Math.round(node.scrollTop / available * 100)); setProgress(value);
    if (!hasRead && node.scrollTop + node.clientHeight >= node.scrollHeight - 24) { setHasRead(true); setProgress(100); onChange(true); }
  }
  function showPolicy() { setOpen(true); }

  const modal = open && typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-[9999] grid min-h-dvh place-items-center bg-slate-950/70 p-3 backdrop-blur-md sm:p-6" role="dialog" aria-modal="true" aria-label="User Agreement and Privacy Policy">
      <section className="flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl">
        <header className="flex items-center justify-between gap-4 border-b px-4 py-3 sm:px-6"><div><h3 className="font-semibold text-slate-900">User Agreement &amp; Privacy Policy</h3><p className="mt-0.5 text-xs text-slate-500">Scroll to the end. Consent is recorded automatically after the complete policy is reviewed.</p></div>
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Close policy"><X size={18} /></button></header>
        <div className="h-1 bg-slate-100"><div className="h-full bg-emerald-600 transition-[width]" style={{ width: `${progress}%` }} /></div>
        <div ref={scrollRef} onScroll={trackReading} className="overflow-y-auto bg-slate-50 p-4 sm:p-6"><PrivacyPolicyContent compact /></div>
        <footer className="flex items-center justify-between gap-4 border-t px-4 py-3 text-xs sm:px-6"><span className={hasRead ? 'font-semibold text-emerald-700' : 'text-slate-500'}>{hasRead ? '✓ Policy reviewed and accepted' : `${progress}% reviewed · continue scrolling`}</span>
          <button type="button" disabled={!hasRead} onClick={() => setOpen(false)} className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">{hasRead ? 'Continue' : 'Read to continue'}</button></footer>
      </section>
    </div>, document.body) : null;

  return <div className="space-y-2">
    <button type="button" onClick={showPolicy} className={`flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left text-xs font-semibold transition ${accepted ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>
      <span className="flex items-center gap-2">{accepted ? <Check size={16} /> : <FileText size={15} />}{accepted ? 'Policy reviewed and accepted' : 'Read User Agreement & Privacy Policy'}</span>
      <span className="text-[10px] uppercase tracking-wider">{accepted ? 'Complete' : 'Required'}</span>
    </button>
    <button type="button" onClick={showPolicy} className="flex w-full items-start gap-2 rounded-xl border border-slate-200 p-3 text-left text-xs text-slate-700">
      <span aria-hidden className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border ${accepted ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-slate-300 bg-white'}`}>{accepted && <Check size={11} />}</span>
      <span>{accepted ? 'I agree to the User Agreement & Privacy Policy (Version 1.0).' : 'Open and read the complete policy to provide consent.'}</span>
    </button>
    {!accepted && <p className="flex items-center gap-1.5 px-1 text-[10px] text-slate-500"><LockKeyhole size={11} />Registration remains locked until the policy is reviewed.</p>}
    {error && <p className="px-1 text-[10px] text-red-500">{error}</p>}
    {modal}
  </div>;
}
