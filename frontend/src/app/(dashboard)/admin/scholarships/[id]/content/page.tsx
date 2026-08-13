'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, Building2, CheckCircle2, Download, Eye, FileText, ImagePlus,
  Loader2, Plus, RefreshCw, Save, Sparkles, Trash2, Upload,
} from 'lucide-react';
import { scholarshipApi } from '@/lib/api';
import type { Scholarship, ScholarshipContentRecord, ScholarshipStructuredContent } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const API_ORIGIN = API_BASE.replace(/\/api\/v1\/?$/, '');
const assetUrl = (value: string) => value.startsWith('/api/v1/') ? `${API_ORIGIN}${value}` : `${API_BASE}${value}`;

export default function ScholarshipContentBuilderPage() {
  const id = Number(useParams<{ id: string }>().id);
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [record, setRecord] = useState<ScholarshipContentRecord | null>(null);
  const [content, setContent] = useState<ScholarshipStructuredContent | null>(null);
  const [source, setSource] = useState<File | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [localLogoPreview, setLocalLogoPreview] = useState('');
  const [logoLoadError, setLogoLoadError] = useState(false);
  const [logoNonce, setLogoNonce] = useState(0);
  const [changeNote, setChangeNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [scholarshipResponse, contentResponse] = await Promise.all([
        scholarshipApi.getById(id), scholarshipApi.getContent(id),
      ]);
      setScholarship(scholarshipResponse.data);
      setRecord(contentResponse.data);
      setContent(contentResponse.data.draft);
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Content builder could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!logo) { setLocalLogoPreview(''); return; }
    const url = URL.createObjectURL(logo);
    setLocalLogoPreview(url);
    setLogoLoadError(false);
    return () => URL.revokeObjectURL(url);
  }, [logo]);

  function accept(response: { data: ScholarshipContentRecord }, message: string) {
    setRecord(response.data);
    setContent(response.data.draft);
    setNotice(message);
    setError('');
  }

  async function generate() {
    setBusy('generate'); setError(''); setNotice('');
    try {
      const response = await scholarshipApi.generateContent(id, source ?? undefined);
      accept(response, source
        ? 'Document imported and structured. Review every section below.'
        : 'Professional draft regenerated from scholarship data.');
      setSource(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Draft could not be generated.');
    } finally { setBusy(''); }
  }

  async function save() {
    if (!content) return;
    setBusy('save'); setError(''); setNotice('');
    try {
      accept(await scholarshipApi.saveContent(id, content, changeNote || undefined),
        'Edits saved as a new review version.');
      setChangeNote('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Content could not be saved.');
    } finally { setBusy(''); }
  }

  async function publish() {
    if (!content) return;
    setBusy('publish'); setError(''); setNotice('');
    try {
      const saved = await scholarshipApi.saveContent(id, content, changeNote || 'Final admin review before publishing');
      accept(await scholarshipApi.publishContent(id), `Version ${saved.data.draftVersion} approved and published.`);
      setChangeNote('');
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Content could not be published.');
    } finally { setBusy(''); }
  }

  async function uploadLogo() {
    if (!logo) return;
    setBusy('logo'); setError(''); setNotice('');
    try {
      await scholarshipApi.uploadLogo(id, logo);
      setLogo(null);
      setLogoLoadError(false);
      setLogoNonce((value) => value + 1);
      setNotice(`Logo saved for ${scholarship?.sponsorName ?? 'the funding partner'}. It is now used on student scholarship cards, the Details page and application preview.`);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Logo could not be uploaded.');
    } finally { setBusy(''); }
  }

  if (loading) return <div className="grid min-h-96 place-items-center"><Loader2 className="h-7 w-7 animate-spin" /></div>;
  if (!scholarship || !content || !record) {
    return <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-700">{error || 'Content draft is unavailable.'}</p>;
  }

  const set = <K extends keyof ScholarshipStructuredContent>(key: K, value: ScholarshipStructuredContent[K]) =>
    setContent((current) => current ? { ...current, [key]: value } : current);
  const savedLogoUrl = scholarship.sponsorLogoURL
    ? `${assetUrl(scholarship.sponsorLogoURL)}?v=${logoNonce}`
    : '';
  const visibleLogoUrl = localLogoPreview || savedLogoUrl;
  const logoIsLive = Boolean(savedLogoUrl) && !logoLoadError;

  return <div className="mx-auto max-w-[1500px] space-y-5 pb-28">
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <Link href={`/admin/scholarships/${id}`} className="inline-flex items-center gap-1.5 text-xs text-slate-500">
          <ArrowLeft className="h-3.5 w-3.5" />Back to scholarship
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">Scholarship Content Builder</h1>
        <p className="text-sm text-slate-500">Import or generate, verify, edit, then publish the applicant-facing program details.</p>
      </div>
      <Status status={record.status} version={record.draftVersion} />
    </header>

    {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
    {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}

    <div className="grid gap-4 xl:grid-cols-2">
      <SourcePanel
        id={id} source={source} record={record} busy={busy}
        onSource={setSource} onGenerate={() => void generate()}
      />
      <BrandingPanel
        scholarship={scholarship} logo={logo} logoUrl={visibleLogoUrl}
        logoIsLive={logoIsLive} logoLoadError={logoLoadError} busy={busy}
        onLogo={setLogo} onLogoError={setLogoLoadError} onUpload={() => void uploadLogo()}
      />
    </div>

    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(420px,.85fr)]">
      <section className="space-y-4 rounded-2xl border bg-white p-5">
        <div className="flex items-center gap-2 border-b pb-4">
          <Save className="h-4 w-4" />
          <div><h2 className="font-semibold">Editable structured draft</h2><p className="text-xs text-slate-500">Every publish requires this content to pass validation.</p></div>
        </div>
        <Field label="Professional overview">
          <textarea rows={5} maxLength={5000} value={content.overview}
            onChange={(event) => set('overview', event.target.value)} className="input min-h-32 resize-y" />
        </Field>
        <ListEditor label="Program highlights" value={content.highlights} onChange={(value) => set('highlights', value)} />
        <ListEditor label="Eligibility summary" value={content.eligibility} onChange={(value) => set('eligibility', value)} />
        <ListEditor label="Benefits" value={content.benefits} onChange={(value) => set('benefits', value)} />
        <ListEditor label="Required documents" value={content.requiredDocuments} onChange={(value) => set('requiredDocuments', value)} />
        <ListEditor label="Application steps" value={content.applicationSteps} onChange={(value) => set('applicationSteps', value)} />
        <ListEditor label="Terms & conditions" value={content.termsAndConditions} onChange={(value) => set('termsAndConditions', value)} rows={9} />
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Contact email"><input className="input" value={content.contact.email ?? ''} onChange={(event) => set('contact', { ...content.contact, email: event.target.value })} /></Field>
          <Field label="Contact phone"><input className="input" value={content.contact.phone ?? ''} onChange={(event) => set('contact', { ...content.contact, phone: event.target.value })} /></Field>
          <Field label="Website"><input className="input" value={content.contact.website ?? ''} onChange={(event) => set('contact', { ...content.contact, website: event.target.value })} /></Field>
        </div>
        <FaqEditor value={content.faqs} onChange={(value) => set('faqs', value)} />
      </section>

      <aside className="xl:sticky xl:top-5 xl:self-start">
        <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b px-5 py-4"><Eye className="h-4 w-4" /><h2 className="font-semibold">Student preview</h2></div>
          <div className="max-h-[75vh] space-y-5 overflow-y-auto p-5">
            <div>
              {visibleLogoUrl && !logoLoadError && <img src={visibleLogoUrl} onError={() => setLogoLoadError(true)} alt={`${scholarship.sponsorName} logo`} className="mb-4 max-h-14 max-w-40 object-contain" />}
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Funded by {scholarship.sponsorName}</p>
              <h3 className="mt-1 text-2xl font-bold">{scholarship.name}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{content.overview}</p>
            </div>
            {previewSections(content).map(([title, values]) => <PreviewSection key={title} title={title} values={values} />)}
          </div>
        </section>
        <VersionHistory record={record} />
      </aside>
    </div>

    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 px-5 py-3 backdrop-blur lg:left-[260px]">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-3 sm:flex-row sm:items-center">
        <input value={changeNote} onChange={(event) => setChangeNote(event.target.value)} maxLength={500}
          placeholder="Optional change note for version history" className="input flex-1" />
        <button onClick={() => void save()} disabled={Boolean(busy)} className="inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold disabled:opacity-40"><Save className="h-4 w-4" />Save review draft</button>
        <button onClick={() => void publish()} disabled={Boolean(busy)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40">
          {busy === 'publish' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}Approve & publish
        </button>
      </div>
    </div>
  </div>;
}

function SourcePanel({ id, source, record, busy, onSource, onGenerate }: {
  id: number; source: File | null; record: ScholarshipContentRecord; busy: string;
  onSource: (file: File | null) => void; onGenerate: () => void;
}) {
  return <section className="rounded-2xl border bg-white p-5">
    <div className="flex items-center gap-2"><FileText className="h-4 w-4" /><h2 className="font-semibold">Source document</h2></div>
    <p className="mt-1 text-xs text-slate-500">PDF, DOCX, XLSX, CSV or TXT · maximum 10 MB · source stays private</p>
    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
      <label className="flex min-h-11 flex-1 cursor-pointer items-center gap-2 rounded-xl border border-dashed px-4 text-sm text-slate-600 hover:bg-slate-50">
        <Upload className="h-4 w-4" /><span className="truncate">{source?.name || 'Choose source document'}</span>
        <input type="file" accept=".pdf,.docx,.xlsx,.csv,.txt" className="hidden" onChange={(event) => onSource(event.target.files?.[0] ?? null)} />
      </label>
      <button onClick={onGenerate} disabled={Boolean(busy)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">
        {busy === 'generate' ? <Loader2 className="h-4 w-4 animate-spin" /> : source ? <Sparkles className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
        {source ? 'Import & structure' : 'Generate without file'}
      </button>
    </div>
    {record.sourceOriginalName && <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
      <span>Current source: <b>{record.sourceOriginalName}</b> ({record.sourceType})</span>
      {record.sourceAvailable && <a href={`${API_BASE}/scholarships/${id}/content/source`} className="inline-flex items-center gap-1 font-semibold text-blue-700"><Download className="h-3 w-3" />Open</a>}
    </div>}
  </section>;
}

function BrandingPanel({ scholarship, logo, logoUrl, logoIsLive, logoLoadError, busy, onLogo, onLogoError, onUpload }: {
  scholarship: Scholarship; logo: File | null; logoUrl: string; logoIsLive: boolean; logoLoadError: boolean; busy: string;
  onLogo: (file: File | null) => void; onLogoError: (value: boolean) => void; onUpload: () => void;
}) {
  return <section className="rounded-2xl border bg-white p-5">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2"><Building2 className="h-4 w-4" /><h2 className="font-semibold">Funding partner branding</h2></div>
      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${logoIsLive ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>{logoIsLive ? 'Logo live' : 'Logo required'}</span>
    </div>
    <p className="mt-1 text-xs leading-5 text-slate-500">
      This is the company-level logo for <b>{scholarship.sponsorName}</b>. It appears on student scholarship cards, the full Details page, and the student preview. All scholarships funded by this company use the same logo.
    </p>
    <div className="mt-4 flex items-center gap-4">
      <div className="grid h-24 w-40 shrink-0 place-items-center overflow-hidden rounded-xl border bg-slate-50 p-3">
        {logoUrl && !logoLoadError
          ? <img src={logoUrl} onLoad={() => onLogoError(false)} onError={() => onLogoError(true)} alt={`${scholarship.sponsorName} logo preview`} className="max-h-full max-w-full object-contain" />
          : <div className="text-center"><ImagePlus className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-1 text-[10px] text-slate-400">No visible logo</p></div>}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs hover:bg-slate-50">
          <ImagePlus className="h-3.5 w-3.5" /><span className="truncate">{logo?.name || 'Choose PNG or JPEG logo'}</span>
          <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={(event) => onLogo(event.target.files?.[0] ?? null)} />
        </label>
        {logo && <p className="text-[10px] font-medium text-blue-700">Preview shown on the left. Click save to apply it.</p>}
        {logoLoadError && !logo && <p role="alert" className="text-[10px] font-medium text-rose-600">Saved logo could not be loaded. Upload it again.</p>}
        <button disabled={!logo || Boolean(busy)} onClick={onUpload} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">
          {busy === 'logo' ? 'Uploading…' : 'Save & apply company logo'}
        </button>
      </div>
    </div>
  </section>;
}

function FaqEditor({ value, onChange }: { value: ScholarshipStructuredContent['faqs']; onChange: (value: ScholarshipStructuredContent['faqs']) => void }) {
  return <div>
    <div className="flex items-center justify-between">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">FAQs</label>
      <button onClick={() => onChange([...value, { question: '', answer: '' }])} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700"><Plus className="h-3 w-3" />Add FAQ</button>
    </div>
    <div className="mt-2 space-y-2">{value.map((faq, index) => <div key={`faq-${index}`} className="grid gap-2 rounded-xl border p-3 sm:grid-cols-[1fr_1.5fr_auto]">
      <input className="input" placeholder="Question" value={faq.question} onChange={(event) => onChange(value.map((item, i) => i === index ? { ...item, question: event.target.value } : item))} />
      <textarea className="input min-h-16" placeholder="Answer" value={faq.answer} onChange={(event) => onChange(value.map((item, i) => i === index ? { ...item, answer: event.target.value } : item))} />
      <button aria-label="Remove FAQ" onClick={() => onChange(value.filter((_, i) => i !== index))} className="p-2 text-rose-600"><Trash2 className="h-4 w-4" /></button>
    </div>)}</div>
  </div>;
}

function VersionHistory({ record }: { record: ScholarshipContentRecord }) {
  return <section className="mt-4 rounded-2xl border bg-white p-4">
    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Version history</h3>
    <ul className="mt-3 max-h-44 space-y-2 overflow-y-auto">{record.history.map((item, index) =>
      <li key={item.versionId || `${item.versionNumber}-${item.createdAt}-${index}`} className="rounded-lg bg-slate-50 p-2 text-xs">
        <b>v{item.versionNumber} · {item.sourceType}</b>
        <p className="mt-0.5 text-slate-500">{item.changeNote || 'Content updated'}</p>
      </li>)}</ul>
  </section>;
}

function previewSections(content: ScholarshipStructuredContent): Array<[string, string[]]> {
  return [
    ['Highlights', content.highlights], ['Eligibility', content.eligibility], ['Benefits', content.benefits],
    ['Required documents', content.requiredDocuments], ['How to apply', content.applicationSteps],
    ['Terms & conditions', content.termsAndConditions],
  ];
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5"><span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>{children}</label>;
}
function ListEditor({ label, value, onChange, rows = 5 }: { label: string; value: string[]; onChange: (value: string[]) => void; rows?: number }) {
  return <Field label={`${label} · one item per line`}><textarea rows={rows} value={value.join('\n')} onChange={(event) => onChange(event.target.value.split('\n'))} className="input min-h-28 resize-y" /></Field>;
}
function PreviewSection({ title, values }: { title: string; values: string[] }) {
  return <section><h4 className="text-sm font-bold">{title}</h4><ul className="mt-2 space-y-1.5 text-xs leading-5 text-slate-600">{values.filter(Boolean).map((value, index) => <li key={`${title}-${index}`} className="flex gap-2"><span className="text-emerald-600">✓</span>{value}</li>)}</ul></section>;
}
function Status({ status, version }: { status: string; version: number }) {
  const tone = status === 'Published' ? 'bg-emerald-50 text-emerald-700' : status === 'Review' ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-700';
  return <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${tone}`}>{status} · draft v{version}</span>;
}
