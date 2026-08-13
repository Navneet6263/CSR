'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  AlertTriangle, ArrowLeft, Check, ChevronRight, CircleHelp, Edit3, FilePenLine,
  ListChecks, Loader2, Plus, Save, ShieldCheck, Trash2, X,
} from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { scholarshipApi } from '@/lib/api';
import type { EligibilityRule, Scholarship } from '@/types';

const fieldOptions = [
  { value: 'Income', label: 'Annual family income', kind: 'number', example: '300000' },
  { value: 'Age', label: 'Applicant age', kind: 'number', example: '18' },
  { value: 'Marks', label: 'Previous-year marks (%)', kind: 'number', example: '75' },
  { value: 'FamilySize', label: 'Family size', kind: 'number', example: '5' },
  { value: 'Enrollment', label: 'Enrollment year', kind: 'number', example: '2026' },
  { value: 'Gender', label: 'Gender', kind: 'text', example: 'Female' },
  { value: 'Category', label: 'Caste / category', kind: 'text', example: 'SC, ST, OBC' },
  { value: 'State', label: 'State / zone', kind: 'text', example: 'Maharashtra, Karnataka' },
  { value: 'Course', label: 'Course enrolled', kind: 'text', example: 'B.Tech, B.E.' },
] as const;

const numericOperators = [
  { value: 'LTE', label: 'At most (≤)' }, { value: 'LT', label: 'Less than (<)' },
  { value: 'GTE', label: 'At least (≥)' }, { value: 'GT', label: 'Greater than (>)' },
  { value: 'EQ', label: 'Exactly (=)' }, { value: 'NEQ', label: 'Not equal (≠)' },
  { value: 'BETWEEN', label: 'Between (inclusive)' },
];
const textOperators = [
  { value: 'EQ', label: 'Exactly matches' }, { value: 'NEQ', label: 'Does not match' },
  { value: 'IN', label: 'Must be one of' }, { value: 'NOT_IN', label: 'Must not be one of' },
];
const operatorWords: Record<string, string> = {
  LTE: 'is at most', LT: 'is less than', GTE: 'is at least', GT: 'is greater than',
  EQ: 'equals', NEQ: 'does not equal', IN: 'is one of', NOT_IN: 'is not one of', BETWEEN: 'is between',
};

type RuleForm = {
  ruleType: string; operator: string; valueMin: string; valueMax: string;
  listValue: string; isRequired: boolean;
};
const emptyForm: RuleForm = {
  ruleType: 'Income', operator: 'LTE', valueMin: '', valueMax: '', listValue: '', isRequired: true,
};

