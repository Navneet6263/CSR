import { Check } from 'lucide-react';

interface ApplicationStepperProps {
  currentStep: number;
  steps: string[];
}

export default function ApplicationStepper({ currentStep, steps }: ApplicationStepperProps) {
  return (
    <div className="clay-card p-6 mb-6">
      <div className="flex items-center justify-between">
        {steps.map((step, i) => {
          const isCompleted = i < currentStep;
          const isCurrent = i === currentStep;

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-gradient-to-br from-[#0e6251] to-[#148f77] text-white shadow-[3px_3px_8px_rgba(14,98,81,0.2)]'
                    : isCurrent
                    ? 'bg-gradient-to-br from-[#5b2c6f] to-[#2e86c1] text-white shadow-[4px_4px_12px_rgba(91,44,111,0.25)]'
                    : 'bg-white/80 text-slate-400 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.04)]'
                }`}>
                  {isCompleted ? <Check size={18} /> : i + 1}
                </div>
                <span className={`text-xs font-medium text-center ${
                  isCurrent ? 'text-[#5b2c6f]' : isCompleted ? 'text-[#0e6251]' : 'text-slate-400'
                }`}>
                  {step}
                </span>
              </div>

              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 rounded-full ${
                  i < currentStep
                    ? 'bg-gradient-to-r from-[#0e6251] to-[#148f77]'
                    : 'bg-slate-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
