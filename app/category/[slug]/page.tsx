import Link from "next/link";
import { notFound } from "next/navigation";
import EntryCard from "@/components/EntryCard";
import SectionHeading from "@/components/SectionHeading";
import { getEntriesByCategory } from "@/lib/archive";
import { CATEGORIES, getCategory } from "@/lib/categories";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const category = getCategory((await params).slug);
  if (!category) return { title: "Section not found" };
  return {
    title: category.label,
    description: category.intro,
    alternates: {
      canonical: `/category/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const category = getCategory((await params).slug);
  if (!category) notFound();

  const entries = (await getEntriesByCategory(category.slug)).sort((a, b) =>
    a.startDate < b.startDate ? 1 : -1
  );
  const siblings = CATEGORIES.filter((c) => c.slug !== category.slug);

  return (
    <main className="flex-1">
      <section className="wrap pt-16 sm:pt-20">
        <h1 className="sr-only">{category.label} — Historical Archive</h1>
        <SectionHeading eyebrow={`Cat. ${category.numeral} — Index`} title={category.label} />
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-secondary">{category.intro}</p>
        <p className="mt-4 font-mono text-xs tracking-[0.2em] text-muted uppercase">
          {entries.length} records
        </p>
      </section>

      <section className="wrap py-12">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <li key={entry.id}>
              <EntryCard entry={entry} />
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-ink/10">
        <div className="wrap py-12">
          <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">Other sections</p>
          <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
            <li>
              <Link href="/explore" className="text-sm tracking-[0.1em] uppercase transition-colors hover:text-accent">
                ← Explore the archive
              </Link>
            </li>
            {siblings.map((s) => (
              <li key={s.slug}>
                <Link href={`/category/${s.slug}`} className="text-sm tracking-[0.1em] uppercase transition-colors hover:text-accent">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
