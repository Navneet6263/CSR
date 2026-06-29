import SLAPill from "@/components/admin/SLAPill";
import { getSLALevel, SLA_STYLES } from "@/lib/sla";

export type PaymentRow = {
  id: string;
  student: string;
  scholarship: string;
  amount: number;
  bank: string;
  approvedSince: string; // duration
  status: "ready" | "hold" | "processing";
};

const STATUS: Record<string, string> = {
  ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
  hold: "bg-rose-50 text-rose-700 border-rose-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
};

export default function PaymentQueueTable({
  rows,
  selected,
  onToggle,
  onToggleAll,
}: {
  rows: PaymentRow[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
}) {
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50/60 text-[10px] uppercase tracking-widest text-slate-500">
          <tr>
            <th className="px-4 py-3 w-8">
              <input type="checkbox" checked={allSelected} onChange={onToggleAll} className="h-3.5 w-3.5 rounded border-slate-300" />
            </th>
            <th className="text-left px-3 py-3 font-medium">Student</th>
            <th className="text-left px-3 py-3 font-medium">Scholarship</th>
            <th className="text-right px-3 py-3 font-medium">Amount</th>
            <th className="text-left px-3 py-3 font-medium">Bank</th>
            <th className="text-left px-3 py-3 font-medium">SLA</th>
            <th className="text-right px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => {
            const lvl = getSLALevel(r.approvedSince);
            const rowCls = SLA_STYLES[lvl].row;
            return (
              <tr key={r.id} className={`${rowCls} hover:bg-slate-50`}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(r.id)}
                    onChange={() => onToggle(r.id)}
                    className="h-3.5 w-3.5 rounded border-slate-300"
                  />
                </td>
                <td className="px-3 py-3">
                  <div className="text-sm font-medium text-slate-900">{r.student}</div>
                  <div className="text-[11px] text-slate-500">{r.id}</div>
                </td>
                <td className="px-3 py-3 text-slate-600">{r.scholarship}</td>
                <td className="px-3 py-3 text-right tabular-nums font-semibold text-slate-900">
                  ₹{r.amount.toLocaleString("en-IN")}
                </td>
                <td className="px-3 py-3 text-slate-600 text-xs">{r.bank}</td>
                <td className="px-3 py-3"><SLAPill waiting={r.approvedSince} showLabel={false} /></td>
                <td className="px-4 py-3 text-right">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS[r.status]}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
