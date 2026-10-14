"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { displayYear } from "@/lib/displayYear";
import { groupByYear } from "@/lib/timeline";
import type { HistoricalEntry } from "@/types/archive";

function yearLabel(year: number): string {
  return year < 0 ? `${Math.abs(year)} BC` : String(year);
}

export default function TimelineBoard({ entries }: { entries: HistoricalEntry[] }) {
  const track = useRef<HTMLDivElement>(null);
  const groups = useMemo(() => groupByYear(entries), [entries]);
  const min = groups[0]?.year ?? 0;
  const max = groups[groups.length - 1]?.year ?? 0;
  const [pos, setPos] = useState(min);
  // ponytail: linear nearest-group scan (≤35 groups) — binary search if the collection ever scales.
  const nearest = groups.reduce((a, b) => (Math.abs(b.year - pos) < Math.abs(a.year - pos) ? b : a), groups[0]);

  function jumpTo(year: number) {    const el = track.current?.querySelector(`[data-year="${year}"]`);
    if (el) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", inline: "center", block: "nearest" });
      return;
    }
    // ponytail: nearest-event fallback, never a dead chip — sticky scroll-spy if chips prove insufficient.
    const years = groups.map((g) => g.year);
    const nearest = years.reduce((a, b) => (Math.abs(b - year) < Math.abs(a - year) ? b : a), years[0]);
    track.current?.querySelector(`[data-year="${nearest}"]`)?.scrollIntoView({ inline: "center", block: "nearest" });
  }

  // ponytail: scroll writes state only, never scrolls back — the loop is impossible by
  // construction; jumpTo stays the sole scroller. Linear scans, rAF-throttle past ~200 groups.
  function syncFromRail() {
    const t = track.current;
    if (!t) return;
    const center = t.scrollLeft + t.clientWidth / 2;
    let best = groups[0];
    let bestDist = Infinity;
    for (const node of t.querySelectorAll("[data-year]")) {
      const section = node as HTMLElement;
      const year = Number(section.dataset.year);
      const dist = Math.abs(section.offsetLeft + section.offsetWidth / 2 - center);
      if (dist < bestDist) {
        bestDist = dist;
        best = groups.find((g) => g.year === year) ?? best;
      }
    }
    if (best) setPos(best.year);
  }

  useEffect(() => {
    function onWindowScroll() {
      const t = track.current;
      if (!t || window.innerWidth >= 768) return;
      const middle = window.innerHeight / 2;
      let best: number | null = null;
      let bestDist = Infinity;
      for (const node of t.querySelectorAll("[data-year]")) {
        const r = (node as HTMLElement).getBoundingClientRect();
        const dist = r.top <= middle && middle <= r.bottom ? 0 : Math.min(Math.abs(r.top - middle), Math.abs(r.bottom - middle));
        if (dist < bestDist) {
          bestDist = dist;
          best = Number((node as HTMLElement).dataset.year);
        }
      }
      if (best !== null) setPos(best);
    }
    window.addEventListener("scroll", onWindowScroll, { passive: true });
    return () => window.removeEventListener("scroll", onWindowScroll);
  }, []);

  return (
    <div>
      <div className="mt-8 border-y border-ink/10 py-6">
        <p className="max-w-xs text-sm text-secondary">
          Nearest record — {nearest ? nearest.entries[0].title : "—"}
        </p>
        <label htmlFor="timeline-scrub" className="mt-4 block font-mono text-xs tracking-[0.2em] text-muted uppercase">
          Scrub through time
        </label>
        {/* ponytail: percent-positioned badge, no thumb measuring — clamp 4–96% so it never overflows the rail ends. */}
        <div className="relative mt-16">
          <div
            aria-hidden="true"
            style={{ left: `${Math.min(96, Math.max(4, ((pos - min) / Math.max(1, max - min)) * 100))}%` }}
            className="absolute -top-14 -translate-x-1/2"
          >
            <p className="border border-ink/20 bg-paper px-3 py-1.5 font-mono text-sm tracking-[0.15em] whitespace-nowrap">
              {yearLabel(pos)}
            </p>
            <span aria-hidden="true" className="-mt-[7px] mx-auto block h-2.5 w-2.5 rotate-45 border-r border-b border-ink/20 bg-paper" />
          </div>
          <input
            id="timeline-scrub"
            type="range"
            min={min}
            max={max}
            step={1}
            value={pos}
            aria-valuetext={yearLabel(pos)}
            onChange={(ev) => {
              const y = Number(ev.target.value);
              setPos(y);
              jumpTo(y);
            }}
            className="w-full accent-accent"
          />
        </div>
        <div className="flex justify-between font-mono text-xs text-muted" aria-hidden="true">
          <span>{yearLabel(min)}</span>
          <span>{yearLabel(max)}</span>
        </div>
      </div>

      <div
        ref={track}
        role="list"
        aria-label="Chronological archive. Use arrow keys to scroll on desktop."
        tabIndex={0}
        onScroll={syncFromRail}
        className="timeline-rail mt-8 flex flex-col gap-10 md:snap-x md:snap-mandatory md:flex-row md:gap-10 md:overflow-x-auto md:pb-3"
      >
        {groups.map((g) => (
          <section
            key={g.year}
            role="listitem"
            data-year={g.year}
            className="md:w-80 md:shrink-0 md:snap-center"
          >
            <p className="font-display text-4xl">{g.label}</p>
            <hr className="mt-3 border-accent" />
            <ul className="mt-5 space-y-5">
              {g.entries.map((e) => (
                <li key={e.id}>
                  <Link href={`/archive/${e.slug}`} className="group block border border-ink/10 bg-paper p-4 transition-colors hover:border-accent/40">
                    <p className="font-mono text-xs text-muted">{displayYear(e.startDate)}</p>
                    <p className="font-display mt-1 text-xl leading-snug transition-colors group-hover:text-accent">
                      {e.title}
                    </p>
                    <p className="mt-1 text-xs tracking-[0.2em] text-muted uppercase">{e.category}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
