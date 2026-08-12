import { CheckCircle2, Hourglass, Inbox, IndianRupee, XCircle } from 'lucide-react';

type Metric = {
  label: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
};

const number = (value: unknown) => Number(value ?? 0);
const formatNum = (value: unknown) => number(value).toLocaleString('en-IN');
const formatCr = (value: unknown) => `₹${(number(value) / 10_000_000).toFixed(2)} Cr`;

export default function MetricsRow({ data }: { data?: any }) {
  const applied = number(data?.funnel?.applied);
  const approved = number(data?.funnel?.approved);
  const rejected = number(data?.funnel?.rejected);
  const metrics: Metric[] = [
    { label: 'Total Fund Disbursed', value: formatCr(data?.financials?.fundDisbursed),
      sub: `${formatNum(data?.operations?.paidStudents)} completed transfers`, icon: IndianRupee },
    { label: 'Fund in Pipeline', value: formatCr(data?.financials?.fundsInPipeline),
      sub: `${formatNum(data?.operations?.pipelineCases)} active cases`, icon: Hourglass },
    { label: 'Applications Received', value: formatNum(applied), sub: 'All recorded applications', icon: Inbox },
    { label: 'Approved', value: formatNum(approved),
      sub: `${applied ? Math.round((approved / applied) * 100) : 0}% conversion`, icon: CheckCircle2 },
    { label: 'Rejected', value: formatNum(rejected),
      sub: `${applied ? Math.round((rejected / applied) * 100) : 0}% of total`, icon: XCircle },
  ];

  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
    {metrics.map((metric) => <div key={metric.label}
      className="group rounded-xl border border-slate-200/80 bg-white p-4 transition hover:border-slate-300">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-md border border-slate-200/80 bg-slate-50">
          <metric.icon className="h-3.5 w-3.5 text-slate-600" />
        </span>
        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">{metric.label}</p>
      </div>
      <p className="mt-3 text-[22px] font-semibold tabular-nums tracking-tight text-slate-900">{metric.value}</p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="truncate text-[11.5px] text-slate-500">{metric.sub}</p>
        <span className="rounded-md bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">Live</span>
      </div>
    </div>)}
  </div>;
}
