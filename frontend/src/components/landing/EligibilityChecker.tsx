'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, Sparkles, Wand2, X } from 'lucide-react';
import { publicApi, type EligibilityMatch } from '@/lib/api/public';

const initial = { gender: '', category: '', state: '', course: '', annualFamilyIncome: '', previousYearMarks: '', age: '' };

export function EligibilityChecker() {
  const [form, setForm] = useState(initial); const [results, setResults] = useState<EligibilityMatch[] | null>(null);
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const set = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const ready = form.gender && form.category && form.state.trim() && form.course.trim() && form.annualFamilyIncome;
  async function check() {
    if (!ready) return; setLoading(true); setError('');
    try { const response = await publicApi.checkEligibility({ gender: form.gender, category: form.category,
      state: form.state.trim(), course: form.course.trim(), annualFamilyIncome: Number(form.annualFamilyIncome),
      previousYearMarks: form.previousYearMarks ? Number(form.previousYearMarks) : undefined,
      age: form.age ? Number(form.age) : undefined }); setResults(response.data ?? []); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Eligibility could not be checked.'); }
    finally { setLoading(false); }
  }
  const matches = results?.filter((item) => item.eligible) ?? [];
  return <section id="apply" className="content-auto border-t border-border bg-background py-16 sm:py-24"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-2xl text-center"><p className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary"><Sparkles className="h-3.5 w-3.5" />Rules-based match</p><h2 className="mt-3 text-3xl font-bold sm:text-4xl">Check active scholarship eligibility</h2><p className="mt-3 text-sm text-muted-foreground">The same eligibility rules used at application time are evaluated here. These answers are not stored.</p></div>
    <div className="mt-10 grid gap-6 lg:grid-cols-5"><section className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] lg:col-span-2"><h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider"><Wand2 className="h-4 w-4 text-primary" />Eligibility profile</h3>{error && <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}<div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Gender"><Select value={form.gender} onChange={(value) => set('gender', value)} options={['Male', 'Female', 'Other']} /></Field><Field label="Category"><Select value={form.category} onChange={(value) => set('category', value)} options={['General', 'OBC', 'SC', 'ST']} /></Field><Field label="State"><input className="input" maxLength={100} value={form.state} onChange={(event) => set('state', event.target.value)} placeholder="Your state" /></Field><Field label="Course"><input className="input" maxLength={200} value={form.course} onChange={(event) => set('course', event.target.value)} placeholder="Current course" /></Field><Field label="Annual family income"><input className="input" type="number" min="0" value={form.annualFamilyIncome} onChange={(event) => set('annualFamilyIncome', event.target.value)} /></Field><Field label="Previous year marks %"><input className="input" type="number" min="0" max="100" value={form.previousYearMarks} onChange={(event) => set('previousYearMarks', event.target.value)} /></Field><Field label="Age"><input className="input" type="number" min="10" max="100" value={form.age} onChange={(event) => set('age', event.target.value)} /></Field></div><button disabled={!ready || loading} onClick={() => void check()} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40">{loading ? 'Checking…' : 'Find my scholarships'}<ArrowRight className="h-4 w-4" /></button></section>
      <section className="rounded-2xl border bg-muted/30 p-6 lg:col-span-3"><div className="flex justify-between"><h3 className="text-sm font-bold uppercase tracking-wider">Match results</h3>{results && <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground">{matches.length} eligible</span>}</div>{results === null ? <Empty icon={<Sparkles />} title="Complete the form to run live rules" /> : !matches.length ? <Empty icon={<X />} title="No current exact matches" /> : <ul className="mt-4 space-y-3">{matches.map((item) => <li key={item.scholarshipId} className="flex items-center justify-between gap-3 rounded-xl border bg-background p-4"><div><p className="text-sm font-semibold">{item.name}</p><p className="text-xs text-muted-foreground">{item.sponsorName} · <b className="text-primary">₹{item.perStudentAmount.toLocaleString('en-IN')}</b></p><span className="mt-2 inline-flex items-center gap-1 text-[11px] text-emerald-700"><CheckCircle2 className="h-3 w-3" />All configured rules passed</span></div><a href="/register" className="rounded-md bg-foreground px-3 py-1.5 text-xs font-semibold text-background">Apply</a></li>)}</ul>}</section>
    </div></div><style>{`.input{width:100%;border-radius:.5rem;border:1px solid var(--color-border);background:var(--color-background);padding:.55rem .75rem;font-size:.875rem;outline:none}.input:focus{border-color:var(--color-primary)}`}</style></section>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>{children}</label>; }
function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) { return <select value={value} onChange={(event) => onChange(event.target.value)} className="input"><option value="">Select…</option>{options.map((option) => <option key={option}>{option}</option>)}</select>; }
function Empty({ icon, title }: { icon: React.ReactElement; title: string }) { return <div className="mt-10 flex flex-col items-center rounded-xl border border-dashed bg-background/60 p-10 text-center [&>svg]:h-8 [&>svg]:w-8 [&>svg]:text-primary">{icon}<p className="mt-3 text-sm font-medium">{title}</p></div>; }
