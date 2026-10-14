"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import EntryCard from "@/components/EntryCard";
import SectionHeading from "@/components/SectionHeading";
import { searchEntries } from "@/lib/search";
import { parseYear } from "@/lib/timeline";
import type { CategorySlug, HistoricalEntry } from "@/types/archive";

const FILTERS: Array<{ value: CategorySlug | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "wars", label: "Wars" },
  { value: "battles", label: "Battles" },
  { value: "people", label: "People" },
  { value: "empires", label: "Empires" },
  { value: "technology", label: "Technology" },
  { value: "oddities", label: "Oddities" },
];

const SORTS = [
  { value: "relevance", label: "Relevance" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "title", label: "Title A–Z" },
] as const;

type Sort = (typeof SORTS)[number]["value"];

export default function ExploreClient({ entries }: { entries: HistoricalEntry[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const input = useRef<HTMLInputElement>(null);
  const keyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // ponytail: local draft + 150ms URL write — per-keystroke router.replace churned history and grid; flush faster if search feels laggy.
  // Draft initializes from the URL once; Clear/Esc reset it explicitly. Browser back/forward
  // while focused is the known edge — results always follow the URL, the text refreshes on next keystroke.
  const [draft, setDraft] = useState(params.get("q") ?? "");
  const [sortOpen, setSortOpen] = useState(false);
  const sortBtn = useRef<HTMLButtonElement>(null);
  const sortBox = useRef<HTMLDivElement>(null);

  const q = (params.get("q") ?? "").toLowerCase();
  const rawCat = params.get("cat") ?? "all";
  const cat = FILTERS.some((f) => f.value === rawCat) ? rawCat : "all";
  const rawSort = params.get("sort") ?? "relevance";
  const sort: Sort = SORTS.some((s) => s.value === rawSort) ? (rawSort as Sort) : "relevance";

  function set(next: Record<string, string>) {
    const merged = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) merged.set(k, v);
      else merged.delete(k);
    }
    router.replace(`${pathname}?${merged.toString()}`, { scroll: false });
  }

  function onType(value: string) {
    setDraft(value);
    clearTimeout(keyTimer.current);
    keyTimer.current = setTimeout(() => set({ q: value, cat, sort }), 150);
  }

  function clearAll() {
    clearTimeout(keyTimer.current);
    setDraft("");
    router.replace(pathname, { scroll: false });
  }

  useEffect(() => () => clearTimeout(keyTimer.current), []);

  // ponytail: button-per-option listbox, not roving-tabindex radios — arrow keys move focus,
  // Enter/Space come free with buttons; full APG grid if screen-reader users ask for more.
  useEffect(() => {
    if (!sortOpen) return;
    function onDown(ev: PointerEvent) {
      if (!sortBox.current?.contains(ev.target as Node)) {
        setSortOpen(false);
        sortBtn.current?.focus();
      }
    }
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") {
        setSortOpen(false);
        sortBtn.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [sortOpen]);

  function moveOption(idx: number, dir: 1 | -1) {
    const items = [...(sortBox.current?.querySelectorAll('[role="option"] > button') ?? [])] as HTMLElement[];
    const next = items[idx + dir];
    (next ?? sortBtn.current)?.focus();
  }

  // ponytail: "/" focuses, Esc clears query only (category/sort kept) — full result-list nav if keyboard users ask for it.
  useEffect(() => {
    function onKey(ev: KeyboardEvent) {
      const tag = (ev.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if (ev.key === "/" && !typing) {
        ev.preventDefault();
        input.current?.focus();
      } else if (ev.key === "Escape" && document.activeElement === input.current) {
        clearTimeout(keyTimer.current);
        setDraft("");
        set({ q: "", cat, sort });
        input.current?.blur();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, pathname]);

  const results = useMemo(() => {
    const inCat = entries.filter((e) => cat === "all" || e.category === cat);
    const ranked = searchEntries(inCat, q);
    switch (sort) {
      case "newest":
        ranked.sort((a, b) => parseYear(b.entry.startDate) - parseYear(a.entry.startDate));
        break;
      case "oldest":
        ranked.sort((a, b) => parseYear(a.entry.startDate) - parseYear(b.entry.startDate));
        break;
      case "title":
        ranked.sort((a, b) => a.entry.title.localeCompare(b.entry.title));
        break;
      default:
        ranked.sort(
          (a, b) => b.score - a.score || parseYear(b.entry.startDate) - parseYear(a.entry.startDate)
        );
        break;
    }
    return ranked.map((r) => r.entry);
  }, [q, cat, sort, entries]);

  const isBrowsing = !q && cat === "all" && sort === "relevance";
  // ponytail: hand-picked shelf, not an algorithm — rotate the slugs when it goes stale.
  const FEATURED = ["battle-of-midway", "siege-of-constantinople", "world-war-ii", "september-11-attacks"];
  const shelf = FEATURED.map((slug) => entries.find((e) => e.slug === slug)).filter(
    (e): e is HistoricalEntry => e !== undefined
  );
  const shelfSlugs = new Set(shelf.map((e) => e.slug));

  return (
    <div>
      <h1 className="sr-only">Explore the archive</h1>
      <SectionHeading eyebrow={`Catalogue — ${entries.length} records`} title="Explore the archive" />

      <div className="mt-10">
        <label htmlFor="archive-search" className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
          Search the archive <span className="normal-case text-muted/70">(press / to focus)</span>
        </label>
        <input
          id="archive-search"
          ref={input}
          type="search"
          value={draft}
          onChange={(ev) => onType(ev.target.value)}
          placeholder="Search events, people, places..."
          className="mt-2 w-full border-b border-ink/25 bg-transparent py-3 font-display text-2xl placeholder:text-muted/60 focus:border-accent focus:outline-none"
        />
      </div>

      <div className="mt-8">
        <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">Filter</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={cat === f.value}
              onClick={() => set({ q: params.get("q") ?? "", cat: f.value === "all" ? "" : f.value, sort })}
              className={`min-h-[44px] border px-4 py-2 text-sm tracking-[0.1em] uppercase transition-colors ${
                cat === f.value
                  ? "border-accent bg-accent text-paper"
                  : "border-ink/25 text-ink hover:border-accent hover:text-accent"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <p role="status" className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
          {q ? `"${params.get("q")}" — ${results.length} found` : `${results.length} archived stories`}
        </p>
        <div ref={sortBox} className="relative">
          <span id="archive-sort-label" className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
            Sort
          </span>
          <button
            ref={sortBtn}
            type="button"
            id="archive-sort-button"
            aria-haspopup="listbox"
            aria-expanded={sortOpen}
            aria-labelledby="archive-sort-label archive-sort-button"
            onClick={() => setSortOpen(!sortOpen)}
            className="ml-3 min-h-[44px] border border-ink/25 bg-transparent px-3 py-2 text-left text-sm"
          >
            {SORTS.find((s) => s.value === sort)?.label}
            <span aria-hidden="true" className="ml-2 text-muted">{sortOpen ? "▴" : "▾"}</span>
          </button>
          {sortOpen && (
            <ul role="listbox" aria-labelledby="archive-sort-label" className="absolute right-0 z-30 mt-2 min-w-44 border border-ink/15 bg-paper py-1">
              {SORTS.map((s, idx) => (
                <li key={s.value} role="option" aria-selected={sort === s.value}>
                  <button
                    type="button"
                    onClick={() => {
                      set({ q: params.get("q") ?? "", cat: cat === "all" ? "" : cat, sort: s.value });
                      setSortOpen(false);
                      sortBtn.current?.focus();
                    }}
                    onKeyDown={(ev) => {
                      if (ev.key === "ArrowDown") {
                        ev.preventDefault();
                        moveOption(idx, 1);
                      } else if (ev.key === "ArrowUp") {
                        ev.preventDefault();
                        moveOption(idx, -1);
                      }
                    }}
                    className={`block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-ink/5 hover:text-accent ${
                      sort === s.value ? "font-medium text-accent" : "text-ink"
                    }`}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <hr className="mt-6 border-ink/10" />

      {results.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-display text-5xl uppercase">Nothing found</p>
          <p className="mx-auto mt-4 max-w-md text-secondary">
            The archive does not contain a story matching your search. Try another keyword.
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="mt-8 inline-flex items-center border border-ink/25 px-6 py-3 text-sm font-medium tracking-[0.12em] uppercase transition-colors hover:border-accent hover:text-accent"
          >
            Clear search
          </button>
        </div>
      ) : isBrowsing && results.length > 4 ? (
        /* ponytail: mixed rhythm only for the unfiltered shelf — filtered/searching stays scannable compact. */
        <div className="mt-10 space-y-10">
          <div>
            {shelf.map((entry) => (
              <EntryCard key={entry.id} entry={entry} variant="editorial" />
            ))}
          </div>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.filter((entry) => !shelfSlugs.has(entry.slug)).map((entry) => (
              <li key={entry.id}>
                <EntryCard entry={entry} variant="compact" />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((entry) => (
            <li key={entry.id}>
              <EntryCard entry={entry} variant="compact" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
