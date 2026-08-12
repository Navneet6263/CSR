import Image from 'next/image';

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
        <Image src="/logo.png" alt="Talent Foundation" width={6306} height={3277} className="h-12 w-auto rounded-xl object-contain shadow-sm" priority />
      </div>
      {showSubtitle && (
        <p className={`${s.sub} text-slate-400 tracking-widest uppercase font-medium`}>
          Scholarship Management System
        </p>
      )}
    </div>
  );
}
