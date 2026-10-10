"use client";

import { useMemo, useRef } from "react";
import Link from "next/link";
import { displayYear } from "@/lib/displayYear";
import { ERAS, groupByYear } from "@/lib/timeline";
import type { HistoricalEntry } from "@/types/archive";

export default function TimelineBoard({ entries }: { entries: HistoricalEntry[] }) {
  const track = useRef<HTMLDivElement>(null);
  const groups = useMemo(() => groupByYear(entries), [entries]);

  function jumpTo(year: number) {
    const el = track.current?.querySelector(`[data-year="${year}"]`);
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

  return (
    <div>
      <div className="mt-10 flex flex-wrap gap-2" role="group" aria-label="Jump to era">
        {ERAS.map((era) => (
          <button
            key={era.label}
            type="button"
            onClick={() => jumpTo(era.year)}
            className="min-h-[44px] border border-ink/25 px-4 py-2 font-mono text-sm transition-colors hover:border-accent hover:text-accent"
          >
            {era.label}
          </button>
        ))}
      </div>

      <div
        ref={track}
        role="list"
        aria-label="Chronological archive. Use arrow keys to scroll on desktop."
        tabIndex={0}
        className="mt-12 flex flex-col gap-10 md:snap-x md:snap-mandatory md:flex-row md:gap-10 md:overflow-x-auto md:pb-6"
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
