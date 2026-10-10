import type { HistoricalEntry } from "@/types/archive";

// ponytail: signed-year int sort, not lexicographic ISO — string compare misorders BCE ("-3100" > "-0480"). Full date objects if sub-year precision ever matters.
export function parseYear(iso: string): number {
  const m = iso.match(/^(-?\d+)-(\d+)-(\d+)$/);
  if (!m) return Number.NaN;
  return parseInt(m[1], 10);
}

export interface YearGroup {
  year: number;
  label: string;
  entries: HistoricalEntry[];
}

export function groupByYear(entries: HistoricalEntry[]): YearGroup[] {
  const sorted = [...entries].sort((a, b) => parseYear(a.startDate) - parseYear(b.startDate));
  const groups: YearGroup[] = [];
  for (const e of sorted) {
    const year = parseYear(e.startDate);
    const last = groups[groups.length - 1];
    if (last && last.year === year) last.entries.push(e);
    else {
      const label = year < 0 ? `${Math.abs(year)} BC` : String(year);
      groups.push({ year, label, entries: [e] });
    }
  }
  return groups;
}

// Eras adapted to the collection span (3100 BC – 1975).
export const ERAS: Array<{ label: string; year: number }> = [
  { label: "3100 BC", year: -3100 },
  { label: "500 BC", year: -500 },
  { label: "0", year: 0 },
  { label: "500", year: 500 },
  { label: "1000", year: 1000 },
  { label: "1500", year: 1500 },
  { label: "1800", year: 1800 },
  { label: "1900", year: 1900 },
  { label: "1950", year: 1950 },
];
