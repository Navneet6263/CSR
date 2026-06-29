import { Wallet, Users, IndianRupee } from "lucide-react";
import { Input } from "@/components/ui/input";

type Props = {
  totalBudget: number;
  perStudent: number;
  onChange: (patch: { totalBudget?: number; perStudent?: number }) => void;
};

function formatINR(n: number) {
  if (!Number.isFinite(n)) return "₹ 0";
  return "₹ " + n.toLocaleString("en-IN");
}

function MoneyInput({
  value,
  onChange,
  placeholder,
}: {
  value: number;
  onChange: (n: number) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <IndianRupee className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <Input
        type="number"
        min={0}
        className="pl-9 tabular-nums"
        placeholder={placeholder}
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </div>
  );
}

export default function FundAllocationCard({ totalBudget, perStudent, onChange }: Props) {
  const maxStudents = perStudent > 0 ? Math.floor(totalBudget / perStudent) : 0;
  const allocated = maxStudents * perStudent;
  const utilisation = totalBudget > 0 ? Math.min(100, (allocated / totalBudget) * 100) : 0;
  const remainder = totalBudget - allocated;

  // ring math
  const r = 52;
  const c = 2 * Math.PI * r;
  const dash = (utilisation / 100) * c;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-900 text-white">
          <Wallet className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900">Fund Allocation & Capacity</h3>
          <p className="text-[11px] text-slate-500 truncate">Auto-calculates eligible seats</p>
        </div>
      </div>

      <div className="space-y-4 pt-5">
        <label className="block space-y-1.5">
          <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-500">
            Total Fund Budget
          </span>
          <MoneyInput
            value={totalBudget}
            onChange={(n) => onChange({ totalBudget: n })}
            placeholder="50,00,000"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-500">
            Amount Per Student
          </span>
          <MoneyInput
            value={perStudent}
            onChange={(n) => onChange({ perStudent: n })}
            placeholder="50,000"
          />
        </label>

        <div className="mt-2 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
          <div className="flex items-center gap-4">
            <div className="relative h-[120px] w-[120px] shrink-0">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r={r}
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${dash} ${c}`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Capacity</p>
                  <p className="text-xl font-semibold tabular-nums text-slate-900">{maxStudents}</p>
                </div>
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
                <Users className="h-4 w-4 text-slate-500" />
                <span className="tabular-nums">Maximum {maxStudents} Students</span>
              </div>
              <div className="space-y-1 text-[12px]">
                <Row label="Budget" value={formatINR(totalBudget)} />
                <Row label="Allocated" value={formatINR(allocated)} />
                <Row
                  label="Unused"
                  value={formatINR(remainder)}
                  tone={remainder > 0 ? "warn" : "ok"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "ok" | "warn" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span
        className={
          "tabular-nums font-medium " +
          (tone === "warn" ? "text-amber-700" : "text-slate-900")
        }
      >
        {value}
      </span>
    </div>
  );
}
