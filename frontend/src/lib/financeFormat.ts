const FINANCE_TIME_ZONE = "Asia/Kolkata";

function validDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatFinanceDate(value: string | Date) {
  const date = validDate(value);
  if (!date) return String(value);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit", month: "short", year: "numeric", timeZone: FINANCE_TIME_ZONE,
  }).format(date);
}

export function formatFinanceDateTime(value: string | Date) {
  const date = validDate(value);
  if (!date) return String(value);
  const formatted = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true, timeZone: FINANCE_TIME_ZONE,
  }).format(date);
  return `${formatted} IST`;
}

export function financeDateKey(value: string | Date) {
  const date = validDate(value);
  if (!date) return "";
  const parts = new Intl.DateTimeFormat("en-GB", {
    year: "numeric", month: "2-digit", day: "2-digit", timeZone: FINANCE_TIME_ZONE,
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
