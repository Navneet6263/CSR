'use client';

import { useMemo, useState } from "react";
import { Wallet, Send, Download, ShieldAlert } from "lucide-react";
import PaymentQueueTable, { type PaymentRow } from "@/components/admin/payments/PaymentQueueTable";


const ROWS: PaymentRow[] = [
  { id: "PAY-2041", student: "Ananya Sharma", scholarship: "Merit-cum-Means 2026", amount: 50000, bank: "HDFC ****4521", approvedSince: "6h", status: "ready" },
  { id: "PAY-2040", student: "Karthik Nair", scholarship: "STEM Excellence", amount: 75000, bank: "SBI ****8810", approvedSince: "1d 2h", status: "ready" },
  { id: "PAY-2039", student: "Meera Joshi", scholarship: "Women in Tech", amount: 60000, bank: "ICICI ****2245", approvedSince: "3d 4h", status: "ready" },
  { id: "PAY-2038", student: "Rahul Verma", scholarship: "Merit-cum-Means 2026", amount: 50000, bank: "Axis ****9912", approvedSince: "5h", status: "hold" },
  { id: "PAY-2037", student: "Divya Patel", scholarship: "STEM Excellence", amount: 75000, bank: "Kotak ****3344", approvedSince: "2d 6h", status: "ready" },
  { id: "PAY-2036", student: "Aman Gupta", scholarship: "Rural Outreach", amount: 40000, bank: "PNB ****7788", approvedSince: "4d 1h", status: "processing" },
];

export default function PaymentQueue() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };
  const toggleAll = () => {
    if (selected.size === ROWS.length) setSelected(new Set());
    else setSelected(new Set(ROWS.map((r) => r.id)));
  };

  const totalAmt = useMemo(
    () => ROWS.filter((r) => selected.has(r.id)).reduce((s, r) => s + r.amount, 0),
    [selected],
  );
  const queueAmt = ROWS.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400">Operations</div>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">Payment Queue</h1>
          <p className="mt-0.5 text-sm text-slate-500">Approved students awaiting fund disbursement.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button
            disabled={selected.size === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="h-3.5 w-3.5" />
            Initiate Batch {selected.size > 0 && `· ${selected.size} · ₹${totalAmt.toLocaleString("en-IN")}`}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { l: "In Queue", v: `${ROWS.length}`, icon: Wallet },
          { l: "Queue Value", v: `₹${(queueAmt / 100000).toFixed(1)}L` },
          { l: "Selected", v: `${selected.size}` },
          { l: "On Hold", v: `${ROWS.filter((r) => r.status === "hold").length}`, icon: ShieldAlert },
        ].map((k) => (
          <div key={k.l} className="rounded-xl border border-slate-200/80 bg-white p-4">
            <div className="text-[10px] uppercase tracking-widest text-slate-400">{k.l}</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{k.v}</div>
          </div>
        ))}
      </div>

      <PaymentQueueTable rows={ROWS} selected={selected} onToggle={toggle} onToggleAll={toggleAll} />
    </div>
  );
}

