# Map setup

The `/map` page uses **MapLibre GL** (npm: `maplibre-gl`, the map library
recommended in design.md) with **OpenStreetMap Standard** raster tiles:

```text
https://tile.openstreetmap.org/{z}/{x}/{y}.png
```

- No API key required. No `.env` variables needed.
- Attribution to OpenStreetMap contributors is rendered on the map (license requirement — do not remove).
- Tiles get the archival treatment via the `.archive-map` CSS filter in `app/globals.css`.
- ponytail: OSM tile policy discourages heavy use — keyed provider (MapTiler/Stadia) via env if traffic ever outgrows a museum site.

## Swapping providers

Change only `TILE_URL` + `ATTRIBUTION` at the top of `components/ArchiveMap.tsx`.
Providers that need a key (MapTiler, Stadia, Mapbox) must read it from an
environment variable, e.g. `process.env.NEXT_PUBLIC_MAPTILER_KEY` declared in
`.env.local` (git-ignored) — never hardcode secrets.

## Coordinates

Every entry in `data/entries.json` carries `latitude` / `longitude` plus
`"approximate": true` (city/battlefield granularity). `npm run validate`
rejects out-of-range values and `(0, 0)` null-island entries.
