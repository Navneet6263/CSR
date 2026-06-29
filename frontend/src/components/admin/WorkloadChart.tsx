import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard, { ChartTooltip } from "./ChartCard";

// Dynamic data will be built inside the component

const colors = ["#0f172a", "#334155", "#64748b", "#94a3b8"];

export default function WorkloadChart({ data: apiData }: { data?: any }) {
  const data = [
    { role: "Doc Check", pending: apiData?.docCheckers || 184 },
    { role: "BG Check", pending: apiData?.bgCheckers || 156 },
    { role: "Screening", pending: apiData?.screeners || 92 },
    { role: "CSR", pending: apiData?.csrPartners || 48 },
  ];
  
  const total = data.reduce((s, d) => s + d.pending, 0);
  return (
    <ChartCard
      title="Role Workload"
      subtitle={`${total.toLocaleString()} applications currently pending across roles`}
    >
      <div className="h-[240px] w-full">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 6 }} barCategoryGap={28}>
            <CartesianGrid stroke="#eef2f7" vertical={false} />
            <XAxis dataKey="role" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={36} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f8fafc" }} />
            <Bar dataKey="pending" name="Pending" radius={[8, 8, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
