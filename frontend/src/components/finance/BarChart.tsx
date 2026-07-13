"use client";
import { inr } from "@/lib/finance-mock";

export function BarChart({ data }: { data: { month: string; amount: number }[] }) {
  const max = Math.max(...data.map((d) => d.amount));
  return (
    <div className="flex h-56 items-end gap-2 sm:gap-4">
      {data.map((d) => {
        const h = Math.round((d.amount / max) * 100);
        return (
          <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
            <div className="text-[10px] font-bold text-navy-700 sm:text-xs">
              ₹{(d.amount / 100000).toFixed(1)}L
            </div>
            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-navy-900 to-navy-500 transition-all hover:from-success-700 hover:to-success-500"
                style={{ height: `${h}%` }}
                title={inr(d.amount)}
              />
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-navy-500 sm:text-xs">
              {d.month}
            </div>
          </div>
        );
      })}
    </div>
  );
}

