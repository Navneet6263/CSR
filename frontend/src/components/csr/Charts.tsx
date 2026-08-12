'use client';

interface Distribution { label: string; count: number; amount?: number }

export function CityBarChart({ data }: { data: Distribution[] }) {
  const max = Math.max(1, ...data.map((item) => item.amount ?? 0));
  return <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
    <h3 className="text-base font-semibold text-slate-900">Funds Approved by State</h3>
    <p className="mb-5 text-xs text-slate-500">Sponsor-scoped scholarship beneficiaries</p>
    <div className="space-y-4">{data.map((item) => <div key={item.label}><div className="mb-1.5 flex justify-between text-xs"><span>{item.label}</span>
      <span className="font-semibold">₹{Number(item.amount ?? 0).toLocaleString('en-IN')}</span></div>
      <div className="h-2.5 overflow-hidden rounded-full bg-pink-50"><div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600" style={{ width: `${((item.amount ?? 0) / max) * 100}%` }} /></div>
    </div>)}{!data.length && <p className="py-10 text-center text-sm text-slate-400">No funded beneficiaries yet.</p>}</div>
  </div>;
}

export function GenderPieChart({ data }: { data: Distribution[] }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const colors = ['bg-emerald-600', 'bg-pink-500', 'bg-amber-500', 'bg-slate-500'];
  return <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm"><h3 className="text-base font-semibold text-slate-900">Gender Distribution</h3>
    <p className="mb-5 text-xs text-slate-500">Approved beneficiaries</p><div className="space-y-3">
      <div className="text-center text-3xl font-bold">{total}<p className="text-xs font-normal text-slate-500">total beneficiaries</p></div>
      {data.map((item, index) => <div key={item.label} className="flex items-center justify-between rounded-xl bg-pink-50/50 px-3 py-2">
        <div className="flex items-center gap-2"><span className={`h-3 w-3 rounded-sm ${colors[index % colors.length]}`} /><span className="text-sm font-semibold">{item.label}</span></div>
        <span className="font-bold">{item.count} · {total ? Math.round(item.count / total * 100) : 0}%</span></div>)}
      {!data.length && <p className="py-8 text-center text-sm text-slate-400">No distribution data yet.</p>}
    </div></div>;
}
