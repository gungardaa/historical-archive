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
