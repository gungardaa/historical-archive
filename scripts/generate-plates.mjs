// ponytail: static SVG plates, not real photos — replace files + heroImage paths when the asset pass lands (no component changes needed).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const entries = JSON.parse(readFileSync(join(root, "data", "entries.json"), "utf8"));
const dir = join(root, "public", "images", "plates");
mkdirSync(dir, { recursive: true });

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function plate(entry) {
  const initial = esc(entry.title.replace(/^The /, "").charAt(0));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
<rect width="800" height="500" fill="#E8E3D8"/>
<rect x="24" y="24" width="752" height="452" fill="none" stroke="#171717" stroke-opacity="0.15" stroke-width="2"/>
<text x="56" y="84" font-family="monospace" font-size="22" letter-spacing="6" fill="#6E675E">ARCHIVE ${esc(entry.id)}</text>
<text x="400" y="330" text-anchor="middle" font-family="Georgia, serif" font-size="220" fill="#171717" fill-opacity="0.85">${initial}</text>
<text x="56" y="440" font-family="monospace" font-size="22" letter-spacing="6" fill="#8B2F2F">${esc(entry.category.toUpperCase())}</text>
</svg>
`;
}

for (const e of entries) {
  writeFileSync(join(dir, `${e.slug}.svg`), plate(e));
  e.heroImage = `/images/plates/${e.slug}.svg`;
}

writeFileSync(
  join(root, "public", "images", "placeholder.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500"><rect width="800" height="500" fill="#E8E3D8"/><text x="400" y="260" text-anchor="middle" font-family="monospace" font-size="24" letter-spacing="6" fill="#6E675E">IMAGE PENDING</text></svg>
`
);

writeFileSync(join(root, "data", "entries.json"), JSON.stringify(entries, null, 2) + "\n");
console.log(`${entries.length} plates generated.`);
