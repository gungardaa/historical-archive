import Link from "next/link";
import Button from "@/components/Button";
import Lightbox from "@/components/Lightbox";
import RandomPicker from "@/components/RandomPicker";
import SectionHeading from "@/components/SectionHeading";
import { getAllEntries } from "@/lib/archive";
import { CATEGORIES } from "@/lib/categories";
import { displayYear } from "@/lib/displayYear";
import { formatDate } from "@/lib/formatDate";

export default async function Home() {
  const entries = await getAllEntries();
  const [featured, ...rest] = entries;
  const discoveries = rest.slice(0, 6);

  return (
    <main className="flex-1">
      {/* Hero — fills the first viewport (100svh minus the 73px sticky header) so the
          featured band starts below the fold. Content rides the vertical middle. */}
      <section className="wrap grid min-h-[calc(100svh-73px)] items-center gap-10 py-12 sm:py-24 xl:grid-cols-2">
        <div>
          <p className="font-mono text-xs tracking-[0.25em] text-muted uppercase">
            Historical Archive
          </p>
          <h1 className="font-display mt-6 text-5xl leading-[1.02] sm:text-7xl">
            Stories that shaped
            <br />
            the world.
          </h1>
          <p className="mt-6 max-w-md leading-relaxed text-secondary">
            Explore wars, people, empires, inventions, strange events, and forgotten moments.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 max-sm:flex-col max-sm:items-stretch">
            <Button href="/explore">Explore the archive</Button>
            <Button href="/random" variant="secondary">
              Random entry ↗
            </Button>
          </div>
        </div>
        <figure>
          <Lightbox
            src="/images/plates/battle-of-midway.svg"
            alt="Battle of Midway — archival plate"
            ratio="feature"
            priority
            meta={{ title: "Featured record", date: "04 June 1942", source: "Local archive plate" }}
            triggerLabel="Featured record"
          />
          <figcaption className="mt-2 flex flex-wrap justify-between gap-2 font-mono text-xs text-muted">
            <span>Fig. 01 — Featured record</span>
            <span className="text-accent">ARCHIVE 001</span>
          </figcaption>
        </figure>
      </section>

      {/* Featured */}
      {featured && (
        <section className="border-y border-ink/10 bg-paper-deep/40">
          <div className="wrap grid gap-10 py-16 lg:grid-cols-2">
            <Lightbox
              src={featured.heroImage}
              alt={`${featured.title} — archival plate`}
              ratio="card"
              meta={{ title: featured.title, date: formatDate(featured.startDate), source: "Local archive plate" }}
              triggerLabel={featured.title}
            />
            <div>
              <SectionHeading eyebrow="Featured from the archive" title={featured.title} />
              <p className="mt-4 font-mono text-sm tracking-[0.1em] text-accent uppercase">
                {formatDate(featured.startDate)}
              </p>
              <p className="mt-2 text-xs tracking-[0.2em] text-muted uppercase">
                {(featured.tags ?? [featured.category]).join(" · ")}
              </p>
              <p className="mt-4 leading-relaxed text-secondary">{featured.overview}</p>
              <div className="mt-6">
                <Button href={`/archive/${featured.slug}`} variant="secondary">
                  Open archive →
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="wrap py-16 sm:py-20">
        <SectionHeading eyebrow="Cat. I–VI — Index" title="Explore by category" />
        <div className="mt-10 grid gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <Link key={cat.slug} href={`/category/${cat.slug}`} className="group bg-ink p-6 text-paper sm:p-8">
              <div className="transition-transform duration-300 group-hover:scale-[1.02]">
                <p className="font-mono text-xs text-paper/50">{cat.slug.toUpperCase()}</p>
                <h3 className="font-display mt-3 text-3xl uppercase transition-transform duration-300 group-hover:translate-x-1">
                  {cat.label}
                </h3>
                <p className="mt-2 text-sm text-paper/70">{cat.note}</p>
                <p aria-hidden="true" className="mt-6 text-accent opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 max-md:opacity-100">
                  → Browse
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest discoveries */}
      <section id="discoveries" className="wrap scroll-mt-20 pb-16 sm:pb-20">
        <SectionHeading eyebrow="Recent catalogue additions" title="Latest discoveries" />
        <ol className="mt-4 divide-y divide-ink/10">
          {discoveries.map((entry, i) => (
            <li key={entry.id} className="grid grid-cols-[3rem_1fr] gap-4 py-6">
              <span className="font-display text-2xl text-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              <Link href={`/archive/${entry.slug}`} className="group block">
                <h3 className="font-display text-2xl leading-snug transition-colors group-hover:text-accent sm:text-3xl">{entry.title}</h3>
                <p className="mt-1 font-mono text-xs tracking-[0.15em] text-muted uppercase">
                  {displayYear(entry.startDate)} ·{" "}
                  {entry.country ?? entry.location ?? entry.category}
                </p>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* Random */}
      <section id="random" className="scroll-mt-20 border-t border-ink/10 bg-ink text-paper">
        <div className="wrap py-20 text-center sm:py-28">
          <p className="font-mono text-xs tracking-[0.25em] text-paper/60 uppercase">
            Don&apos;t know what to explore?
          </p>
          <h2 className="font-display mx-auto mt-4 max-w-2xl text-5xl leading-tight sm:text-6xl">
            Let history decide.
          </h2>
          <div className="mt-8 flex justify-center">
            <RandomPicker entries={entries} />
          </div>
        </div>
      </section>
    </main>
  );
}