export default function RulesPage() {
  const id = Number(useParams<{ id: string }>().id);
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [rules, setRules] = useState<EligibilityRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<RuleForm>(emptyForm);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    try {
      const [scholarshipResponse, rulesResponse] = await Promise.all([
        scholarshipApi.getById(id), scholarshipApi.getRules(id),
      ]);
      setScholarship(scholarshipResponse.data);
      setRules(rulesResponse.data ?? []);
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Eligibility rules could not be loaded.');
    } finally { setLoading(false); }
  }, [id]);
  useEffect(() => { void load(); }, [load]);

  const field = fieldOptions.find((item) => item.value === form.ruleType) ?? fieldOptions[0];
  const operators = field.kind === 'number' ? numericOperators : textOperators;
  const requiredCount = useMemo(() => rules.filter((rule) => rule.isRequired).length, [rules]);

  function startAdd() {
    setEditingId(null); setForm(emptyForm); setEditorOpen(true); setDeleteId(null); setError(''); setNotice('');
  }
  function startEdit(rule: EligibilityRule) {
    setEditingId(rule.ruleId);
    setForm({
      ruleType: rule.ruleType, operator: rule.operator,
      valueMin: rule.valueMin ?? '', valueMax: rule.valueMax ?? '',
      listValue: parseList(rule.valueList).join(', '), isRequired: rule.isRequired,
    });
    setEditorOpen(true); setDeleteId(null); setError(''); setNotice('');
  }
  function closeEditor() { setEditorOpen(false); setEditingId(null); setForm(emptyForm); }
  function changeType(ruleType: string) {
    const next = fieldOptions.find((item) => item.value === ruleType) ?? fieldOptions[0];
    setForm({ ...emptyForm, ruleType, operator: next.kind === 'number' ? 'LTE' : 'EQ', isRequired: form.isRequired });
  }

  async function saveRule() {
    const validation = validate(form, field.kind);
    if (validation) { setError(validation); return; }
    setBusy(true); setError(''); setNotice('');
    try {
      const payload = payloadFor(form);
      if (editingId) {
        const response = await scholarshipApi.updateRule(id, editingId, payload);
        setRules((current) => current.map((rule) => rule.ruleId === editingId ? response.data : rule));
        setNotice('Rule updated. Review the scholarship content summary before publishing again.');
      } else {
        const response = await scholarshipApi.addRule(id, payload);
        setRules((current) => [...current, response.data]);
        setNotice('Rule added. All required rules are evaluated together.');
      }
      closeEditor();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Rule could not be saved.');
    } finally { setBusy(false); }
  }

  async function removeRule(ruleId: number) {
    setBusy(true); setError(''); setNotice('');
    try {
      await scholarshipApi.deleteRule(id, ruleId);
      setRules((current) => current.filter((rule) => rule.ruleId !== ruleId));
      setDeleteId(null);
      setNotice('Rule removed. Review the scholarship content summary before publishing again.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Rule could not be deleted.');
    } finally { setBusy(false); }
  }

  if (loading) return <div className="grid min-h-[60vh] place-items-center"><LoadingSpinner size="lg" /></div>;

  return <div className="mx-auto max-w-7xl space-y-6 pb-16">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <Link href={`/admin/scholarships/${id}`} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"><ArrowLeft className="h-3.5 w-3.5" />Back to scholarship</Link>
        <div className="mt-2 flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white"><ShieldCheck className="h-5 w-5" /></div><div><h1 className="text-2xl font-semibold text-slate-950">Eligibility Rules</h1><p className="text-sm text-slate-500">{scholarship?.name || 'Scholarship policy configuration'}</p></div></div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href={`/admin/scholarships/${id}/content`} className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"><FilePenLine className="h-4 w-4" />Content review</Link>
        <button onClick={startAdd} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"><Plus className="h-4 w-4" />Add eligibility rule</button>
      </div>
    </header>

    {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
    {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}

    <section className="grid gap-3 sm:grid-cols-3">
      <Metric label="Configured rules" value={rules.length} note="Total policy checks" />
      <Metric label="Required rules" value={requiredCount} note="Must pass to qualify" />
      <Metric label="Advisory rules" value={rules.length - requiredCount} note="Recorded but do not block" />
    </section>

    <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-950">
      <div className="flex gap-3"><CircleHelp className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" /><div><h2 className="text-sm font-semibold">How eligibility works</h2><p className="mt-1 text-xs leading-5 text-blue-900/80">Every required rule is joined with <b>AND</b>. For example, Gender = Female AND Age between 18–25 means only applicants satisfying both checks can apply. Once a non-draft application exists, policy rules are frozen for audit safety.</p></div></div>
    </section>

    {editorOpen && <RuleEditor
      form={form} fieldKind={field.kind} fieldExample={field.example} operators={operators}
      editing={Boolean(editingId)} busy={busy} onForm={setForm} onType={changeType}
      onCancel={closeEditor} onSave={() => void saveRule()}
    />}

    <section className="overflow-hidden rounded-2xl border bg-white">
      <div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-semibold text-slate-900">Executable policy</h2><p className="text-xs text-slate-500">Rules are evaluated against the student's verified profile.</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">All required rules = AND</span></div>
      {rules.length ? <ol className="divide-y">{rules.map((rule, index) => <RuleCard
        key={rule.ruleId || `${rule.ruleType}-${index}`} rule={rule} index={index}
        confirmingDelete={deleteId === rule.ruleId} busy={busy}
        onEdit={() => startEdit(rule)} onAskDelete={() => setDeleteId(rule.ruleId)}
        onCancelDelete={() => setDeleteId(null)} onDelete={() => void removeRule(rule.ruleId)}
      />)}</ol> : <div className="grid place-items-center px-5 py-16 text-center"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100"><ListChecks className="h-6 w-6 text-slate-400" /></div><h3 className="mt-3 font-semibold text-slate-800">No eligibility rules yet</h3><p className="mt-1 max-w-sm text-sm text-slate-500">Add at least one required rule before the scholarship content can be approved and published.</p><button onClick={startAdd} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"><Plus className="h-4 w-4" />Add first rule</button></div>}
    </section>

    {rules.length > 0 && <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border bg-slate-50 p-4 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold text-slate-900">Rules ready?</p><p className="text-xs text-slate-500">Regenerate or manually update the eligibility summary in Content Builder, then approve the final student-facing version.</p></div><Link href={`/admin/scholarships/${id}/content`} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white">Continue to content review <ChevronRight className="h-4 w-4" /></Link></div>}
  </div>;
}

