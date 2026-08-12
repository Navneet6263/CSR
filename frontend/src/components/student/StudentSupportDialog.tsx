'use client';

import { CheckCircle2, LifeBuoy, X } from 'lucide-react';
import { useState } from 'react';
import { supportApi } from '@/lib/api';

const categories = ['Account', 'Profile', 'Application', 'Document', 'Payment', 'Technical', 'Other'];

export function StudentSupportDialog() {
  const [open, setOpen] = useState(false); const [subject, setSubject] = useState(''); const [message, setMessage] = useState('');
  const [category, setCategory] = useState('Application'); const [saving, setSaving] = useState(false);
  const [error, setError] = useState(''); const [done, setDone] = useState(false);
  const submit = async () => { setSaving(true); setError(''); try {
    await supportApi.createTicket({ subject, message, category, priority: 'Normal' });
    await supportApi.recordActivity({ pageCode: 'support/request', eventType: 'HelpRequested' }).catch(() => undefined);
    setDone(true); setSubject(''); setMessage('');
  } catch (reason) { setError(reason instanceof Error ? reason.message : 'Request could not be sent.'); } finally { setSaving(false); } };
  const close = () => { setOpen(false); setDone(false); setError(''); };

  return <><button onClick={() => setOpen(true)} className="grid h-9 w-9 place-items-center rounded-full bg-amber-100 text-amber-800 transition hover:bg-amber-200" aria-label="Get support" title="Get support"><LifeBuoy size={16} /></button>
    {open ? <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm" onClick={close}><div className="w-full max-w-lg rounded-3xl border bg-white p-5 text-slate-900 shadow-2xl" onClick={(event) => event.stopPropagation()}>
      <header className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">TalentBridge support</p><h2 className="mt-1 text-xl font-bold">How can we help?</h2></div>
        <button onClick={close} className="rounded-lg border p-2" aria-label="Close"><X size={15} /></button></header>
      {done ? <div className="py-10 text-center"><CheckCircle2 className="mx-auto text-emerald-600" size={42} /><h3 className="mt-3 text-lg font-bold">Request received</h3>
        <p className="mt-1 text-sm text-slate-500">Support can now review your application stage and safe activity signals.</p><button onClick={close} className="mt-5 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white">Done</button></div>
      : <div className="mt-5 space-y-4"><label className="block text-xs font-bold text-slate-600">Issue category<select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm font-normal">
        {categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="block text-xs font-bold text-slate-600">Short subject<input value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={200} placeholder="Example: Income certificate upload is failing"
          className="mt-1.5 w-full rounded-xl border px-3 py-2.5 text-sm font-normal outline-none focus:border-amber-400" /></label>
        <label className="block text-xs font-bold text-slate-600">What happened?<textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={4000} rows={5}
          placeholder="Tell us the step, what you tried, and the error shown. Never enter Aadhaar, OTP or bank account numbers here."
          className="mt-1.5 w-full rounded-xl border p-3 text-sm font-normal outline-none focus:border-amber-400" /></label>
        {error ? <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{error}</p> : null}
        <div className="flex items-center justify-between border-t pt-4"><p className="max-w-xs text-[10px] leading-relaxed text-slate-400">Your support request and its status changes are securely audited.</p>
          <button onClick={() => void submit()} disabled={saving || subject.trim().length < 5 || message.trim().length < 10}
            className="rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 disabled:opacity-40">{saving ? 'Sending…' : 'Send request'}</button></div></div>}
    </div></div> : null}</>;
}
