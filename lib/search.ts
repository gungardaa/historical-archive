import type { HistoricalEntry } from "@/types/archive";

// ponytail: substring + weights, no stemming/fuzz — swap this file for a search index if entries pass ~200 (same input/output contract: entries in, ranked out).
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function scoreTerm(entry: HistoricalEntry, term: string): number {
  const people = (entry.keyFigures ?? []).map((k) => k.name).join(" ");
  const hi = (s: string, w: number) => (normalize(s).includes(term) ? w : 0);
  return (
    hi(entry.title, 3) +
    hi(entry.subtitle ?? "", 2) +
    hi(entry.tags?.join(" ") ?? "", 2) +
    hi(people, 2) +
    hi(entry.category, 2) +
    hi(entry.shortDescription, 1) +
    hi(entry.overview, 1) +
    hi(entry.location ?? "", 1) +
    hi(entry.country ?? "", 1)
  );
}

export interface RankedEntry {
  entry: HistoricalEntry;
  score: number;
}

export function searchEntries(entries: HistoricalEntry[], query: string): RankedEntry[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return entries.map((entry) => ({ entry, score: 0 }));
  return entries
    .map((entry) => ({ entry, score: terms.reduce((sum, t) => sum + scoreTerm(entry, t), 0) }))
    .filter((r) => terms.every((t) => scoreTerm(r.entry, t) > 0) && r.score > 0)
    .sort((a, b) => b.score - a.score);
}