function RuleEditor({ form, fieldKind, fieldExample, operators, editing, busy, onForm, onType, onCancel, onSave }: {
  form: RuleForm; fieldKind: string; fieldExample: string; operators: Array<{ value: string; label: string }>;
  editing: boolean; busy: boolean; onForm: (form: RuleForm) => void; onType: (value: string) => void;
  onCancel: () => void; onSave: () => void;
}) {
  return <section className="rounded-2xl border border-slate-300 bg-white shadow-lg shadow-slate-200/60">
    <div className="flex items-center justify-between border-b px-5 py-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">Policy editor</p><h2 className="mt-0.5 font-semibold text-slate-950">{editing ? 'Edit eligibility rule' : 'Create eligibility rule'}</h2></div><button onClick={onCancel} aria-label="Close editor" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></div>
    <div className="grid gap-4 p-5 lg:grid-cols-12">
      <SelectField label="Profile field" value={form.ruleType} onChange={onType} className="lg:col-span-4" options={fieldOptions.map((item) => ({ value: item.value, label: item.label }))} />
      <SelectField label="Comparison" value={form.operator} onChange={(operator) => onForm({ ...form, operator, valueMin: '', valueMax: '', listValue: '' })} className="lg:col-span-4" options={operators} />
      <div className="lg:col-span-4"><ValueEditor form={form} kind={fieldKind} example={fieldExample} onChange={onForm} /></div>
    </div>
    <div className="flex flex-col gap-3 border-t bg-slate-50 px-5 py-4 sm:flex-row sm:items-center">
      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={form.isRequired} onChange={(event) => onForm({ ...form, isRequired: event.target.checked })} className="h-4 w-4 rounded accent-slate-950" />Required rule</label>
      <p className="text-xs text-slate-500 sm:ml-2">{form.isRequired ? 'A failed check makes the student ineligible.' : 'A failed check is advisory and will not block the student.'}</p>
      <div className="flex gap-2 sm:ml-auto"><button onClick={onCancel} className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold text-slate-600">Cancel</button><button onClick={onSave} disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{editing ? 'Save changes' : 'Add rule'}</button></div>
    </div>
  </section>;
}

function ValueEditor({ form, kind, example, onChange }: { form: RuleForm; kind: string; example: string; onChange: (form: RuleForm) => void }) {
  const label = form.operator === 'BETWEEN' ? 'Allowed range' : ['IN', 'NOT_IN'].includes(form.operator) ? 'Allowed values' : 'Comparison value';
  if (form.operator === 'BETWEEN') return <div><Label>{label}</Label><div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2"><input type="number" value={form.valueMin} onChange={(event) => onChange({ ...form, valueMin: event.target.value })} placeholder="Minimum" className="input h-11" /><span className="text-xs font-medium text-slate-400">to</span><input type="number" value={form.valueMax} onChange={(event) => onChange({ ...form, valueMax: event.target.value })} placeholder="Maximum" className="input h-11" /></div></div>;
  if (['IN', 'NOT_IN'].includes(form.operator)) return <div><Label>{label}</Label><input value={form.listValue} onChange={(event) => onChange({ ...form, listValue: event.target.value })} placeholder={example} className="input h-11" /><p className="mt-1 text-[10px] text-slate-400">Separate multiple choices with commas.</p></div>;
  if (form.ruleType === 'Gender') return <SelectField label={label} value={form.valueMin} onChange={(value) => onChange({ ...form, valueMin: value })} options={['Female', 'Male', 'Other'].map((value) => ({ value, label: value }))} />;
  if (form.ruleType === 'Category') return <SelectField label={label} value={form.valueMin} onChange={(value) => onChange({ ...form, valueMin: value })} options={['General', 'OBC', 'SC', 'ST'].map((value) => ({ value, label: value }))} />;
  return <div><Label>{label}</Label><input type={kind === 'number' ? 'number' : 'text'} value={form.valueMin} onChange={(event) => onChange({ ...form, valueMin: event.target.value })} placeholder={`Example: ${example}`} className="input h-11" /></div>;
}

