import TimelineBoard from "@/components/TimelineBoard";
import { getAllEntries } from "@/lib/archive";

export const metadata = {
  title: "Timeline",
  description: "Five thousand years of the archive on a single axis, from ancient Egypt to the Cold War.",
};

export default async function TimelinePage() {
  const entries = await getAllEntries();
  return (
    <main className="wrap flex-1 py-16 sm:py-20">
      <p className="font-mono text-xs tracking-[0.25em] text-muted uppercase">The long axis</p>
      <h1 className="font-display mt-6 max-w-3xl text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">
        History is not a list.
        <br />
        It is a timeline.
      </h1>
      <TimelineBoard entries={entries} />
    </main>
  );
}
