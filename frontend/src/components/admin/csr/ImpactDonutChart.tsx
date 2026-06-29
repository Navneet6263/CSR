import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { ImpactSlice } from "./ImpactDonut";

export default function ImpactDonutChart({ slices, total }: { slices: ImpactSlice[]; total: number }) {
  return (
    <div className="relative h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={slices} dataKey="value" nameKey="name" innerRadius={56} outerRadius={82} stroke="white" strokeWidth={2} paddingAngle={2}>
            {slices.map((s) => (
              <Cell key={s.name} fill={s.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "#0f172a", border: "none", borderRadius: 8, color: "white", fontSize: 11 }}
            formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Allocated"]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-widest text-slate-400">Total</div>
          <div className="text-base font-semibold text-slate-900 tabular-nums">₹{(total / 100000).toFixed(1)}L</div>
        </div>
      </div>
    </div>
  );
}
