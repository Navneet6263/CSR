import Link from "next/link";
import { AlertOctagon, ArrowRight, CheckSquare, Wallet } from "lucide-react";
import { inr } from "@/types/finance";

interface Props {
  makerCount: number;
  makerAmount: number;
  checkerCount: number;
  checkerAmount: number;
  checkerAvailable: number;
  failedCount: number;
  failedAmount: number;
  financeFunction?: 'Maker' | 'Checker' | null;
}

interface WorkflowRowProps {
  label: string; help: string; count: number; amount: number; href: string;
  icon: typeof Wallet; tone: string; access?: 'Maker' | 'Checker'; allowed: boolean;
}

export function FinanceWorkflowPanel(props: Props) {
  const rows = [
    { label: "Maker entry", help: "Bank transfer and UTR capture", count: props.makerCount,
      amount: props.makerAmount, href: "/finance/pending", access: 'Maker' as const, icon: Wallet, tone: "bg-blue-50 text-blue-700" },
    { label: "Checker control", help: `${props.checkerAvailable} available to you`, count: props.checkerCount,
      amount: props.checkerAmount, href: "/finance/checker", access: 'Checker' as const, icon: CheckSquare, tone: "bg-emerald-50 text-emerald-700" },
    { label: "Exceptions", help: "Failed payments needing action", count: props.failedCount,
      amount: props.failedAmount, href: "/finance/failed", access: undefined, icon: AlertOctagon, tone: "bg-red-50 text-red-700" },
  ];
  return (
    <section className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-navy-500">Control centre</div>
      <h2 className="mt-1 font-display text-lg font-bold text-navy-900">Payment workflow</h2>
      <div className="mt-4 space-y-2.5">
        {rows.map((row) => <WorkflowRow key={row.href} {...row}
          allowed={!row.access || row.access === props.financeFunction} />)}
      </div>
      <div className="mt-4 rounded-xl bg-navy-50/70 p-3 text-[11px] leading-relaxed text-navy-600">
        Maker and Checker must be different users. Every decision is written to the immutable audit trail.
      </div>
    </section>
  );
}

function WorkflowRow(props: WorkflowRowProps) {
  const { label, help, count, amount, href, icon: Icon, tone, allowed } = props;
  const content = <><div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone}`}><Icon size={17} /></div>
    <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2">
      <span className="text-sm font-bold text-navy-900">{label}</span><span className="font-display text-sm font-bold text-navy-900">{count}</span></div>
      <div className="mt-0.5 flex items-center justify-between gap-2 text-[10px] text-navy-500">
        <span className="truncate">{allowed ? help : 'Organization total · view only'}</span><span className="shrink-0 font-mono">{inr(amount)}</span></div></div>
    {allowed ? <ArrowRight size={14} className="shrink-0 text-navy-300" /> : null}</>;
  const classes = "group flex items-center gap-3 rounded-xl border border-navy-100 p-3 transition";
  return allowed ? <Link href={href} className={`${classes} hover:border-navy-200 hover:bg-navy-50/50`}>{content}</Link>
    : <div className={`${classes} bg-navy-50/30`}>{content}</div>;
}
