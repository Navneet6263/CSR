import { CheckCircle2, XCircle, Clock, Eye } from "lucide-react";

type Entry = {
  icon: React.ReactNode;
  actor: string;
  action: string;
  time: string;
};

const ENTRIES: Entry[] = [
  {
    icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2} />,
    actor: "Rohan",
    action: "verified Aadhar Card",
    time: "10:30 AM",
  },
  {
    icon: <XCircle className="h-3.5 w-3.5 text-rose-600" strokeWidth={2} />,
    actor: "Rohan",
    action: "rejected 10th Marksheet — image blurred",
    time: "10:18 AM",
  },
  {
    icon: <Eye className="h-3.5 w-3.5 text-slate-500" strokeWidth={2} />,
    actor: "Rohan",
    action: "opened Income Certificate",
    time: "10:12 AM",
  },
  {
    icon: <Clock className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />,
    actor: "System",
    action: "assigned application to Rohan",
    time: "09:55 AM",
  },
];

export default function CheckerLog() {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-widest text-slate-400">
          Checker's Action Log
        </div>
        <div className="text-[10px] uppercase tracking-widest text-slate-400">
          Today
        </div>
      </div>

      <ol className="relative space-y-4 border-l border-slate-100 pl-5">
        {ENTRIES.map((e, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-[26px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-slate-200 bg-white">
              {e.icon}
            </span>
            <div className="flex items-baseline justify-between gap-3">
              <div className="text-sm text-slate-700">
                <span className="font-medium text-slate-900">{e.actor}</span>{" "}
                {e.action}
              </div>
              <div className="shrink-0 text-xs text-slate-400">{e.time}</div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
