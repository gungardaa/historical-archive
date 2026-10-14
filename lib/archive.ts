import entries from "@/data/entries.json";
import type { CategorySlug, HistoricalEntry } from "@/types/archive";

const local = entries as HistoricalEntry[];

// ponytail: static catalogue, no backend — entries.json is the single source of truth.
export async function getAllEntries(): Promise<HistoricalEntry[]> {
  return local;
}

export async function getEntryBySlug(slug: string): Promise<HistoricalEntry | undefined> {
  return local.find((e) => e.slug === slug);
}

export async function getEntriesByCategory(category: CategorySlug): Promise<HistoricalEntry[]> {
  return local.filter((e) => e.category === category);
}
