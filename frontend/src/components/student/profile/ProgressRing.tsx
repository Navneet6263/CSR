interface Props {
  value: number; // 0-100
  size?: number;
  stroke?: number;
  label?: string;
}

export function ProgressRing({ value, size = 132, stroke = 10, label = "Complete" }: Props) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (Math.min(100, Math.max(0, value)) / 100) * circ;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--muted)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringGradient)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
        <defs>
          <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.72 0.18 50)" />
            <stop offset="100%" stopColor="oklch(0.78 0.16 60)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-2xl font-bold tracking-tight">{value}%</div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}
