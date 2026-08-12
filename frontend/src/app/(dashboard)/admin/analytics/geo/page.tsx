'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import IndiaHeatmap, { type RegionDatum } from '@/components/admin/analytics/IndiaHeatmap';
import CityBreakdown, { type CityRow } from '@/components/admin/analytics/CityBreakdown';
import GeoMap from '@/components/admin/analytics/GeoMap';
import { adminApi } from '@/lib/api';

type StateRow = { code: string; name: string; applicants: number; approved: number };

export default function GeoPage() {
  const [states, setStates] = useState<StateRow[]>([]); const [cities, setCities] = useState<CityRow[]>([]);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { adminApi.getGeoAnalytics().then((res) => {
    setStates((res.data?.states ?? []) as StateRow[]); setCities((res.data?.cities ?? []) as CityRow[]);
  }).catch((err) => setError(err.message)).finally(() => setLoading(false)); }, []);
  const total = states.reduce((sum, row) => sum + row.applicants, 0);
  const approved = states.reduce((sum, row) => sum + row.approved, 0);
  const regions = useMemo<RegionDatum[]>(() => states.filter((row) => row.code).map((row) => ({ ...row,
    pct: total ? Number(((row.applicants / total) * 100).toFixed(1)) : 0 })), [states, total]);
  if (loading) return <div className="grid h-64 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-slate-400"/></div>;
  return <div className="space-y-5">
    <div><div className="text-[10px] uppercase tracking-widest text-slate-400">Analytics</div>
      <h1 className="mt-1 text-xl font-semibold text-slate-900">Geographic Distribution</h1>
      <p className="mt-0.5 text-sm text-slate-500">Live state and city applicant volume and conversion.</p></div>
    {error && <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{[
      ['Unique Applicants', total.toLocaleString()], ['Approved', approved.toLocaleString()],
      ['Conversion', `${total ? Math.round((approved / total) * 100) : 0}%`], ['States Covered', String(states.length)],
    ].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-200/80 bg-white p-4"><div className="text-[10px] uppercase tracking-widest text-slate-400">{label}</div><div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div></div>)}</div>
    {states.length ? <><div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]"><IndiaHeatmap regions={regions}/><CityBreakdown rows={cities}/></div>
      <GeoMap rows={states.slice(0, 10).map((row) => ({ state: row.name, applicants: row.applicants, approved: row.approved }))}/></> :
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">No geographic application data is available yet.</div>}
  </div>;
}
