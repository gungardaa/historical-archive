// ponytail: string-split year, no Date parsing — BCE-safe; real date-range type if timeline needs it.
export function displayYear(iso: string): string {
  const m = iso.match(/^(-?\d+)-/);
  if (!m) return iso;
  const y = parseInt(m[1], 10);
  return y < 0 ? `${Math.abs(y)} BC` : String(y);
}
