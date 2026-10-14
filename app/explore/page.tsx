import { Suspense } from "react";
import ExploreClient from "@/components/ExploreClient";
import { getAllEntries } from "@/lib/archive";

export const metadata = {
  title: "Explore",
  description: "Browse all historical entries by category or search the archive.",
};

export default async function ExplorePage() {
  const entries = await getAllEntries();
  return (
    <main className="wrap flex-1 py-10 sm:py-14">
      <Suspense
        fallback={
          <p className="font-mono text-xs tracking-[0.25em] text-muted uppercase">
            Loading the catalogue…
          </p>
        }
      >
        <ExploreClient entries={entries} />
      </Suspense>
    </main>
  );
}
