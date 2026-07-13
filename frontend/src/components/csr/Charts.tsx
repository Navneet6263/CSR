"use client";
const cityData = [
  { city: "Mumbai", amount: 1250000, pct: 92 },
  { city: "Delhi", amount: 980000, pct: 74 },
  { city: "Bengaluru", amount: 870000, pct: 66 },
  { city: "Hyderabad", amount: 640000, pct: 50 },
  { city: "Jaipur", amount: 520000, pct: 40 },
  { city: "Kochi", amount: 410000, pct: 33 },
];

export function CityBarChart() {
  return (
    <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-base font-semibold tracking-tight text-slate-900">
          Funds Disbursed by City
        </h3>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
          FY 2025-26
        </span>
      </div>
      <p className="mb-5 text-xs text-slate-500">Top cities receiving scholarship disbursements</p>
      <div className="space-y-4">
        {cityData.map((c) => (
          <div key={c.city}>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">{c.city}</span>
              <span className="font-semibold text-slate-900">
                ₹{(c.amount / 100000).toFixed(1)}L
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-pink-50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
                style={{ width: `${c.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GenderPieChart() {
  const boys = 58;
  const girls = 42;
  return (
    <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
      <h3 className="text-base font-semibold tracking-tight text-slate-900">Gender Distribution</h3>
      <p className="mb-5 text-xs text-slate-500">Beneficiaries funded this cycle</p>
      <div className="flex items-center gap-6">
        <div
          className="relative h-40 w-40 shrink-0 rounded-full shadow-inner"
          style={{
            background: `conic-gradient(#059669 0 ${boys}%, #ec4899 ${boys}% 100%)`,
          }}
        >
          <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white">
            <div className="text-xs text-slate-500">Total</div>
            <div className="text-xl font-bold text-slate-900">248</div>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <Legend color="bg-emerald-600" label="Boys" value={`${boys}%`} count="144 students" />
          <Legend color="bg-pink-500" label="Girls" value={`${girls}%`} count="104 students" />
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label, value, count }: { color: string; label: string; value: string; count: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-pink-50/50 px-3 py-2">
      <div className="flex items-center gap-2.5">
        <div className={`h-3 w-3 rounded-sm ${color}`} />
        <div>
          <div className="text-sm font-semibold text-slate-800">{label}</div>
          <div className="text-[11px] text-slate-500">{count}</div>
        </div>
      </div>
      <div className="text-lg font-bold text-slate-900">{value}</div>
    </div>
  );
}
