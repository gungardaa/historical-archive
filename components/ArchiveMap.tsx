"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { CATEGORIES } from "@/lib/categories";
import { displayYear } from "@/lib/displayYear";
import { formatDate } from "@/lib/formatDate";
import { parseYear } from "@/lib/timeline";
import type { HistoricalEntry } from "@/types/archive";

// Tiles: OSM Standard (free, no key) + archival CSS filter in globals.css.
// To swap provider, change TILE_URL + ATTRIBUTION only. No secrets involved.
const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export default function ArchiveMap({ entries }: { entries: HistoricalEntry[] }) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const [query, setQuery] = useState("");
  const [cats, setCats] = useState<string[]>(CATEGORIES.map((c) => c.slug));
  const bounds = useMemo(() => {
    const years = entries.map((e) => parseYear(e.startDate));
    return { min: Math.min(...years), max: Math.max(...years) };
  }, [entries]);
  const [maxYear, setMaxYear] = useState<number | null>(null);
  const limit = maxYear ?? bounds.max;
  const [mapState, setMapState] = useState<"loading" | "ready" | "error">(() =>
    // ponytail: probe in the initializer, not the effect — a dead map renders as text, never a blank box.
    typeof document !== "undefined" && !document.createElement("canvas").getContext("webgl2")
      ? "error"
      : "loading"
  );
  const [mapNote, setMapNote] = useState<string | null>(() =>
    typeof document !== "undefined" && !document.createElement("canvas").getContext("webgl2")
      ? "This browser gave no WebGL2 context. Check hardware acceleration, then reload."
      : null
  );

  const results = useMemo(() => {
    const q = query.toLowerCase();
    return entries.filter(
      (e) =>
        cats.includes(e.category) &&
        parseYear(e.startDate) <= limit &&
        (!q ||
          [e.title, e.subtitle, e.location, e.country, e.tags?.join(" ")]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(q))
    );
  }, [query, cats, limit, entries]);

  function reportMapFailure(message: string) {
    setMapState("error");
    setMapNote(message);
  }

  useEffect(() => {
    if (!container.current || map.current) return;
    // ponytail: vendored worker (public/maplibre-worker.mjs) — Turbopack dev can't resolve
    // maplibre's `new Worker(new URL(...))`; re-copy the file on every maplibre upgrade.
    maplibregl.setWorkerUrl("/maplibre-worker.mjs");
    // ponytail: probe + try/catch so a dead map renders as text, never a blank box —
    // per-tile errors only annotate the status line; richer diagnostics if users report them.
    if (mapState === "error") return;
    let m: maplibregl.Map;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    try {
      m = new maplibregl.Map({
        container: container.current,
        style: {
          version: 8,
          sources: { positron: { type: "raster", tiles: [TILE_URL], tileSize: 256, attribution: ATTRIBUTION } },
          layers: [{ id: "positron", type: "raster", source: "positron" }],
        },
        center: [20, 35],
        zoom: 1.5,
        fadeDuration: reduce ? 0 : 300,
        attributionControl: { compact: true },
      });
    } catch (err) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- failure path runs once then bails via the mapState guard; no render loop.
      reportMapFailure(err instanceof Error ? err.message : "The map failed to start.");
      return;
    }
    map.current = m;
    m.on("load", () => setMapState("ready"));
    m.on("error", (ev) => setMapNote((ev as unknown as { error?: Error }).error?.message ?? "A map tile failed to load."));
    const nav = new maplibregl.NavigationControl({ showCompass: false });
    m.addControl(nav, "top-right");
    const box = new maplibregl.LngLatBounds();
    for (const e of entries) box.extend([e.longitude, e.latitude]);
    m.fitBounds(box, { padding: 40, duration: reduce ? 0 : 800 });
    return () => {
      m.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ponytail: destroy + rebuild markers per filter (35 max) — diff/update if entries pass ~200.
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    for (const mk of markers.current) mk.remove();
    markers.current = results.map((e) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "archive-marker";
      el.setAttribute("aria-label", `${e.title}, ${displayYear(e.startDate)}`);
      el.innerHTML = `<span></span><em>${displayYear(e.startDate)}</em>`;
      const popup = new maplibregl.Popup({ offset: 16, className: "archive-popup" }).setHTML(
        `<p>${e.category.toUpperCase()} · ${formatDate(e.startDate)}</p>` +
        `<h3>${e.title}</h3>` +
        (e.location ? `<p>${e.location}</p>` : "") +
        `<a href="/archive/${e.slug}">View story →</a>`
      );
      return new maplibregl.Marker({ element: el }).setLngLat([e.longitude, e.latitude]).setPopup(popup).addTo(m);
    });
  }, [results]);

  function toggleCat(slug: string) {
    setCats((prev) => (prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]));
  }

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <details className="border-b border-ink/10 md:hidden" open={false}>
        <summary className="wrap cursor-pointer py-4 font-mono text-xs tracking-[0.2em] uppercase">
          Filters — {results.length} markers
        </summary>
        <div className="wrap pb-6">
          <FilterControls
            idSuffix="m"
            query={query}
            setQuery={setQuery}
            cats={cats}
            toggleCat={toggleCat}
            limit={limit}
            setLimit={(y) => setMaxYear(y)}
            min={bounds.min}
            max={bounds.max}
          />
        </div>
      </details>

      <aside className="hidden w-80 shrink-0 flex-col gap-8 overflow-y-auto border-r border-ink/10 p-6 md:flex" aria-label="Map filters">
        <p className="font-mono text-xs tracking-[0.25em] text-muted uppercase">Explore history</p>
        <FilterControls
          idSuffix="d"
          query={query}
          setQuery={setQuery}
          cats={cats}
          toggleCat={toggleCat}
          limit={limit}
          setLimit={(y) => setMaxYear(y)}
          min={bounds.min}
          max={bounds.max}
        />
        <p role="status" className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
          {results.length} markers · map {mapState}
          {mapNote ? ` — ${mapNote}` : " · locations approximate"}
        </p>
      </aside>

      <div className="relative min-h-[60vh] flex-1">
        {mapState === "error" ? (
          <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-paper-deep/40 p-8 text-center">
            <p className="font-display text-3xl uppercase">Map unavailable</p>
            <p className="max-w-md text-sm leading-relaxed text-secondary">{mapNote}</p>
            <p className="font-mono text-xs text-muted">The catalogue below still works — every record stays readable.</p>
          </div>
        ) : (
          <div ref={container} className="archive-map absolute inset-0 min-h-[60vh]" role="application" aria-label="Historical map" />
        )}
      </div>
    </div>
  );
}

