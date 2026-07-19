/** Years before this point are so deep in prehistory that presenting them as a
 *  precise BCE calendar year is false precision (they're usually derived from a
 *  rough "X years ago" estimate, e.g. "790,000 years ago" for Homo erectus). */
const DEEP_PAST_THRESHOLD_YEAR = -10000; // 10,000 BCE

/** Round `n` to `sigFigs` significant figures (e.g. roundToSignificantFigures(787975, 2) -> 790000). */
function roundToSignificantFigures(n: number, sigFigs: number): number {
  if (n === 0) return 0;
  const magnitude = Math.pow(10, Math.ceil(Math.log10(Math.abs(n))) - sigFigs);
  return Math.round(n / magnitude) * magnitude;
}

/**
 * Format a year number for display (e.g., -2560 -> "2,560 BCE", 80 -> "80 CE").
 *
 * Years older than 10,000 BCE are reworded as an approximate "years ago" figure
 * rounded to 2 significant figures instead of a spuriously precise BCE year —
 * e.g. -787975 renders as "~790,000 years ago", not "787,975 BCE". This matches
 * how such dates actually originate (rough archaeological estimates like "roughly
 * 790,000 years ago", not a known calendar year).
 */
export function formatYear(year: number): string {
  if (year < DEEP_PAST_THRESHOLD_YEAR) {
    const currentYear = new Date().getFullYear();
    const yearsAgo = roundToSignificantFigures(currentYear - year, 2);
    return `~${yearsAgo.toLocaleString()} years ago`;
  }
  if (year < 0) return `${Math.abs(year).toLocaleString()} BCE`;
  if (year === 0) return '1 BCE';
  return `${year.toLocaleString()} CE`;
}

/** Format a year range */
export function formatYearRange(start: number, end: number): string {
  return `${formatYear(start)} — ${formatYear(end)}`;
}
