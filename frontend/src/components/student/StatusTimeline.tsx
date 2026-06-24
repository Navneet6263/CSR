import type { ApplicationStatus } from '@/types';
import { Check } from 'lucide-react';

interface StatusTimelineProps {
  currentStatus: ApplicationStatus;
}

const stages = [
  { key: 'Registration', statuses: ['Draft', 'Submitted'] },
  { key: 'Documents', statuses: ['DocAuditInProgress'] },
  { key: 'Auto-Match', statuses: ['AutoMatched', 'EligibilityFailed'] },
  { key: 'Doc Audit', statuses: ['DocAuditComplete'] },
  { key: 'BG Check', statuses: ['BGCheckInProgress', 'BGCheckComplete'] },
  { key: 'Screening', statuses: ['ScreeningPending', 'ScreeningApproved', 'ScreeningRejected'] },
  { key: 'CSR Approval', statuses: ['CSRPending', 'CSRApproved', 'CSRDeclined'] },
  { key: 'Funded', statuses: ['PaymentPending', 'PaymentInitiated', 'PaymentCompleted'] },
];

function getStageIndex(status: ApplicationStatus): number {
  for (let i = 0; i < stages.length; i++) {
    if (stages[i].statuses.includes(status)) return i;
  }
  return 0;
}

export default function StatusTimeline({ currentStatus }: StatusTimelineProps) {
  const currentIndex = getStageIndex(currentStatus);

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex items-center justify-between min-w-[640px] px-2">
        {stages.map((stage, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;

          return (
            <div key={stage.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-gradient-to-br from-[#0e6251] to-[#148f77] text-white shadow-[3px_3px_8px_rgba(14,98,81,0.2)]'
                    : isCurrent
                    ? 'bg-gradient-to-br from-[#5b2c6f] to-[#2e86c1] text-white shadow-[3px_3px_10px_rgba(91,44,111,0.25)] ring-4 ring-[#5b2c6f]/10'
                    : 'bg-white/80 text-slate-400 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.04),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]'
                }`}>
                  {isCompleted ? <Check size={14} /> : i + 1}
                </div>
                <span className={`text-[11px] font-medium text-center whitespace-nowrap px-2 py-1 rounded-xl ${
                  isCurrent
                    ? 'text-[#5b2c6f] bg-[#5b2c6f]/5'
                    : isCompleted
                    ? 'text-[#0e6251]'
                    : 'text-slate-400'
                }`}>
                  {stage.key}
                </span>
              </div>

              {i < stages.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mt-[-20px] rounded-full transition-all ${
                  i < currentIndex
                    ? 'bg-gradient-to-r from-[#0e6251] to-[#148f77]'
                    : 'bg-slate-200 border-dashed border-t border-slate-200 h-0'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
