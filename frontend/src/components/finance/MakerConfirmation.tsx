import { AlertTriangle, Landmark, LoaderCircle, UserRound } from "lucide-react";
import { inr, type Payout } from "@/types/finance";

interface Props {
  rows: Payout[];
  total: number;
  utr: string;
  saving: boolean;
  error: string;
  onBack: () => void;
  onConfirm: () => void;
}

export function MakerConfirmation(props: Props) {
  const { rows, total, utr, saving, error, onBack, onConfirm } = props;
  return (
    <div className="p-5 sm:p-6">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy-500">Final review</div>
      <h3 className="mt-1 font-display text-xl font-bold text-navy-900">Confirm bank transfer</h3>
      <p className="mt-1 text-sm text-navy-500">Match these details with the bank portal before recording.</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Summary icon={Landmark} label="Payment amount" value={inr(total)} />
        <Summary icon={UserRound} label="Beneficiaries" value={String(rows.length)} />
      </div>

      <div className="mt-3 rounded-xl border border-navy-100 bg-navy-50/60 p-4">
        <div className="text-[10px] font-bold uppercase tracking-widest text-navy-500">Bank UTR / Reference</div>
        <div className="mt-1 break-all font-mono text-sm font-bold tracking-wide text-navy-900">{utr}</div>
      </div>

      <div className="mt-3 max-h-36 overflow-y-auto rounded-xl border border-navy-100">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center justify-between gap-3 border-b border-navy-100 px-4 py-3 last:border-0">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-navy-900">{row.fullName}</div>
              <div className="truncate text-[11px] text-navy-500">{row.applicationId} · {row.bankName}</div>
            </div>
            <span className="shrink-0 font-display text-sm font-bold text-navy-900">{inr(row.amount)}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        <AlertTriangle size={17} className="mt-0.5 shrink-0" />
        <span>After recording, only an independent Checker can verify or cancel this payment.</span>
      </div>
      {error ? <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button type="button" onClick={onBack} disabled={saving}
          className="rounded-xl border border-navy-100 px-4 py-3 font-semibold text-navy-700 hover:bg-navy-50 disabled:opacity-50">
          Review again
        </button>
        <button type="button" onClick={onConfirm} disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl bg-success-500 px-4 py-3 font-display font-bold text-white shadow-lg hover:bg-success-700 disabled:opacity-60">
          {saving ? <><LoaderCircle size={17} className="animate-spin" /> Recording</> : "Confirm & Record"}
        </button>
      </div>
    </div>
  );
}

function Summary({ icon: Icon, label, value }: { icon: typeof Landmark; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-navy-100 bg-white p-3">
      <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-navy-500"><Icon size={13} />{label}</div>
      <div className="mt-1 truncate font-display text-lg font-bold text-navy-900">{value}</div>
    </div>
  );
}
