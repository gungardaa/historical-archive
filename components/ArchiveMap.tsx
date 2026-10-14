"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { CATEGORIES } from "@/lib/categories";
import { displayYear, displayYearNumber } from "@/lib/displayYear";
import { formatDate } from "@/lib/formatDate";
import { parseYear } from "@/lib/timeline";
import type { HistoricalEntry } from "@/types/archive";

// Tiles: OSM Standard (free, no key) + archival CSS filter in globals.css.
// To swap provider, change TILE_URL + ATTRIBUTION only. No secrets involved.
const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export default function ArchiveMap({ entries }: { entries: HistoricalEntry[] }) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<import("leaflet").Map | null>(null);
  const mapEl = useRef<HTMLDivElement | null>(null);
  const markers = useRef<import("leaflet").Marker[]>([]);
  const [query, setQuery] = useState("");
  const [cats, setCats] = useState<string[]>(CATEGORIES.map((c) => c.slug));
  const bounds = useMemo(() => {
    const years = entries.map((e) => parseYear(e.startDate));
    return { min: Math.min(...years), max: Math.max(...years) };
  }, [entries]);
  const [maxYear, setMaxYear] = useState<number | null>(null);
  const limit = maxYear ?? bounds.max;
  // ponytail: Leaflet needs no WebGL, so no capability probe — a dead map still renders as text, never a blank box.
  const [mapState, setMapState] = useState<"loading" | "ready" | "error">("loading");
  // ponytail: epoch, not mapState, drives markers — a preserved "ready" across remounts would
  // otherwise skip the first build. Functional increment always changes, so it always fires.
  const [mapEpoch, setMapEpoch] = useState(0);
  const [mapNote, setMapNote] = useState<string | null>(null);

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

  // ponytail: identity check, not state check — HMR remounts keep a stale "ready" while swapping
  // in a fresh div, and a state veto would skip init forever. Keyed remount if identity ever lies.
  function dropStaleMap() {
    if (map.current && mapEl.current !== container.current) {
      map.current.remove();
      map.current = null;
      mapEl.current = null;
    }
  }

  useEffect(() => {
    if (!container.current) return;
    dropStaleMap();
    if (map.current || mapState === "error") return;
    let dead = false;
    // ponytail: dynamic leaflet (à la the-strange-atlas), no react-leaflet wrapper —
    // static import if markers ever need SSR. Re-check bounds if markers leave the world map.
    (async () => {
      try {
        const L = await import("leaflet");
        if (dead || !container.current) return;
        dropStaleMap();
        if (map.current) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const m = L.map(container.current, {
          worldCopyJump: false,
          zoomControl: false,
          minZoom: 2,
          // ponytail: lng fence at ±300 — every marker (all inside ±180) stays
          // reachable with its popup, hard wall at 1.0 so nobody wanders the void.
          // Lat stays ±90: Web Mercator has no tiles past 85.05°, widening it is meaningless.
          maxBounds: L.latLngBounds(L.latLng(-90, -300), L.latLng(90, 300)),
          maxBoundsViscosity: 1.0,
        }).setView([35, 20], 2);
        L.control.zoom({ position: "topright" }).addTo(m);
        L.tileLayer(TILE_URL, { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(m);
        m.attributionControl.setPrefix(false);
        map.current = m;
        mapEl.current = container.current;
        setMapState("ready");
        setMapEpoch((e) => e + 1);
        m.fitBounds(
          L.latLngBounds(entries.map((e) => L.latLng(e.latitude, e.longitude))),
          { padding: [40, 40], animate: !reduce }
        );
        // ponytail: one re-measure for flex/absolute containers born at zero size — resize listener if layout ever shifts under the map.
        m.invalidateSize();
      } catch (err) {
        if (!dead) {
          reportMapFailure(err instanceof Error ? err.message : "The map failed to start.");
        }
      }
    })();
    return () => {
      dead = true;
      map.current?.remove();
      map.current = null;
      mapEl.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapState]);

  // ponytail: destroy + rebuild markers per filter (50 max) — diff/update if entries pass ~200.
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    let dead = false;
    import("leaflet").then((L) => {
      if (dead || map.current !== m) return;
      for (const mk of markers.current) mk.remove();
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      markers.current = results.map((e) => {
        const icon = L.divIcon({
          className: "",
          html:
            `<div class="archive-marker"><span></span><em>${displayYear(e.startDate)}</em></div>`,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });
        const marker = L.marker([e.latitude, e.longitude], {
          icon,
          alt: `${e.title}, ${displayYear(e.startDate)}`,
          keyboard: true,
        });
        marker.bindPopup(
          `<p>${e.category.toUpperCase()} · ${formatDate(e.startDate)}</p>` +
            `<h3>${e.title}</h3>` +
            (e.location ? `<p>${e.location}</p>` : "") +
            `<a href="/archive/${e.slug}">View story →</a>`,
          { offset: [0, -18], className: "archive-popup", maxWidth: 240, autoPanPadding: [24, 24] }
        );
        // ponytail: stack tap zooms instead of guessing which label won; a lone far marker
        // flies to zoom 4 so edge popups land fully in view — cluster lib past ~200 markers.
        marker.on("click", () => {
          const mm = map.current;
          if (!mm || map.current !== m) return;
          const pt = mm.latLngToContainerPoint(marker.getLatLng());
          let near = 0;
          for (const other of markers.current) {
            const q = mm.latLngToContainerPoint(other.getLatLng());
            if (Math.hypot(q.x - pt.x, q.y - pt.y) < 28) near++;
          }
          if (near > 1 && mm.getZoom() < 12) {
            mm.zoomIn(1, { animate: !reduceMotion });
            return;
          }
          if (mm.getZoom() < 4) {
            // ponytail: close-then-reopen beats autopan-vs-flight fighting — the popup lands
            // once, after the flight, instead of interrupting it mid-air.
            marker.closePopup();
            mm.once("moveend", () => marker.openPopup());
            mm.flyTo([e.latitude, e.longitude], 4, { duration: reduceMotion ? 0 : 0.8 });
          }
        });
        return marker.addTo(m);
      });
    });
    return () => {
      dead = true;
    };
  }, [results, mapEpoch]);

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

      <aside className="hidden w-88 shrink-0 flex-col gap-8 overflow-y-auto border-r border-ink/10 p-6 md:flex" aria-label="Map filters">
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

      <div className="relative min-h-[70svh] flex-1 md:min-h-[60vh]">
        {mapState === "error" ? (
          <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-paper-deep/40 p-8 text-center">
            <p className="font-display text-3xl uppercase">Map unavailable</p>
            <p className="max-w-md text-sm leading-relaxed text-secondary">{mapNote}</p>
            {/* ponytail: state reset only — a stuck error retries without a full reload. */}
            <button
              type="button"
              onClick={() => {
                map.current?.remove();
                map.current = null;
                mapEl.current = null;
                setMapNote(null);
                setMapState("loading");
              }}
              className="mt-2 min-h-[44px] border border-ink/25 px-6 py-2 text-sm tracking-[0.12em] uppercase transition-colors hover:border-accent hover:text-accent"
            >
              Try again
            </button>
            <p className="font-mono text-xs text-muted">The catalogue below still works — every record stays readable.</p>
          </div>
        ) : (
          <>
            <div ref={container} className="archive-map absolute inset-0 min-h-[60vh]" role="application" aria-label="Historical map" />
            {mapState === "loading" && (
              <div className="absolute inset-0 flex items-center justify-center bg-paper">
                <p className="font-mono text-xs tracking-[0.25em] text-muted uppercase">Preparing the map…</p>
              </div>
            )}
          </>
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
        <div className="mt-3 grid grid-cols-3 gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              type="button"
              aria-pressed={cats.includes(c.slug)}
              onClick={() => toggleCat(c.slug)}
              className={`flex min-h-[44px] items-center justify-center border px-2 py-1.5 text-center text-xs tracking-[0.05em] uppercase transition-colors ${cats.includes(c.slug)
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
          Up to year — {displayYearNumber(limit)}
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
          <span>{displayYearNumber(min)}</span>
          <span>{max}</span>
        </div>
      </div>
    </>
  );
}
