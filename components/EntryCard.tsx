import Link from "next/link";
import ArchiveImage from "@/components/ArchiveImage";
import { formatDate } from "@/lib/formatDate";
import type { HistoricalEntry } from "@/types/archive";

export type EntryCardVariant = "standard" | "compact" | "editorial" | "list";

// ponytail: four static branches, no card-builder abstraction — deleted oversized feature variant (explore now reuses editorial); restore it if a true hero-card slot returns.
export default function EntryCard({
  entry,
  variant = "standard",
}: {
  entry: HistoricalEntry;
  variant?: EntryCardVariant;
}) {
  const href = `/archive/${entry.slug}`;
  const date = <p className="font-mono text-xs text-accent">{formatDate(entry.startDate)}</p>;
  const meta = (
    <p className="mt-1 text-xs tracking-[0.2em] text-muted uppercase">{entry.category}</p>
  );

  if (variant === "list") {
    return (
      <Link href={href} className="group block border-b border-ink/10 py-4">
        <p className="font-mono text-xs text-muted">{formatDate(entry.startDate)}</p>
        <span className="font-display mt-1 block text-2xl leading-snug transition-colors group-hover:text-accent">
          {entry.title}
        </span>
        {meta}
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={href} className="group flex gap-4 border border-ink/10 bg-paper p-3">
        <div className="w-20 shrink-0">
          <ArchiveImage src={entry.heroImage} alt={`${entry.title} — archival plate`} ratio="card" />
        </div>
        <div className="min-w-0">
          {date}
          <span className="font-display mt-1 block text-lg leading-snug">{entry.title}</span>
          <span className="mt-1 block truncate text-sm text-secondary">{entry.shortDescription}</span>
        </div>
      </Link>
    );
  }

  if (variant === "editorial") {
    return (
      <Link href={href} className="group grid gap-5 border-b border-ink/10 py-6 sm:grid-cols-[1fr_12rem]">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">
            {entry.category} · {formatDate(entry.startDate)}
          </p>
          <span className="font-display mt-2 block text-3xl leading-tight transition-colors group-hover:text-accent">
            {entry.title}
          </span>
          <span className="mt-2 block max-w-xl leading-relaxed text-secondary">
            {entry.shortDescription}
          </span>
        </div>
        <ArchiveImage src={entry.heroImage} alt={`${entry.title} — archival plate`} ratio="card" />
      </Link>
    );
  }

  return (
    <Link href={href} className="block">
      <article className="group h-full border border-ink/10 bg-paper transition-colors hover:border-accent/40">
        <div className="transition-transform duration-300 group-hover:scale-[1.02]">
          <ArchiveImage src={entry.heroImage} alt={`${entry.title} — archival plate`} ratio="card" />
        </div>
        <div className="p-5">
          {date}
          <h3 className="font-display mt-2 text-2xl leading-snug transition-colors group-hover:text-accent">{entry.title}</h3>
          {meta}
          <p className="mt-3 text-sm leading-relaxed text-secondary">{entry.shortDescription}</p>
        </div>
      </article>
    </Link>
  );
}
