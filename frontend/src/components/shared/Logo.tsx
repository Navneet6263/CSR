import { GraduationCap } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

const sizeMap = {
  sm: { icon: 24, heading: 'text-xl', sub: 'text-xs' },
  md: { icon: 32, heading: 'text-2xl', sub: 'text-sm' },
  lg: { icon: 40, heading: 'text-3xl', sub: 'text-base' },
};

export default function Logo({ size = 'md', showSubtitle = true }: LogoProps) {
  const s = sizeMap[size];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="p-2 bg-gradient-to-br from-[#5b2c6f] to-[#2e86c1] rounded-2xl shadow-[4px_4px_10px_rgba(91,44,111,0.2),-2px_-2px_8px_rgba(255,255,255,0.8)]">
            <GraduationCap size={s.icon} className="text-white" />
          </div>
        </div>
        <h1
          className={`${s.heading} font-bold bg-gradient-to-r from-[#5b2c6f] via-[#7d3c98] to-[#2e86c1] bg-clip-text text-transparent tracking-tight`}
        >
          TalentBridge
        </h1>
      </div>
      {showSubtitle && (
        <p className={`${s.sub} text-slate-400 tracking-widest uppercase font-medium`}>
          Scholarship Management System
        </p>
      )}
    </div>
  );
}
