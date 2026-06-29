import ChartCard from "./ChartCard";
import { mockZones } from "@/lib/mockData";

// Fallback zones will be defined in the component

export default function ZoneDistribution({ data }: { data?: any }) {
  const zones = data?.zones || mockZones;
  
  const max = Math.max(...zones.map((z: any) => z.count));
  return (
    <ChartCard title="Zone Distribution" subtitle="Top states by applicant volume">
      <ul className="px-3 pt-1 pb-2 space-y-3">
        {zones.map((z) => {
          const pct = (z.count / max) * 100;
          return (
            <li key={z.state}>
              <div className="flex items-center justify-between text-[12.5px]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-slate-800 font-medium truncate">{z.state}</span>
                  <span className="text-[10px] text-slate-400 border border-slate-200 rounded px-1 py-px">
                    {z.zone}
                  </span>
                </div>
                <span className="tabular-nums text-slate-600">{z.count.toLocaleString()}</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-slate-800 to-slate-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </ChartCard>
  );
}
