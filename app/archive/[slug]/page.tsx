import { notFound } from "next/navigation";
import Button from "@/components/Button";
import EntryCard from "@/components/EntryCard";
import EntryTimeline from "@/components/EntryTimeline";
import KeyFigureCard from "@/components/KeyFigureCard";
import Lightbox from "@/components/Lightbox";
import SectionHeading from "@/components/SectionHeading";
import { getAllEntries, getEntryBySlug } from "@/lib/archive";
import { formatDate } from "@/lib/formatDate";

export async function generateStaticParams() {
  return (await getAllEntries()).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const entry = await getEntryBySlug((await params).slug);
  if (!entry) return { title: "Record not found" };
  return {
    title: entry.title,
    description: entry.shortDescription,
    openGraph: {
      title: `${entry.title} - Historical Archive`,
      description: entry.shortDescription,
      type: "article",
      images: [`/archive/${entry.slug}/opengraph-image`],
    },
    alternates: {
      canonical: `/archive/${entry.slug}`,
    },
  };
}

export default async function EntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const entry = await getEntryBySlug((await params).slug);
  if (!entry) notFound();

  const related = (
    await Promise.all((entry.relatedEntries ?? []).map((s) => getEntryBySlug(s)))
  )
    .filter((e) => e !== undefined)
    .slice(0, 3);
  // ponytail: deterministic slug-hash pick, not random — prerender-safe; true random lives in homepage RandomPicker.
  const all = await getAllEntries();
  const hash = [...entry.slug].reduce((a, c) => a + c.charCodeAt(0), 0);
  const surprise = all[(hash + 1) % all.length]?.slug === entry.slug
    ? all[(hash + 2) % all.length]
    : all[(hash + 1) % all.length];

  const period = entry.endDate
    ? `${formatDate(entry.startDate)} — ${formatDate(entry.endDate)}`
    : formatDate(entry.startDate);

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="wrap pt-16 sm:pt-20">
        <p className="font-mono text-xs tracking-[0.25em] text-accent uppercase">{entry.category}</p>
        <p className="mt-2 font-mono text-sm text-muted">{formatDate(entry.startDate)}</p>
        <h1 className="font-display mt-4 max-w-4xl text-5xl leading-[1.05] sm:text-7xl">
          {entry.title}
        </h1>
        {entry.subtitle && (
          <p className="font-display mt-3 text-2xl text-secondary italic">{entry.subtitle}</p>
        )}
        {entry.location && <p className="mt-4 text-sm tracking-[0.1em] uppercase">{entry.location}</p>}
      </section>

      {/* Overview + metadata */}
      <section className="wrap py-16">
        <SectionHeading eyebrow="Overview" title="The story" />
        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_24rem]">
          <div className="max-w-3xl space-y-5 text-lg leading-relaxed">
            {entry.overview.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          <figure>
            <Lightbox
              src={entry.heroImage}
              alt={`${entry.title} — archival plate`}
              ratio="feature"
              priority
              meta={{
                title: entry.title,
                date: formatDate(entry.startDate),
                location: entry.location,
                source: "Local archive plate",
              }}
              triggerLabel={entry.title}
            />
            <figcaption className="mt-2 flex flex-wrap justify-between gap-2 font-mono text-xs text-muted">
              <span>Fig. 01 — {entry.title}</span>
              <span className="text-accent">ARCHIVE {entry.id}</span>
            </figcaption>
          </figure>
        </div>
        <dl className="mt-10 grid gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Date", period],
            ["Location", entry.location ?? "—"],
            ["Category", entry.category],
            ["Tags", entry.tags?.slice(0, 3).join(", ") ?? "—"],
          ].map(([k, v]) => (
            <div key={k} className="bg-paper p-5">
              <dt className="font-mono text-xs tracking-[0.2em] text-muted uppercase">{k}</dt>
              <dd className="mt-2 text-sm leading-relaxed">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Significance */}
      {entry.historicalSignificance && (
        <section className="border-y border-ink/10 bg-paper-deep/40">
          <div className="wrap py-16">
            <SectionHeading eyebrow="Why it matters" title="Historical significance" />
            <p className="font-display mt-6 max-w-3xl text-3xl leading-snug sm:text-4xl">
              {entry.historicalSignificance}
            </p>
          </div>
        </section>
      )}

      {/* Context — prose, no box */}
      {entry.historicalContext && (
        <section className="wrap py-16">
          <SectionHeading eyebrow="Before" title="Historical context" />
          <div className="mt-6 max-w-3xl space-y-5 leading-relaxed text-secondary">
            {entry.historicalContext.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>
      )}

      {/* Causes — ruled list, no boxes */}
      {entry.causes && entry.causes.length > 0 && (
        <section className="wrap pb-16">
          <SectionHeading eyebrow="Why it happened" title="Causes" />
          <ol className="mt-6 max-w-3xl divide-y divide-ink/10 border-y border-ink/10">
            {entry.causes.map((cause, i) => (
              <li key={i} className="grid grid-cols-[2.5rem_1fr] gap-3 py-4">
                <span className="font-mono text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
                <p className="leading-relaxed">{cause}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Key moments — narrative, distinct from the ledger timeline */}
      {entry.keyEvents && entry.keyEvents.length > 0 && (
        <section className="wrap pb-16">
          <SectionHeading eyebrow="Turning points" title="Key moments" />
          <div className="mt-6 max-w-3xl space-y-8">
            {entry.keyEvents.map((ev, i) => (
              <div key={i}>
                {ev.date && (
                  <p className="font-mono text-xs tracking-[0.15em] text-accent uppercase">{ev.date}</p>
                )}
                <h3 className="font-display mt-1 text-2xl">{ev.title}</h3>
                <p className="mt-1 leading-relaxed text-secondary">{ev.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Key figures */}
      {entry.keyFigures && entry.keyFigures.length > 0 && (
        <section className="wrap py-16">
          <SectionHeading eyebrow="Dramatis personae" title="Key figures" />
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {entry.keyFigures.map((f) => (
              <KeyFigureCard key={f.name} figure={f} />
            ))}
          </div>
        </section>
      )}

      {/* Timeline */}
      {entry.timeline && entry.timeline.length > 0 && (
        <section className="wrap pb-16">
          <SectionHeading eyebrow="Chronology" title="Timeline" />
          <EntryTimeline events={entry.timeline} />
        </section>
      )}

      {/* Consequences */}
      {entry.consequences && entry.consequences.length > 0 && (
        <section className="wrap pb-16">
          <SectionHeading eyebrow="Aftermath" title="Consequences" />
          <ul className="mt-6 max-w-3xl divide-y divide-ink/10 border-y border-ink/10">
            {entry.consequences.map((c, i) => (
              <li key={i} className="grid grid-cols-[2.5rem_1fr] gap-3 py-4">
                <span aria-hidden="true" className="text-accent">→</span>
                <p className="leading-relaxed">{c}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Lesser-known facts */}
      {entry.lesserKnownFacts && entry.lesserKnownFacts.length > 0 && (
        <section className="border-y border-ink/10 bg-paper-deep/40">
          <div className="wrap py-16">
            <SectionHeading eyebrow="Marginalia" title="Lesser-known facts" />
            <ul className="mt-6 grid max-w-4xl gap-6 sm:grid-cols-2">
              {entry.lesserKnownFacts.map((f, i) => (
                <li key={i} className="border-t-2 border-accent pt-3 text-sm leading-relaxed text-secondary">
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Legacy */}
      {entry.legacy && (
        <section className="wrap py-16">
          <SectionHeading eyebrow="Echoes" title="Legacy" />
          <p className="mt-6 max-w-3xl text-lg leading-relaxed">{entry.legacy}</p>
        </section>
      )}

      {/* Sources */}
      {entry.sources && entry.sources.length > 0 && (
        <section className="wrap pb-16">
          <SectionHeading eyebrow="Selected references" title="Find out more" />
          <ul className="mt-6 max-w-3xl divide-y divide-ink/10 border-y border-ink/10">
            {entry.sources.map((s) => (
              <li key={s.url ?? s.title}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group grid grid-cols-[2.5rem_1fr] gap-3 py-4"
                >
                  <span aria-hidden="true" className="text-accent transition-transform duration-300 group-hover:translate-x-1">→</span>
                  <span>
                    {s.publisher && (
                      <span className="block font-mono text-xs tracking-[0.2em] text-accent uppercase">
                        {s.publisher}
                      </span>
                    )}
                    <span className="font-display mt-1 block text-2xl leading-snug transition-colors group-hover:text-accent">
                      {s.title}
                    </span>
                    {s.url && (
                      <span className="mt-1 block truncate font-mono text-xs text-muted">
                        {new URL(s.url).hostname.replace(/^www\./, "")} ↗
                      </span>
                    )}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="wrap pb-16">
          <SectionHeading eyebrow="Rabbit hole" title="If you found this interesting" />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <EntryCard key={r.id} entry={r} />
            ))}
          </div>
        </section>
      )}

      {/* Continue */}
      <section className="border-t border-ink/10">
        <div className="wrap flex flex-wrap items-center justify-between gap-6 py-12">
          <p className="font-display text-3xl">Continue exploring →</p>
          <div className="flex flex-wrap gap-4">
            <Button href="/explore" variant="secondary">
              Explore the archive
            </Button>
            {surprise && <Button href={`/archive/${surprise.slug}`}>Surprise me ↗</Button>}
          </div>
        </div>
      </section>
    </main>
  );
}
