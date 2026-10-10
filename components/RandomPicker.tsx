"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import { formatDate } from "@/lib/formatDate";
import type { HistoricalEntry } from "@/types/archive";

type Phase = "idle" | "searching" | "revealed";

export default function RandomPicker({
  autoStart = false,
  entries,
}: {
  autoStart?: boolean;
  entries: HistoricalEntry[];
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [entry, setEntry] = useState<HistoricalEntry | undefined>(undefined);
  // ponytail: session-only seen-set, silent reshuffle when exhausted — persist to localStorage if cross-visit memory matters.
  const seen = useRef<Set<string>>(new Set());
  const started = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const surprise = useCallback(() => {
    setPhase("searching");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const pool = entries.filter((e) => !seen.current.has(e.slug));
      const fresh = pool.length > 0 ? pool : entries;
      if (pool.length === 0) seen.current.clear();
      const pick = fresh[Math.floor(Math.random() * fresh.length)];
      if (pick) seen.current.add(pick.slug);
      setEntry(pick);
      setPhase("revealed");
    }, 700);
  }, [entries]);

  // ponytail: effect-held draw, not render-during-render — StrictMode double-invoke guarded by ref.
  useEffect(() => {
    if (!autoStart || started.current) return;
    started.current = true;
    surprise();
    return () => clearTimeout(timer.current);
  }, [autoStart, surprise]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div>
      {phase === "idle" && !autoStart && (
        <button
          type="button"
          onClick={surprise}
          className="inline-flex items-center gap-2 bg-accent px-6 py-3 text-sm font-medium tracking-[0.12em] text-paper uppercase transition-colors hover:bg-paper hover:text-ink"
        >
          Surprise me ↗
        </button>
      )}
      {(phase === "searching" || (phase === "idle" && autoStart)) && (
        <p role="status" className="font-mono text-xs tracking-[0.25em] text-paper/70 uppercase">
          Searching the archive…
        </p>
      )}
      {phase === "revealed" && entry && (
        <div className="page-enter mx-auto max-w-xl">
          <p className="font-mono text-xs tracking-[0.25em] text-paper/60 uppercase">
            Your next discovery
          </p>
          <p className="font-display mt-3 text-4xl sm:text-5xl">{entry.title}</p>
          <p className="mt-2 font-mono text-xs tracking-[0.15em] text-paper/70 uppercase">
            {formatDate(entry.startDate)} · {entry.category}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Button href={`/archive/${entry.slug}`}>Discover</Button>
            <button
              type="button"
              onClick={surprise}
              className="inline-flex items-center gap-2 border border-paper/30 px-6 py-3 text-sm font-medium tracking-[0.12em] uppercase transition-colors hover:border-paper hover:text-white"
            >
              Another one ↻
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
