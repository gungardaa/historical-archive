// Generates supabase/seed.sql from data/entries.json. Re-runnable: TRUNCATEs first.
// Run: npm run seed  →  paste supabase/seed.sql into the Supabase SQL Editor.
// ponytail: string-built SQL, no query builder — switch to supabase-js inserts if seed outgrows ~1MB.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const entries = JSON.parse(readFileSync(join(root, "data", "entries.json"), "utf8"));

// Curatorial copy lives in lib/categories.ts; mirrored here so the DB is self-contained.
const CATEGORIES = [
  { slug: "wars", name: "Wars", numeral: "I", note: "Conflicts that redrew maps", intro: "Prolonged conflicts between states and peoples — the great ruptures that ended empires and drew the borders we live with." },
  { slug: "battles", name: "Battles", numeral: "II", note: "Single days that decided eras", intro: "Compressed violence: one field, one day, one decision. Each of these engagements bent the longer war around it." },
  { slug: "empires", name: "Empires", numeral: "III", note: "Civilizations at their height", intro: "The large orders — how they rose, what held them together, and what their collapse left behind." },
  { slug: "people", name: "People", numeral: "IV", note: "Lives that bent history", intro: "Individuals whose choices scaled up: generals, rulers, and voices that carried further than their own lifetimes." },
  { slug: "technology", name: "Technology", numeral: "V", note: "Machines and material craft", intro: "Instruments of power and knowledge — from concrete that heals in seawater to machines that ended the battleship age." },
  { slug: "oddities", name: "Oddities", numeral: "VI", note: "Strange but documented events", intro: "The archive's cabinet of curiosities: mysteries, impossible missions, and events that read like fiction but happened." },
];

const q = (v) => (v === undefined || v === null ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);
const j = (v) => `'${JSON.stringify(v ?? []).replace(/'/g, "''")}'::jsonb`;
const b = (v) => (v ? "TRUE" : "FALSE");

const out = [];
out.push("begin;");
out.push("truncate entry_people, entry_related, timeline_events, entry_images, sources, people, entries, categories restart identity cascade;");
for (const c of CATEGORIES) {
  out.push(`insert into categories (slug, name, numeral, note, intro) values (${q(c.slug)}, ${q(c.name)}, ${q(c.numeral)}, ${q(c.note)}, ${q(c.intro)});`);
}

const people = new Map();
for (const e of entries) {
  for (const k of e.keyFigures ?? []) {
    if (!people.has(k.name)) people.set(k.name, k);
  }
}
for (const e of entries) {
  out.push(`insert into entries (id, slug, title, subtitle, category_slug, subcategory, start_date, end_date, location, country, latitude, longitude, approximate, short_description, overview, historical_context, causes, key_events, consequences, lesser_known_facts, legacy, historical_significance, hero_image, tags) values (${q(e.id)}, ${q(e.slug)}, ${q(e.title)}, ${q(e.subtitle)}, ${q(e.category)}, ${q(e.subcategory)}, ${q(e.startDate)}, ${q(e.endDate)}, ${q(e.location)}, ${q(e.country)}, ${e.latitude}, ${e.longitude}, ${b(e.approximate)}, ${q(e.shortDescription)}, ${q(e.overview)}, ${q(e.historicalContext)}, ${j(e.causes)}, ${j(e.keyEvents)}, ${j(e.consequences)}, ${j(e.lesserKnownFacts)}, ${q(e.legacy)}, ${q(e.historicalSignificance)}, ${q(e.heroImage)}, ${j(e.tags)});`);
}
for (const k of people.values()) {
  out.push(`insert into people (name, role, description) values (${q(k.name)}, ${q(k.role)}, ${q(k.description)}) on conflict (name) do update set role = excluded.role, description = coalesce(excluded.description, people.description);`);
}
for (const e of entries) {
  for (const [i, t] of (e.timeline ?? []).entries()) {
    out.push(`insert into timeline_events (entry_slug, date, title, description, position) values (${q(e.slug)}, ${q(t.date)}, ${q(t.title)}, ${q(t.description)}, ${i});`);
  }
  for (const k of e.keyFigures ?? []) {
    out.push(`insert into entry_people (entry_slug, person_name, role, target_slug) values (${q(e.slug)}, ${q(k.name)}, ${q(k.role)}, ${q(k.entrySlug)});`);
  }
  for (const [i, g] of (e.gallery ?? []).entries()) {
    out.push(`insert into entry_images (entry_slug, url, alt, caption, credit, position) values (${q(e.slug)}, ${q(g.url)}, ${q(g.alt)}, ${q(g.caption)}, ${q(g.credit)}, ${i});`);
  }
  for (const [i, r] of (e.relatedEntries ?? []).entries()) {
    out.push(`insert into entry_related (entry_slug, related_slug, position) values (${q(e.slug)}, ${q(r)}, ${i});`);
  }
  for (const s of e.sources ?? []) {
    out.push(`insert into sources (entry_slug, title, url, publisher) values (${q(e.slug)}, ${q(s.title)}, ${q(s.url)}, ${q(s.publisher)});`);
  }
}
out.push("commit;");

writeFileSync(join(root, "supabase", "seed.sql"), out.join("\n") + "\n");

const counts = {
  entries: entries.length,
  timeline: entries.reduce((n, e) => n + (e.timeline ?? []).length, 0),
  figures: entries.reduce((n, e) => n + (e.keyFigures ?? []).length, 0),
  related: entries.reduce((n, e) => n + (e.relatedEntries ?? []).length, 0),
  people: people.size,
};
console.log(`seed.sql written: ${JSON.stringify(counts)}`);
