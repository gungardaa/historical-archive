"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { displayYear, displayYearNumber } from "@/lib/displayYear";
import { groupByYear } from "@/lib/timeline";
import type { HistoricalEntry } from "@/types/archive";

export default function TimelineBoard({ entries }: { entries: HistoricalEntry[] }) {
  const track = useRef<HTMLDivElement>(null);
  const groups = useMemo(() => groupByYear(entries), [entries]);
  const min = groups[0]?.year ?? 0;
  const max = groups[groups.length - 1]?.year ?? 0;
  const [pos, setPos] = useState(min);
  // ponytail: scrub-owned scroll mutes the spy (140ms trailing) so the badge follows the
  // finger instead of jittering between slider value and group year. rAF past ~200 groups.
  const scrubbing = useRef(false);
  const raf = useRef(0);
  const endTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // ponytail: linear nearest-group scan (≤35 groups) — binary search if the collection ever scales.
  const nearest = groups.reduce((a, b) => (Math.abs(b.year - pos) < Math.abs(a.year - pos) ? b : a), groups[0]);

  useEffect(() => () => {
    cancelAnimationFrame(raf.current);
    clearTimeout(endTimer.current);
  }, []);

  function releaseScrub() {
    scrubbing.current = false;
    if (track.current) track.current.style.scrollSnapType = "";
  }

  function scrubTo(year: number) {
    const t = track.current;
    if (!t) return;
    // ponytail: 1:1 mapping like a native scrollbar — no per-tick animation to restart,
    // no rect measuring, nothing to fight snap. Snap returns on release; the spy (140ms)
    // settles the badge onto the group. No motion easing left, so reduced-motion is moot.
    const frac = (year - min) / Math.max(1, max - min);
    t.style.scrollSnapType = "none";
    t.scrollLeft = frac * (t.scrollWidth - t.clientWidth);
    clearTimeout(endTimer.current);
    endTimer.current = setTimeout(releaseScrub, 140);
  }

  // ponytail: scroll writes state only, never scrolls back — the loop is impossible by
  // construction; jumpTo stays the sole scroller.
  function syncFromRail() {
    const t = track.current;
    if (!t) return;
    if (scrubbing.current) {
      clearTimeout(endTimer.current);
      endTimer.current = setTimeout(releaseScrub, 140);
      return;
    }
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      const rail = track.current;
      if (!rail) return;
      const center = rail.scrollLeft + rail.clientWidth / 2;
      let best = groups[0];
      let bestDist = Infinity;
      for (const node of rail.querySelectorAll("[data-year]")) {
        const section = node as HTMLElement;
        const year = Number(section.dataset.year);
        const dist = Math.abs(section.offsetLeft + section.offsetWidth / 2 - center);
        if (dist < bestDist) {
          bestDist = dist;
          best = groups.find((g) => g.year === year) ?? best;
        }
      }
      if (best) setPos(best.year);
    });
  }

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
{displayYearNumber(pos)}
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
            aria-valuetext={displayYearNumber(pos)}
            onChange={(ev) => {
              const y = Number(ev.target.value);
              scrubbing.current = true;
              setPos(y);
              scrubTo(y);
            }}
            className="w-full accent-accent max-md:min-h-[44px]"
          />
        </div>
        <div className="flex justify-between font-mono text-xs text-muted" aria-hidden="true">
          <span>{displayYearNumber(min)}</span>
          <span>{displayYearNumber(max)}</span>
        </div>
      </div>

      <div
        ref={track}
        role="list"
        aria-label="Chronological archive. Use arrow keys to scroll."
        tabIndex={0}
        onScroll={syncFromRail}
        className="timeline-rail mt-8 flex snap-x snap-proximity flex-row gap-6 overflow-x-auto pb-3 md:snap-x md:snap-mandatory md:flex-row md:gap-10 md:overflow-x-auto md:pb-3"
      >
        {groups.map((g) => (
          <section
            key={g.year}
            role="listitem"
            data-year={g.year}
            className="w-[78vw] max-w-80 shrink-0 snap-center md:w-80 md:shrink-0 md:snap-center"
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
