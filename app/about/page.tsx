import Button from "@/components/Button";

export const metadata = {
  title: "About",
  description: "What the Historical Archive is, and how its entries are chosen.",
};

export default function AboutPage() {
  return (
    <main className="wrap flex-1 py-16 sm:py-24">
      <p className="font-mono text-xs tracking-[0.25em] text-muted uppercase">About the archive</p>
      <h1 className="font-display mt-6 max-w-3xl text-5xl leading-[1.05] sm:text-7xl">
        History is enormous.
      </h1>
      <div className="mt-8 max-w-2xl space-y-6 text-lg leading-relaxed text-secondary">
        <p>This archive is not an attempt to contain all of it.</p>
        <p>
          It is a collection of stories worth remembering, discovering, and occasionally falling
          down a rabbit hole into.
        </p>
        <p>Every entry is selected and researched independently.</p>
      </div>

      <hr className="my-16 border-ink/10" />

      <section className="max-w-2xl">
        <h2 className="font-mono text-xs tracking-[0.25em] text-muted uppercase">Sources</h2>
        <p className="mt-4 leading-relaxed text-secondary">
          Each historical entry includes its sources and references where applicable.
        </p>
        {/* ponytail: static honesty note, not a CMS field — remove once per-entry sources are curated. */}
        <p className="mt-3 font-mono text-xs tracking-[0.1em] text-muted uppercase">
          Per-entry source lists are being curated and will appear on entry pages as they land.
        </p>
      </section>

      <div className="mt-16 flex flex-wrap gap-4">
        <Button href="/explore">Explore the archive</Button>
        <Button href="/random" variant="secondary">
          Random entry ↗
        </Button>
      </div>
    </main>
  );
}
