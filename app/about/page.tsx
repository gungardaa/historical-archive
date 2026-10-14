import Button from "@/components/Button";

export const metadata = {
  title: "About",
  description: "What the Historical Archive is, and how its entries are chosen.",
};

export default function AboutPage() {
  return (
    <main className="wrap flex min-h-[calc(100svh-73px)] flex-1 flex-col py-10 sm:py-14">
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

      <hr className="my-10 border-ink/10" />

      <section className="max-w-2xl">
        <h2 className="font-mono text-xs tracking-[0.25em] text-muted uppercase">Sources</h2>
        <p className="mt-4 leading-relaxed text-secondary">
          Each historical entry closes with its selected references, drawn from museums, archives, and institutional collections.
        </p>
      </section>

      <div className="mt-10 flex flex-wrap gap-4">
        <Button href="/explore">Explore the archive</Button>
        <Button href="/random" variant="secondary">
          Random entry ↗
        </Button>
      </div>
    </main>
  );
}