function FilterControls(props: {
  idSuffix: string;
  query: string;
  setQuery: (q: string) => void;
  cats: string[];
  toggleCat: (slug: string) => void;
  limit: number;
  setLimit: (y: number) => void;
  min: number;
  max: number;
}) {
  const { idSuffix, query, setQuery, cats, toggleCat, limit, setLimit, min, max } = props;
  return (
    <>
      <div>
        <label htmlFor={`map-search-${idSuffix}`} className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
          Search location
        </label>
        <input
          id={`map-search-${idSuffix}`}
          type="search"
          value={query}
          onChange={(ev) => setQuery(ev.target.value)}
          placeholder="Search places, titles..."
          className="mt-2 w-full border-b border-ink/25 bg-transparent py-2 text-lg placeholder:text-muted/60 focus:border-accent focus:outline-none"
        />
      </div>
      <div>
        <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">Filter</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              type="button"
              aria-pressed={cats.includes(c.slug)}
              onClick={() => toggleCat(c.slug)}
              className={`min-h-[44px] border px-3 py-1.5 text-xs tracking-[0.1em] uppercase transition-colors ${cats.includes(c.slug)
                  ? "border-accent bg-accent text-paper"
                  : "border-ink/25 text-ink hover:border-accent hover:text-accent"
                }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor={`map-year-${idSuffix}`} className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
          Up to year — {limit < 0 ? `${Math.abs(limit)} BC` : limit}
        </label>
        <input
          id={`map-year-${idSuffix}`}
          type="range"
          min={min}
          max={max}
          value={limit}
          onChange={(ev) => setLimit(Number(ev.target.value))}
          className="mt-3 w-full accent-accent"
        />
        <div className="flex justify-between font-mono text-xs text-muted">
          <span>{min < 0 ? `${Math.abs(min)} BC` : min}</span>
          <span>{max}</span>
        </div>
      </div>
    </>
  );
}
