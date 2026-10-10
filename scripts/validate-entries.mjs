// ponytail: flat script, no test framework — splits into per-rule modules if entry count grows past ~200.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CATEGORIES = new Set(["wars", "battles", "empires", "people", "technology", "oddities"]);
const DATE = /^-?\d{4}-\d{2}-\d{2}$/;
const REQUIRED = ["id", "slug", "title", "category", "startDate", "shortDescription", "overview", "heroImage", "latitude", "longitude"];

const file = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "entries.json");
const entries = JSON.parse(readFileSync(file, "utf8"));
const errors = [];

if (!Array.isArray(entries)) {
  console.error("entries.json must be an array");
  process.exit(1);
}

const slugs = new Set();
for (const [i, e] of entries.entries()) {
  const at = `entry[${i}](${e.slug ?? "no-slug"})`;
  for (const f of REQUIRED) if (!e[f]) errors.push(`${at}: missing ${f}`);
  if (e.slug) {
    if (slugs.has(e.slug)) errors.push(`${at}: duplicate slug`);
    slugs.add(e.slug);
  }
  if (e.category && !CATEGORIES.has(e.category)) errors.push(`${at}: bad category ${e.category}`);
  if (e.startDate && !DATE.test(e.startDate)) errors.push(`${at}: bad startDate ${e.startDate}`);
  if (e.endDate && !DATE.test(e.endDate)) errors.push(`${at}: bad endDate ${e.endDate}`);
  if (e.latitude !== undefined && (typeof e.latitude !== "number" || e.latitude < -90 || e.latitude > 90))
    errors.push(`${at}: bad latitude ${e.latitude}`);
  if (e.longitude !== undefined && (typeof e.longitude !== "number" || e.longitude < -180 || e.longitude > 180))
    errors.push(`${at}: bad longitude ${e.longitude}`);
  if (e.latitude === 0 && e.longitude === 0) errors.push(`${at}: null-island coordinates`);
  if (e.heroImage && !existsSync(join(dirname(fileURLToPath(import.meta.url)), "..", "public", e.heroImage)))
    errors.push(`${at}: missing image file ${e.heroImage}`);
  for (const f of ["causes", "consequences", "lesserKnownFacts"]) {
    if (e[f] !== undefined && (!Array.isArray(e[f]) || e[f].some((s) => typeof s !== "string" || !s.trim())))
      errors.push(`${at}: bad ${f} (must be non-empty strings)`);
  }
  for (const ev of e.keyEvents ?? []) {
    if (!ev.title || typeof ev.title !== "string") errors.push(`${at}: keyEvent without title`);
  }
}

for (const e of entries) {
  for (const r of e.relatedEntries ?? []) {
    if (r === e.slug) errors.push(`${e.slug}: self-referencing relatedEntries`);
    else if (!slugs.has(r)) errors.push(`${e.slug}: dangling relatedEntries → ${r}`);
  }
  for (const k of e.keyFigures ?? []) {
    if (k.entrySlug && !slugs.has(k.entrySlug)) errors.push(`${e.slug}: dangling keyFigure → ${k.entrySlug}`);
  }
}

if (errors.length) {
  console.error(`${errors.length} problem(s):\n${errors.join("\n")}`);
  process.exit(1);
}
console.log(`${entries.length} entries valid.`);
