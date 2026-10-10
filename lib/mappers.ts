import type {
  ArchiveImage,
  HistoricalEntry,
  KeyFigure,
  Source,
  TimelineEvent,
} from "@/types/archive";

// Row shapes mirror supabase/schema.sql. Pure mappers — no I/O, no Supabase import.

export interface EntryRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category_slug: string;
  subcategory: string | null;
  start_date: string;
  end_date: string | null;
  location: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
  approximate: boolean | null;
  short_description: string;
  overview: string;
  historical_context: string | null;
  causes: string[];
  key_events: TimelineEvent[];
  consequences: string[];
  lesser_known_facts: string[];
  legacy: string | null;
  historical_significance: string | null;
  hero_image: string;
  tags: string[];
}

export interface FigureRow {
  entry_slug: string;
  person_name: string;
  role: string | null;
  target_slug: string | null;
  people: Array<{ description: string | null }> | null;
}

export interface TimelineRow {
  entry_slug: string;
  date: string;
  title: string;
  description: string | null;
}

export interface ImageRow {
  entry_slug: string;
  url: string;
  alt: string | null;
  caption: string | null;
  credit: string | null;
}

export interface SourceRow {
  entry_slug: string;
  title: string;
  url: string | null;
  publisher: string | null;
}

export interface RelatedRow {
  entry_slug: string;
  related_slug: string;
}

export function mapEntry(
  row: EntryRow,
  figures: FigureRow[] = [],
  timeline: TimelineRow[] = [],
  gallery: ImageRow[] = [],
  sources: SourceRow[] = [],
  related: RelatedRow[] = []
): HistoricalEntry {
  const keyFigures: KeyFigure[] | undefined =
    figures.length > 0
      ? figures.map((f) => {
          const desc = Array.isArray(f.people) ? f.people[0]?.description : null;
          return {
            name: f.person_name,
            ...(f.role ? { role: f.role } : {}),
            ...(desc ? { description: desc } : {}),
            ...(f.target_slug ? { entrySlug: f.target_slug } : {}),
          };
        })
      : undefined;
  const entry: HistoricalEntry = {
    id: row.id,
    slug: row.slug,
    title: row.title,
    ...(row.subtitle ? { subtitle: row.subtitle } : {}),
    category: row.category_slug as HistoricalEntry["category"],
    ...(row.subcategory ? { subcategory: row.subcategory } : {}),
    startDate: row.start_date,
    ...(row.end_date ? { endDate: row.end_date } : {}),
    ...(row.location ? { location: row.location } : {}),
    ...(row.country ? { country: row.country } : {}),
    latitude: row.latitude,
    longitude: row.longitude,
    ...(row.approximate ? { approximate: true } : {}),
    shortDescription: row.short_description,
    overview: row.overview,
    ...(row.historical_context ? { historicalContext: row.historical_context } : {}),
    ...(row.causes.length > 0 ? { causes: row.causes } : {}),
    ...(row.key_events.length > 0 ? { keyEvents: row.key_events } : {}),
    ...(row.consequences.length > 0 ? { consequences: row.consequences } : {}),
    ...(row.lesser_known_facts.length > 0 ? { lesserKnownFacts: row.lesser_known_facts } : {}),
    ...(row.legacy ? { legacy: row.legacy } : {}),
    ...(row.historical_significance ? { historicalSignificance: row.historical_significance } : {}),
    heroImage: row.hero_image,
    ...(row.tags.length > 0 ? { tags: row.tags } : {}),
    ...(timeline.length > 0
      ? {
          timeline: timeline.map(
            (t): TimelineEvent => ({
              date: t.date,
              title: t.title,
              ...(t.description ? { description: t.description } : {}),
            })
          ),
        }
      : {}),
    ...(keyFigures ? { keyFigures } : {}),
    ...(gallery.length > 0
      ? {
          gallery: gallery.map(
            (g): ArchiveImage => ({
              url: g.url,
              ...(g.alt ? { alt: g.alt } : {}),
              ...(g.caption ? { caption: g.caption } : {}),
              ...(g.credit ? { credit: g.credit } : {}),
            })
          ),
        }
      : {}),
    ...(sources.length > 0
      ? {
          sources: sources.map(
            (s): Source => ({
              title: s.title,
              ...(s.url ? { url: s.url } : {}),
              ...(s.publisher ? { publisher: s.publisher } : {}),
            })
          ),
        }
      : {}),
    ...(related.length > 0 ? { relatedEntries: related.map((r) => r.related_slug) } : {}),
  };
  return entry;
}
