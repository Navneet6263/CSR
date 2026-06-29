// SLA threshold utility — converts a "waiting" duration into a level.
// green  = within SLA, amber = nearing breach, red = breached.

export type SLALevel = "green" | "amber" | "red";

// Parse strings like "12m", "1h 04m", "3h 40m", "2d 4h" → minutes
export function parseDurationToMinutes(input: string): number {
  if (!input) return 0;
  let mins = 0;
  const d = input.match(/(\d+)\s*d/);
  const h = input.match(/(\d+)\s*h/);
  const m = input.match(/(\d+)\s*m/);
  if (d) mins += parseInt(d[1], 10) * 24 * 60;
  if (h) mins += parseInt(h[1], 10) * 60;
  if (m) mins += parseInt(m[1], 10);
  return mins;
}

export type SLAConfig = {
  amberAfterMinutes: number; // becomes amber at or after
  redAfterMinutes: number;   // becomes red at or after
};

// Defaults: amber after 4h, red after 2 days (per Doc Audit rule).
export const DEFAULT_SLA: SLAConfig = {
  amberAfterMinutes: 4 * 60,
  redAfterMinutes: 2 * 24 * 60,
};

export function getSLALevel(
  waiting: string | number,
  cfg: SLAConfig = DEFAULT_SLA,
): SLALevel {
  const mins = typeof waiting === "number" ? waiting : parseDurationToMinutes(waiting);
  if (mins >= cfg.redAfterMinutes) return "red";
  if (mins >= cfg.amberAfterMinutes) return "amber";
  return "green";
}

export const SLA_STYLES: Record<SLALevel, { row: string; pill: string; dot: string; label: string }> = {
  green: {
    row: "border-l-2 border-emerald-400/70",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    label: "On track",
  },
  amber: {
    row: "border-l-2 border-amber-400 bg-amber-50/30",
    pill: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    label: "At risk",
  },
  red: {
    row: "border-l-2 border-rose-500 bg-rose-50/40",
    pill: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500 animate-pulse",
    label: "Breached",
  },
};
