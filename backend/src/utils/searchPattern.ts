const identifierPrefix = /^(?:APP|PAY|TKT|STU|SCH|U)-/i;

function normalizedSearchValue(value: string): string {
  return value.trim().replace(identifierPrefix, '');
}

/** Builds an escaped, index-seek-friendly SQL LIKE prefix pattern. */
export function prefixSearchPattern(value: string): string {
  const normalized = normalizedSearchValue(value);
  return `${normalized.replace(/[\[\]%_]/g, '[$&]')}%`;
}

/** Returns a safe integer for indexed ID equality checks, otherwise undefined. */
export function numericSearchId(value: string): number | undefined {
  const normalized = normalizedSearchValue(value);
  if (!/^\d+$/.test(normalized)) return undefined;
  const parsed = Number(normalized);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
}
