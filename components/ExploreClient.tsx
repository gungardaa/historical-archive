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

  return (
    <div>
      <h1 className="sr-only">Explore the archive</h1>
      <SectionHeading eyebrow="Catalogue — 35 records" title="Explore the archive" />

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
        <div>
          <label htmlFor="archive-sort" className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
            Sort
          </label>
          <select
            id="archive-sort"
            value={sort}
            onChange={(ev) => set({ q: params.get("q") ?? "", cat: cat === "all" ? "" : cat, sort: ev.target.value })}
            className="ml-3 border border-ink/25 bg-transparent px-3 py-2 text-sm"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
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
            {results.slice(0, 4).map((entry) => (
              <EntryCard key={entry.id} entry={entry} variant="editorial" />
            ))}
          </div>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.slice(4).map((entry) => (
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