function RuleCard({ rule, index, confirmingDelete, busy, onEdit, onAskDelete, onCancelDelete, onDelete }: {
  rule: EligibilityRule; index: number; confirmingDelete: boolean; busy: boolean;
  onEdit: () => void; onAskDelete: () => void; onCancelDelete: () => void; onDelete: () => void;
}) {
  return <li className="p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-start"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-950 font-mono text-xs font-bold text-white">{String(index + 1).padStart(2, '0')}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-950">{fieldLabel(rule.ruleType)}</h3><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${rule.isRequired ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'}`}>{rule.isRequired ? 'REQUIRED' : 'ADVISORY'}</span>{index > 0 && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">AND</span>}</div><p className="mt-1 text-sm text-slate-600">{criteria(rule)}</p><div className="mt-2 flex flex-wrap gap-2 text-[10px] font-medium text-slate-400"><span className="rounded bg-slate-50 px-2 py-1">Field: {rule.ruleType}</span><span className="rounded bg-slate-50 px-2 py-1">Operator: {rule.operator}</span></div></div><div className="flex shrink-0 gap-2"><button onClick={onEdit} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"><Edit3 className="h-3.5 w-3.5" />Edit</button><button onClick={onAskDelete} className="rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50" aria-label="Delete rule"><Trash2 className="h-3.5 w-3.5" /></button></div></div>{confirmingDelete && <div className="mt-4 flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 sm:flex-row sm:items-center"><AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" /><p className="flex-1 text-xs text-rose-800">Remove this eligibility check? This action is audited.</p><div className="flex gap-2"><button onClick={onCancelDelete} className="rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold">Keep rule</button><button onClick={onDelete} disabled={busy} className="inline-flex items-center gap-1 rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"><Check className="h-3 w-3" />Remove</button></div></div>}</li>;
}

function SelectField({ label, value, onChange, options, className = '' }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }>; className?: string }) {
  return <label className={`block ${className}`}><Label>{label}</Label><select value={value} onChange={(event) => onChange(event.target.value)} className="input h-11">{!value && <option value="">Select…</option>}{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}
function Label({ children }: { children: React.ReactNode }) { return <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500">{children}</span>; }
function Metric({ label, value, note }: { label: string; value: number; note: string }) { return <div className="rounded-2xl border bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-500">{note}</p></div>; }

function parseList(value?: string): string[] {
  if (!value) return [];
  try { const parsed = JSON.parse(value); if (Array.isArray(parsed)) return parsed.map(String); } catch { /* legacy CSV */ }
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}
function payloadFor(form: RuleForm): Partial<EligibilityRule> {
  const list = ['IN', 'NOT_IN'].includes(form.operator);
  return {
    ruleType: form.ruleType, operator: form.operator,
    valueMin: list ? undefined : form.valueMin.trim(),
    valueMax: form.operator === 'BETWEEN' ? form.valueMax.trim() : undefined,
    valueList: list ? JSON.stringify(form.listValue.split(',').map((item) => item.trim()).filter(Boolean)) : undefined,
    isRequired: form.isRequired,
  };
}
function validate(form: RuleForm, kind: string): string {
  if (!form.ruleType || !form.operator) return 'Select a profile field and comparison.';
  if (['IN', 'NOT_IN'].includes(form.operator) && !form.listValue.split(',').some((item) => item.trim())) return 'Enter at least one list value.';
  if (form.operator === 'BETWEEN' && (!form.valueMin || !form.valueMax)) return 'Enter both minimum and maximum values.';
  if (!['IN', 'NOT_IN', 'BETWEEN'].includes(form.operator) && !form.valueMin.trim()) return 'Enter the comparison value.';
  if (kind === 'number') {
    if (form.valueMin && !Number.isFinite(Number(form.valueMin))) return 'Enter a valid numeric value.';
    if (form.valueMax && !Number.isFinite(Number(form.valueMax))) return 'Enter a valid maximum value.';
    if (form.operator === 'BETWEEN' && Number(form.valueMin) > Number(form.valueMax)) return 'Minimum cannot be greater than maximum.';
  }
  return '';
}
function fieldLabel(type: string): string { return fieldOptions.find((field) => field.value === type)?.label ?? type; }
function criteria(rule: EligibilityRule): string {
  const values = ['IN', 'NOT_IN'].includes(rule.operator) ? parseList(rule.valueList).join(', ')
    : rule.operator === 'BETWEEN' ? `${displayValue(rule, rule.valueMin)} and ${displayValue(rule, rule.valueMax)}`
      : displayValue(rule, rule.valueMin);
  return `${fieldLabel(rule.ruleType)} ${operatorWords[rule.operator] ?? rule.operator} ${values}.`;
}
function displayValue(rule: EligibilityRule, value?: string): string {
  if (!value) return '—';
  if (rule.ruleType === 'Income' && Number.isFinite(Number(value))) return `₹${Number(value).toLocaleString('en-IN')}`;
  if (rule.ruleType === 'Marks') return `${value}%`;
  return value;
}
