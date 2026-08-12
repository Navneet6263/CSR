'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import CoreDetailsCard from '@/components/admin/scholarship/CoreDetailsCard';
import FundAllocationCard from '@/components/admin/scholarship/FundAllocationCard';
import RuleBuilder from '@/components/admin/scholarship/RuleBuilder';
import ActionBar from '@/components/admin/scholarship/ActionBar';
import type { Rule } from '@/components/admin/scholarship/RuleRow';
import { adminApi, scholarshipApi } from '@/lib/api';

const ruleTypes: Record<Rule['field'], string> = {
  category: 'Category', income: 'Income', marks: 'Marks', course: 'Course',
  state: 'State', gender: 'Gender', age: 'Age',
};
const operators: Record<Rule['operator'], string> = {
  eq: 'EQ', neq: 'NEQ', lt: 'LT', lte: 'LTE', gt: 'GT', gte: 'GTE', in: 'IN', notin: 'NOT_IN',
};

function apiRule(rule: Rule) {
  const list = ['in', 'notin'].includes(rule.operator);
  return { ruleType: ruleTypes[rule.field], operator: operators[rule.operator],
    valueMin: list ? undefined : rule.value.trim(),
    valueList: list ? JSON.stringify(rule.value.split(',').map((item) => item.trim()).filter(Boolean)) : undefined,
    isRequired: true };
}

export default function NewScholarshipPage() {
  const router = useRouter();
  const [core, setCore] = useState({ name: '', description: '', sponsorId: '', openDate: '', closeDate: '' });
  const [totalBudget, setTotalBudget] = useState(0); const [perStudent, setPerStudent] = useState(0);
  const [rules, setRules] = useState<Rule[]>([]); const [sponsors, setSponsors] = useState<Array<{ sponsorId: number; name: string }>>([]);
  const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  useEffect(() => { adminApi.getSponsors().then((response) => setSponsors((response.data ?? []).map((row) => ({ sponsorId: Number(row.SponsorID), name: String(row.SponsorName) })))).catch((reason: Error) => setError(reason.message)); }, []);
  const capacity = useMemo(() => perStudent > 0 ? Math.floor(totalBudget / perStudent) : 0, [totalBudget, perStudent]);
  const baseValid = Boolean(core.name.trim() && core.sponsorId && core.openDate && core.closeDate && capacity > 0);

  async function save(status: 'Active' | 'Inactive') {
    if (!baseValid || (status === 'Active' && (!rules.length || rules.some((rule) => !rule.value.trim())))) {
      setError('Complete program details and every eligibility rule before launch.'); return;
    }
    setSaving(true); setError('');
    try {
      const response = await scholarshipApi.create({ name: core.name.trim(), description: core.description.trim() || undefined,
        sponsorId: Number(core.sponsorId), totalBudget, perStudentAmount: perStudent,
        applicationOpenDate: core.openDate, applicationCloseDate: core.closeDate,
        maxApplicants: capacity, status, rules: rules.filter((rule) => rule.value.trim()).map(apiRule) });
      const id = Number(response.data.ScholarshipID ?? response.data.scholarshipId);
      router.push(`/admin/scholarships/${id}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Scholarship could not be saved.'); }
    finally { setSaving(false); }
  }

  return <div className="mx-auto max-w-7xl space-y-6 pb-24">
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4"><div><Link href="/admin/scholarships" className="inline-flex items-center gap-1.5 text-xs text-slate-500"><ArrowLeft className="h-3.5 w-3.5" />Back to Scholarships</Link><h1 className="mt-1 text-2xl font-semibold">Create New Scholarship</h1><p className="text-[13px] text-slate-500">Define funding and executable eligibility rules.</p></div><GraduationCap className="h-6 w-6 text-slate-500" /></header>
    {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2"><CoreDetailsCard value={core} sponsors={sponsors} onChange={(patch) => setCore((value) => ({ ...value, ...patch }))} /><FundAllocationCard totalBudget={totalBudget} perStudent={perStudent} onChange={(patch) => { if (patch.totalBudget !== undefined) setTotalBudget(patch.totalBudget); if (patch.perStudent !== undefined) setPerStudent(patch.perStudent); }} /></div>
    <RuleBuilder rules={rules} onChange={setRules} />
    <ActionBar capacity={capacity} rulesCount={rules.length} canLaunch={baseValid && rules.length > 0 && !saving} onDraft={() => void save('Inactive')} onLaunch={() => void save('Active')} />
  </div>;
}
