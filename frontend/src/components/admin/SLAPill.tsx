import { getSLALevel, SLA_STYLES, type SLAConfig } from "@/lib/sla";

export default function SLAPill({
  waiting,
  cfg,
  showLabel = true,
}: {
  waiting: string | number;
  cfg?: SLAConfig;
  showLabel?: boolean;
}) {
  const level = getSLALevel(waiting, cfg);
  const s = SLA_STYLES[level];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium ${s.pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {typeof waiting === "string" ? waiting : `${waiting}m`}
      {showLabel && <span className="opacity-70">· {s.label}</span>}
    </span>
  );
}
