// Content model mirrors design.md §33.
export type CategorySlug =
  | "wars"
  | "battles"
  | "empires"
  | "people"
  | "technology"
  | "oddities";

export interface ArchiveImage {
  url: string;
  alt?: string;
  caption?: string;
  credit?: string;
  date?: string;
  location?: string;
  source?: string;
}

export interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
}

export interface KeyFigure {
  name: string;
  role?: string;
  description?: string;
  entrySlug?: string;
}

export interface Source {
  title: string;
  url?: string;
  publisher?: string;
  author?: string;
  date?: string;
  accessedAt?: string;
}

export interface HistoricalEntry {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  category: CategorySlug;
  subcategory?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  country?: string;
  latitude: number;
  longitude: number;
  approximate?: boolean;
  shortDescription: string;
  // Multi-paragraph: paragraphs separated by blank lines, split at render.
  overview: string;
  historicalContext?: string;
  causes?: string[];
  keyEvents?: TimelineEvent[];
  consequences?: string[];
  lesserKnownFacts?: string[];
  legacy?: string;
  historicalSignificance?: string;
  heroImage: string;
  gallery?: ArchiveImage[];
  timeline?: TimelineEvent[];
  keyFigures?: KeyFigure[];
  tags?: string[];
  relatedEntries?: string[];
  sources?: Source[];
}
