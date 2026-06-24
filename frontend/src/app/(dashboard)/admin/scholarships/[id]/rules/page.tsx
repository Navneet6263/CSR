'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowLeft, ShieldCheck } from 'lucide-react';
import TopBar from '@/components/dashboard/TopBar';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { scholarshipApi } from '@/lib/api';
import type { EligibilityRule, Scholarship } from '@/types';

const ruleTypes = ['Income', 'Category', 'Gender', 'State', 'Course', 'Age'];
const operators = ['<=', '>=', '=', 'IN', 'BETWEEN', 'NOT_IN'];

export default function RulesPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [rules, setRules] = useState<EligibilityRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ruleType: '', operator: '', valueMin: '', valueMax: '', valueList: '', isRequired: true });

  useEffect(() => {
    Promise.allSettled([
      scholarshipApi.getById(id),
      scholarshipApi.getRules(id),
    ]).then(([sRes, rRes]) => {
      if (sRes.status === 'fulfilled') setScholarship(sRes.value.data);
      if (rRes.status === 'fulfilled') setRules(rRes.value.data || []);
      setLoading(false);
    });
  }, [id]);

  const handleAddRule = async () => {
    try {
      const res = await scholarshipApi.addRule(id, form);
      setRules((prev) => [...prev, res.data]);
      setShowForm(false);
      setForm({ ruleType: '', operator: '', valueMin: '', valueMax: '', valueList: '', isRequired: true });
    } catch { /* ignore */ }
  };

  const handleDelete = async (ruleId: number) => {
    try {
      await scholarshipApi.deleteRule(id, ruleId);
      setRules((prev) => prev.filter((r) => r.ruleId !== ruleId));
    } catch { /* ignore */ }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <TopBar title={`Eligibility Rules`} subtitle={scholarship?.name || ''} />

      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#5b2c6f] transition-colors"
      >
        <ArrowLeft size={16} /> Back to Scholarships
      </button>

      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-[#5b2c6f] to-[#2e86c1] clay-button hover:shadow-lg transition-all"
        >
          <Plus size={16} /> Add Rule
        </button>
      </div>

      {showForm && (
        <div className="clay-card p-6 space-y-4 animate-card-entrance">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#5b2c6f]" /> New Eligibility Rule
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">Rule Type</label>
              <select value={form.ruleType} onChange={(e) => setForm({ ...form, ruleType: e.target.value })}
                className="w-full px-4 py-3 bg-white/60 rounded-2xl text-sm text-slate-800 border border-white/60 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.04),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-[#5b2c6f]/20"
              >
                <option value="">Select...</option>
                {ruleTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">Operator</label>
              <select value={form.operator} onChange={(e) => setForm({ ...form, operator: e.target.value })}
                className="w-full px-4 py-3 bg-white/60 rounded-2xl text-sm text-slate-800 border border-white/60 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.04),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-[#5b2c6f]/20"
              >
                <option value="">Select...</option>
                {operators.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">Value(s)</label>
              <input value={form.valueList} onChange={(e) => setForm({ ...form, valueList: e.target.value })}
                placeholder="e.g., SC,ST or 300000"
                className="w-full px-4 py-3 bg-white/60 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 border border-white/60 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.04),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-[#5b2c6f]/20"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input type="checkbox" checked={form.isRequired}
                onChange={(e) => setForm({ ...form, isRequired: e.target.checked })}
                className="rounded accent-[#5b2c6f]"
              />
              Required Rule
            </label>
            <div className="flex-1" />
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-50 transition-colors"
            >Cancel</button>
            <button onClick={handleAddRule} disabled={!form.ruleType || !form.operator}
              className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#0e6251] to-[#148f77] hover:shadow-lg transition-all disabled:opacity-50"
            >Save Rule</button>
          </div>
        </div>
      )}

      <div className="clay-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Rule Type</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Operator</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Values</th>
              <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Required</th>
              <th className="text-right px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">
                  No rules configured yet. Add your first rule!
                </td>
              </tr>
            ) : (
              rules.map((r) => (
                <tr key={r.ruleId} className="border-b border-slate-50 hover:bg-white/40 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800">{r.ruleType}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">{r.operator}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {r.valueList || `${r.valueMin || '—'} – ${r.valueMax || '—'}`}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-xl ${r.isRequired ? 'bg-[#5b2c6f]/10 text-[#5b2c6f]' : 'bg-slate-100 text-slate-500'}`}>
                      {r.isRequired ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(r.ruleId)}
                      className="p-2 rounded-xl text-slate-400 hover:text-[#c0392b] hover:bg-[#c0392b]/5 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
