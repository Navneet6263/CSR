'use client';

import { Download, ShieldAlert, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import PaymentQueueTable, { type PaymentRow } from '@/components/admin/payments/PaymentQueueTable';
import { adminApi } from '@/lib/api/admin';
import { saveCsv } from '@/lib/download';

function age(iso: unknown) {
  const hours = Math.max(0, Math.floor((Date.now() - new Date(String(iso)).getTime()) / 3_600_000));
  return hours >= 24 ? `${Math.floor(hours / 24)}d ${hours % 24}h` : `${hours}h`;
}

function mapRow(row: Record<string, unknown>): PaymentRow {
  const status = String(row.Status);
  return { id: `APP-${row.ApplicationID}`, student: String(row.StudentName), scholarship: String(row.ScholarshipName),
    amount: Number(row.ScholarshipAmount ?? 0), bank: String(row.BankName ?? 'Not configured'),
    approvedSince: age(row.StageEnteredAt), status: status === 'PaymentFailed' ? 'hold' : status === 'PaymentInitiated' ? 'processing' : 'ready' };
}

export default function PaymentQueue() {
  const [rows, setRows] = useState<PaymentRow[]>([]); const [selected, setSelected] = useState<Set<string>>(new Set()); const [error, setError] = useState('');
  useEffect(() => { adminApi.getPaymentQueue().then((response) => setRows((response.data ?? []).map(mapRow))).catch((reason: Error) => setError(reason.message)); }, []);
  const toggle = (id: string) => setSelected((current) => {
    const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next;
  });
  const selectedAmount = useMemo(() => rows.filter((row) => selected.has(row.id)).reduce((sum, row) => sum + row.amount, 0), [rows, selected]);
  const queueAmount = rows.reduce((sum, row) => sum + row.amount, 0);
  const exportCsv = () => {
    saveCsv(`payment-queue-${new Date().toISOString().slice(0, 10)}.csv`, [
      ['Application', 'Student', 'Scholarship', 'Amount', 'Bank', 'Status'],
      ...rows.map((row) => [row.id, row.student, row.scholarship, row.amount, row.bank, row.status]),
    ]);
  };
  return <div className="space-y-5"><div className="flex items-end justify-between"><div><p className="text-[10px] uppercase tracking-widest text-slate-400">Operations · Read only</p>
    <h1 className="mt-1 text-xl font-semibold">Payment Queue</h1><p className="text-sm text-slate-500">Maker and Checker actions are restricted to Finance accounts.</p></div>
    <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-xs"><Download className="h-3.5 w-3.5" />Export</button></div>
    {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{[
      { label: 'In Queue', value: String(rows.length), icon: Wallet }, { label: 'Queue Value', value: `₹${queueAmount.toLocaleString('en-IN')}` },
      { label: 'Selected Value', value: `₹${selectedAmount.toLocaleString('en-IN')}` }, { label: 'Failed / Hold', value: String(rows.filter((row) => row.status === 'hold').length), icon: ShieldAlert },
    ].map((item) => <div key={item.label} className="rounded-xl border bg-white p-4"><p className="text-[10px] uppercase tracking-widest text-slate-400">{item.label}</p><p className="mt-2 text-2xl font-semibold">{item.value}</p></div>)}</div>
    <PaymentQueueTable rows={rows} selected={selected} onToggle={toggle} onToggleAll={() => setSelected(selected.size === rows.length ? new Set() : new Set(rows.map((row) => row.id)))} />
  </div>;
}
