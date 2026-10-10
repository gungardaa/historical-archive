// One-shot style pass: strip AI-tell punctuation from entries.json prose.
// Bans: `;` and em dash `—` everywhere in prose; `:` except HH:MM times.
// Keeps: en dash `–` (year ranges), hyphens, commas, periods.
// ponytail: string-level rewrite, no NLP lib — manual pass if subtler AI patterns need work.
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const file = join(root, "data", "entries.json");
copyFileSync(file, join(root, "data", "entries.json.bak-style"));

const entries = JSON.parse(readFileSync(file, "utf8"));

function capAfterPeriod(s) {
  // Capitalize a lowercase letter that newly starts a sentence after `. `
  return s.replace(/\. ([a-z])/g, (_, c) => `. ${c.toUpperCase()}`);
}

function fixText(s) {
  if (typeof s !== "string" || !s) return s;
  let out = s;
  // 1. Em dash -> comma (safest meaning-preserving join for parentheticals/appositions)
  out = out.replace(/—/g, ",");
  // 2. Semicolon -> period + new sentence
  out = out.replace(/;\s*/g, ". ");
  // 3. Colon -> period, except HH:MM times (protect times first)
  const TIMES = [];
  out = out.replace(/\b\d{1,2}:\d{2}\b/g, (m) => {
    TIMES.push(m);
    return `@@T${TIMES.length - 1}@@`;
  });
  out = out.replace(/:\s*/g, ". ");
  out = out.replace(/@@T(\d+)@@/g, (_, i) => TIMES[Number(i)]);
  out = capAfterPeriod(out);
  // 4. Cleanup artifacts
  out = out
    .replace(/,{2,}/g, ",")
    .replace(/\.{2,}/g, ".")
    .replace(/,\s*\./g, ".")
    .replace(/\(\s*,/g, "(")
    .replace(/,\s*\)/g, ")")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\. ([a-z0-9])/g, (m, c) => (/\d/.test(c) ? m : `. ${c.toUpperCase()}`));
  // 5. Known typo
  out = out.replace(/HYPO'sPartial/g, "HYPO's partial");
  return out;
}

const LIST_STR = ["causes", "consequences", "lesserKnownFacts", "tags"];
const LIST_OBJ = ["keyEvents", "timeline"];
for (const e of entries) {
  for (const k of ["shortDescription", "overview", "historicalContext", "historicalSignificance", "legacy", "subtitle"]) {
    if (e[k]) e[k] = fixText(e[k]);
  }
  for (const k of LIST_STR) {
    if (Array.isArray(e[k])) e[k] = e[k].map(fixText);
  }
  for (const k of LIST_OBJ) {
    if (Array.isArray(e[k])) {
      for (const o of e[k]) {
        if (o.title) o.title = fixText(o.title);
        if (o.description) o.description = fixText(o.description);
      }
    }
  }
  if (Array.isArray(e.keyFigures)) {
    for (const f of e.keyFigures) {
      if (f.role) f.role = fixText(f.role);
      if (f.description) f.description = fixText(f.description);
    }
  }
}

writeFileSync(file, JSON.stringify(entries, null, 2) + "\n");

// Report residuals (should be zero outside HH:MM)
let semi = 0, emd = 0, colon = 0;
function scan(s) {
  if (typeof s !== "string") return;
  const t = s.replace(/\b\d{1,2}:\d{2}\b/g, "");
  semi += (t.match(/;/g) || []).length;
  emd += (t.match(/—/g) || []).length;
  colon += (t.match(/:/g) || []).length;
}
for (const e of entries) {
  for (const k of ["shortDescription", "overview", "historicalContext", "historicalSignificance", "legacy"]) scan(e[k]);
  for (const k of LIST_STR) for (const s of e[k] || []) scan(s);
  for (const k of LIST_OBJ) for (const o of e[k] || []) { scan(o.title); scan(o.description); }
  for (const f of e.keyFigures || []) { scan(f.role); scan(f.description); }
}
console.log(JSON.stringify({ entries: entries.length, residualSemi: semi, residualEmDash: emd, residualColon: colon }));
