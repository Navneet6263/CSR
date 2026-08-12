'use client';

import { Check, Copy, Send, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api/admin';
import { ApiError } from '@/lib/api/client';
import type { IssuedCredentials, StaffRole } from '@/types/admin';

const roles: { value: StaffRole; label: string }[] = [
  { value: 'Finance', label: 'Finance' }, { value: 'CSRPartner', label: 'CSR Partner' },
  { value: 'DocReviewer', label: 'Document Checker' },
  { value: 'BGCheckOfficer', label: 'Background Checker' }, { value: 'ScreeningOfficer', label: 'Screening Officer' },
  { value: 'SupportAgent', label: 'Support Agent' },
];

interface SponsorOption { id: number; name: string; totalFund: number }

export function CreateUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [role, setRole] = useState<StaffRole>('CSRPartner');
  const [financeFunction, setFinanceFunction] = useState<'Maker' | 'Checker'>('Maker');
  const [fullName, setFullName] = useState(''); const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState(''); const [fundCap, setFundCap] = useState('');
  const [sponsors, setSponsors] = useState<SponsorOption[]>([]);
  const [sponsorChoice, setSponsorChoice] = useState('');
  const [issued, setIssued] = useState<IssuedCredentials | null>(null);
  const [saving, setSaving] = useState(false); const [error, setError] = useState(''); const [copied, setCopied] = useState(false);

  useEffect(() => {
    adminApi.getSponsors().then((response) => setSponsors((response.data ?? []).map((row) => ({
      id: Number(row.SponsorID), name: String(row.SponsorName), totalFund: Number(row.TotalFund ?? 0),
    })))).catch((reason: Error) => setError(reason.message));
  }, []);

  const submit = async () => {
    setSaving(true); setError('');
    try {
      const isNewSponsor = role === 'CSRPartner' && sponsorChoice === 'new';
      const response = await adminApi.createUser({ fullName, email, role,
        financeFunction: role === 'Finance' ? financeFunction : undefined,
        sponsorId: role === 'CSRPartner' && !isNewSponsor ? Number(sponsorChoice) : undefined,
        organization: isNewSponsor ? organization : undefined,
        fundCap: isNewSponsor ? Number(fundCap) : undefined });
      const data = response.data as { temporaryPassword: string };
      setIssued({ email, temporaryPassword: data.temporaryPassword }); onCreated();
    } catch (reason) {
      setError(reason instanceof ApiError && reason.status === 409
        ? reason.message || 'This email already has an account. Use a different email address.'
        : reason instanceof Error ? reason.message : 'Account could not be created.');
    }
    finally { setSaving(false); }
  };
  const copy = async () => {
    if (!issued) return; await navigator.clipboard.writeText(`${issued.email} / ${issued.temporaryPassword}`);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4" onClick={onClose}>
    <div className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
      <div className="flex items-center justify-between border-b px-5 py-4"><div><p className="text-[10px] uppercase tracking-widest text-slate-400">Provision Access</p>
        <h3 className="text-sm font-semibold">{issued ? 'Credentials issued' : 'Create new user ID'}</h3></div>
        <button aria-label="Close" onClick={onClose}><X className="h-4 w-4" /></button></div>
      {issued ? <div className="space-y-4 p-5"><p className="text-xs text-slate-600">Show this one-time password securely to the user. It is not stored in readable form.</p>
        <div className="rounded-xl border bg-slate-50 p-4 text-xs"><div>{issued.email}</div><div className="mt-2 font-mono font-semibold">{issued.temporaryPassword}</div></div>
        <button onClick={copy} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs">{copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}{copied ? 'Copied' : 'Copy once'}</button>
        <button onClick={onClose} className="float-right rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white">Done</button></div>
      : <div className="space-y-4 p-5">
        <div className="grid grid-cols-2 gap-2">{roles.map((item) => <button key={item.value} onClick={() => setRole(item.value)}
          className={`rounded-lg border px-3 py-2 text-left text-xs ${role === item.value ? 'bg-slate-900 text-white' : ''}`}>{item.label}</button>)}</div>
        <div className="grid grid-cols-2 gap-3"><Field label="Full name" value={fullName} set={setFullName} /><Field label="Email" value={email} set={setEmail} type="email" /></div>
        <p className="text-[11px] text-slate-500">A secure temporary password will be generated after creation. Copy it once and share it privately with this user.</p>
        {role === 'Finance' ? <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-700">Finance responsibility</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(['Maker', 'Checker'] as const).map((value) => <button type="button" key={value} onClick={() => setFinanceFunction(value)}
              className={`rounded-lg border px-3 py-2 text-left text-xs ${financeFunction === value ? 'border-slate-900 bg-slate-900 text-white' : 'border-blue-100 bg-white text-slate-700'}`}>
              <b>Finance {value}</b><span className="mt-0.5 block text-[10px] opacity-70">{value === 'Maker' ? 'Initiate payment & record UTR' : 'Verify or reject independently'}</span>
            </button>)}
          </div>
          <p className="mt-2 text-[10px] text-blue-700">Maker and Checker access cannot be combined on one ID.</p>
        </div> : null}
        {role === 'CSRPartner' && <div className="space-y-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
          <label className="block text-[10px] uppercase tracking-widest text-emerald-700">Sponsor company
            <select value={sponsorChoice} onChange={(event) => setSponsorChoice(event.target.value)}
              className="mt-1 w-full rounded-lg border border-emerald-200 bg-white px-2.5 py-2 text-xs normal-case tracking-normal text-slate-900">
              <option value="">Select the company this account belongs to</option>
              {sponsors.map((sponsor) => <option key={sponsor.id} value={sponsor.id}>{sponsor.name} · ₹{sponsor.totalFund.toLocaleString('en-IN')}</option>)}
              <option value="new">+ Create a new sponsor company</option>
            </select>
          </label>
          {sponsorChoice === 'new' ? <div className="grid grid-cols-2 gap-3">
            <Field label="Company name" value={organization} set={setOrganization} />
            <Field label="Fund envelope (₹)" value={fundCap} set={setFundCap} type="number" />
          </div> : null}
          <p className="text-[11px] leading-relaxed text-emerald-800">This ID is isolated to the selected Sponsor ID. It cannot access another company&apos;s applications, history or fund data.</p>
        </div>}
        {error && <p role="alert" className="text-xs font-medium text-rose-600">{error}</p>}
        <div className="flex justify-end gap-2"><button onClick={onClose} className="rounded-lg border px-3 py-2 text-xs">Cancel</button>
          <button disabled={saving || !fullName || !email || (role === 'CSRPartner' && (!sponsorChoice || (sponsorChoice === 'new' && (!organization || !Number(fundCap)))))} onClick={submit} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"><Send className="h-3.5 w-3.5" />{saving ? 'Creating…' : 'Create account'}</button></div>
      </div>}
    </div>
  </div>;
}

function Field({ label, value, set, type = 'text' }: { label: string; value: string; set: (value: string) => void; type?: string }) {
  return <label className="text-[10px] uppercase tracking-widest text-slate-400">{label}
    <input type={type} value={value} onChange={(event) => set(event.target.value)} className="mt-1 w-full rounded-lg border px-2.5 py-2 text-xs normal-case tracking-normal text-slate-900" /></label>;
}
