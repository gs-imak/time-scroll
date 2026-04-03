/** Format a year number for display (e.g., -2560 -> "2,560 BCE", 80 -> "80 CE") */
export function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year).toLocaleString()} BCE`;
  if (year === 0) return '1 BCE';
  return `${year.toLocaleString()} CE`;
}

/** Format a year range */
export function formatYearRange(start: number, end: number): string {
  return `${formatYear(start)} — ${formatYear(end)}`;
}
