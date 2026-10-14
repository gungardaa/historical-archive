import Link from "next/link";
import ArchiveImage from "@/components/ArchiveImage";
import type { KeyFigure } from "@/types/archive";

export default function KeyFigureCard({ figure }: { figure: KeyFigure }) {
  const body = (
    <div className="group flex h-full gap-5 border border-ink/10 bg-paper p-5">
      <div className="w-28 shrink-0 sm:w-32">
        <ArchiveImage src="/images/placeholder.svg" alt={`${figure.name} — portrait pending`} ratio="portrait" />
      </div>
      <div className="min-w-0">
        <p className="font-display text-xl leading-snug">{figure.name}</p>
        {figure.role && <p className="mt-1 text-xs tracking-[0.15em] text-muted uppercase">{figure.role}</p>}
        {figure.description && <p className="mt-2 text-sm leading-relaxed text-secondary">{figure.description}</p>}
      </div>
    </div>
  );

  // ponytail: no person routes — links only to entries that exist; standalone bios if people pages land.
  if (!figure.entrySlug) return body;
  return (
    <Link href={`/archive/${figure.entrySlug}`} className="block h-full">
      {body}
    </Link>
  );
}
