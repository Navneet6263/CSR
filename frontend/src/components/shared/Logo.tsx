import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  subtitle?: string;
}

const sizeMap = {
  sm: { icon: 34, heading: 'text-base', sub: 'text-[9px]' },
  md: { icon: 44, heading: 'text-xl', sub: 'text-[10px]' },
  lg: { icon: 56, heading: 'text-2xl', sub: 'text-xs' },
};

export default function Logo({ size = 'md', showSubtitle = true, subtitle = 'Scholarship Platform' }: LogoProps) {
  const s = sizeMap[size];

  return (
    <div className="flex items-center gap-2.5">
      <Image src="/brand-mark.svg" alt="" width={s.icon} height={s.icon} className="shrink-0" priority />
      <span className="min-w-0 leading-tight">
        <span className={`${s.heading} block truncate font-bold tracking-tight text-[#123b7a]`}>Shikshavritti</span>
        {showSubtitle && <span className={`${s.sub} block truncate font-semibold uppercase tracking-[0.14em] text-emerald-700`}>
          {subtitle}
        </span>}
      </span>
    </div>
  );
}
