# Historical Archive

Live at https://ardanareswara-historical-archive.vercel.app

A digital museum of human history. It gathers wars and battles and people and empires and technology and oddities in one quiet reading room. Every record carries its dates and its place and its sources.

## Routes

| Route | Content |
| `/` | Featured stories and category plates and a random picker |
| `/explore` | Full text search and category filters and four sort orders |
| `/archive/[slug]` | Overview and context and causes and key moments and key figures and timelines and consequences |
| `/timeline` | Chronological rail with a scrub slider that jumps to the nearest year |
| `/map` | World map with markers and popups and search and category and year filters |
| `/category/[slug]` | Every record in one category |
| `/random` | Deals every record exactly once before reshuffling |
| `/about` | Method and sources |

Every route ships its own metadata plus sitemap and robots plus Open Graph images.

## Tech

- Next.js App Router with TypeScript and Tailwind CSS v4
- Local JSON catalogue with no backend
- Leaflet with OpenStreetMap tiles
- Cormorant Garamond and Inter and IBM Plex Mono through next/font

## Run it

```bash
npm install
npm run dev
```

```bash
npm run validate
npm run build
```

Validate checks every record before build. Build prerenders all routes as static pages.

## Data

Records live in data/entries.json and are checked by scripts/validate-entries.mjs. The site is fully static with no backend and no environment variables needed

## Map notes

The map runs on Leaflet so it needs no WebGL and shows a text fallback with a retry button when tiles fail

Tiles come from OpenStreetMap at no cost and carry an archival sepia filter in CSS

Markers are oxblood dots with year labels and paper popups. Zoom stops at level 2 and panning locks inside the world bounds

## Layout

- app holds routes and metadata
- components holds UI pieces
- lib holds data access and formatting helpers
- data holds the JSON catalogue
- scripts holds validation tools
