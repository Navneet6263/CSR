import { useEffect, useState } from "react";
import { Radio } from "lucide-react";

type Update = { id: number; text: string; time: string; tone: "ok" | "warn" | "info" };

const SEED: Update[] = [
  { id: 1, text: "Rohan approved App #1042", time: "just now", tone: "ok" },
  { id: 2, text: "BG check flagged App #1031", time: "2m ago", tone: "warn" },
  { id: 3, text: "Priya screened 4 applications", time: "6m ago", tone: "info" },
  { id: 4, text: "CSR partner Tata funded ₹2.4L", time: "12m ago", tone: "ok" },
];

const POOL: Omit<Update, "id" | "time">[] = [
  { text: "Aman cleared docs for App #1078", tone: "ok" },
  { text: "App #1101 placed on HOLD", tone: "warn" },
  { text: "New application from Maharashtra", tone: "info" },
  { text: "Infosys CSR approved 12 cases", tone: "ok" },
  { text: "Meera rejected App #1066", tone: "warn" },
  { text: "App #1120 submitted from Delhi", tone: "info" },
];

const dot: Record<Update["tone"], string> = {
  ok: "bg-emerald-500",
  warn: "bg-amber-500",
  info: "bg-slate-400",
};

export default function LiveUpdates() {
  const [items, setItems] = useState<Update[]>(SEED);

  useEffect(() => {
    const i = setInterval(() => {
      const pick = POOL[Math.floor(Math.random() * POOL.length)];
      setItems((prev) => [{ id: Date.now(), time: "just now", ...pick }, ...prev].slice(0, 6));
    }, 5000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="px-3 pt-3 pb-3">
      <div className="flex items-center gap-2 px-2.5 pb-1.5">
        <Radio className="h-[14px] w-[14px] text-slate-500" />
        <p className="text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
          Live Updates
        </p>
        <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
      </div>
      <ul className="space-y-0.5">
        {items.map((u) => (
          <li
            key={u.id}
            className="group flex items-center gap-3 rounded-lg px-2.5 py-1.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-default"
          >
            <span className={"h-1.5 w-1.5 shrink-0 rounded-full " + dot[u.tone]} />
            <span className="min-w-0 flex-1 truncate text-[12.5px] leading-tight">{u.text}</span>
            <span className="text-[10px] text-slate-400 shrink-0">{u.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
