import { ArrowUpRight, ArrowDownRight, IndianRupee, Hourglass, Inbox, CheckCircle2, XCircle } from "lucide-react";

type Metric = {
  label: string;
  value: string;
  sub: string;
  delta: string;
  trend: "up" | "down";
  icon: React.ComponentType<{ className?: string }>;
};

export default function MetricsRow({ data }: { data?: any }) {
  const formatCr = (val: number) => `₹${(val / 10000000).toFixed(2)} Cr`;
  const formatNum = (val: number) => val?.toLocaleString('en-IN') || '0';

  const metrics: Metric[] = [
    { 
      label: "Total Fund Disbursed", 
      value: data?.financials?.fundDisbursed ? formatCr(data.financials.fundDisbursed) : "₹4.82 Cr", 
      sub: "1,284 students paid", 
      delta: "+12.4%", trend: "up", icon: IndianRupee 
    },
    { 
      label: "Fund in Pipeline", 
      value: data?.financials?.fundsInPipeline ? formatCr(data.financials.fundsInPipeline) : "₹1.16 Cr", 
      sub: "318 active cases", 
      delta: "+3.1%", trend: "up", icon: Hourglass 
    },
    { 
      label: "Applications Received", 
      value: data?.funnel?.applied ? formatNum(data.funnel.applied) : "12,480", 
      sub: "this cycle", 
      delta: "+8.7%", trend: "up", icon: Inbox 
    },
    { 
      label: "Approved", 
      value: data?.funnel?.approved ? formatNum(data.funnel.approved) : "6,932", 
      sub: "55.5% conversion", 
      delta: "+2.3%", trend: "up", icon: CheckCircle2 
    },
    { 
      label: "Rejected", 
      value: "2,118", 
      sub: "16.9% of total", 
      delta: "-1.4%", trend: "down", icon: XCircle 
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {metrics.map((m) => {
        const Icon = m.icon;
        const up = m.trend === "up";
        return (
          <div
            key={m.label}
            className="group rounded-xl border border-slate-200/80 bg-white p-4 hover:border-slate-300 transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-7 w-7 place-items-center rounded-md bg-slate-50 border border-slate-200/80">
                  <Icon className="h-3.5 w-3.5 text-slate-600" />
                </div>
                <p className="text-[10.5px] font-semibold tracking-wider text-slate-500 uppercase">
                  {m.label}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <p className="text-[22px] font-semibold tracking-tight text-slate-900 tabular-nums">
                {m.value}
              </p>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <p className="text-[11.5px] text-slate-500">{m.sub}</p>
              <span
                className={
                  "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10.5px] font-medium " +
                  (up ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")
                }
              >
                {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {m.delta}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
