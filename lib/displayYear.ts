// ponytail: number-year variant of the same BC rule — single source for the old
// yearLabel/inline ternaries; string entry point below stays for ISO dates.
export function displayYearNumber(year: number): string {
  return year < 0 ? `${Math.abs(year)} BC` : String(year);
}

// ponytail: string-split year, no Date parsing — BCE-safe; real date-range type if timeline needs it.
export function displayYear(iso: string): string {
  const m = iso.match(/^(-?\d+)-/);
  if (!m) return iso;
  const y = parseInt(m[1], 10);
  return y < 0 ? `${Math.abs(y)} BC` : String(y);
}
