import { Rocket, Save, CheckCircle2 } from "lucide-react";

type Props = {
  capacity: number;
  rulesCount: number;
  onDraft: () => void;
  onLaunch: () => void;
  canLaunch: boolean;
};

export default function ActionBar({ capacity, rulesCount, onDraft, onLaunch, canLaunch }: Props) {
  return (
    <div className="fixed bottom-0 left-0 lg:left-[260px] right-0 border-t border-slate-200/80 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70 z-50">
      <div className="px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[12px] text-slate-600">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span className="tabular-nums">{rulesCount} eligibility rules</span>
          </div>
          <div className="h-3 w-px bg-slate-200" />
          <div className="text-[12px] text-slate-600 tabular-nums truncate">
            Seats configured: <span className="font-medium text-slate-900">{capacity}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onDraft}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            Save as Draft
          </button>
          <button
            type="button"
            disabled={!canLaunch}
            onClick={onLaunch}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Rocket className="h-4 w-4" />
            Launch Scholarship Program
          </button>
        </div>
      </div>
    </div>
  );
}
