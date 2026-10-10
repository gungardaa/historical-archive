import entries from "@/data/entries.json";
import type { CategorySlug, HistoricalEntry } from "@/types/archive";
import {
  mapEntry,
  type EntryRow,
  type FigureRow,
  type ImageRow,
  type RelatedRow,
  type SourceRow,
  type TimelineRow,
} from "@/lib/mappers";
import { getSupabase } from "@/lib/supabase";

const local = entries as HistoricalEntry[];

// ponytail: one fetch-all + in-memory find (35 rows, single memoized flight) — per-slug queries if the archive outgrows ~200.
let flight: Promise<HistoricalEntry[]> | null = null;

async function fetchRemote(): Promise<HistoricalEntry[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const [er, fr, tr, gr, sr, rr] = await Promise.all([
      sb.from("entries").select("*").order("id"),
      sb.from("entry_people").select("entry_slug, person_name, role, target_slug, people(description)"),
      sb.from("timeline_events").select("entry_slug, date, title, description").order("position"),
      sb.from("entry_images").select("entry_slug, url, alt, caption, credit").order("position"),
      sb.from("sources").select("entry_slug, title, url, publisher"),
      sb.from("entry_related").select("entry_slug, related_slug").order("position"),
    ]);
    if (er.error || !er.data || er.data.length === 0) return null;
    if (fr.error || tr.error || gr.error || sr.error || rr.error) return null;
    const group = <T extends { entry_slug: string }>(rows: T[]): Record<string, T[]> => {
      const out: Record<string, T[]> = {};
      for (const r of rows) (out[r.entry_slug] ??= []).push(r);
      return out;
    };
    const figs = group((fr.data ?? []) as FigureRow[]);
    const tls = group((tr.data ?? []) as TimelineRow[]);
    const imgs = group((gr.data ?? []) as ImageRow[]);
    const srcs = group((sr.data ?? []) as SourceRow[]);
    const rels = group((rr.data ?? []) as RelatedRow[]);
    return (er.data as EntryRow[]).map((row) =>
      mapEntry(
        row,
        figs[row.slug] ?? [],
        tls[row.slug] ?? [],
        imgs[row.slug] ?? [],
        srcs[row.slug] ?? [],
        rels[row.slug] ?? []
      )
    );
  } catch {
    return null;
  }
}

export async function getAllEntries(): Promise<HistoricalEntry[]> {
  flight ??= fetchRemote().then((rows) => rows ?? local);
  return flight;
}

export async function getEntryBySlug(slug: string): Promise<HistoricalEntry | undefined> {
  return (await getAllEntries()).find((e) => e.slug === slug);
}

export async function getEntriesByCategory(category: CategorySlug): Promise<HistoricalEntry[]> {
  return (await getAllEntries()).filter((e) => e.category === category);
}
