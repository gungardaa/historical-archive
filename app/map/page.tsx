import MapLoader from "@/components/MapLoader";
import { getAllEntries } from "@/lib/archive";

export const metadata = {
  title: "Map",
  description: "Explore the archive by location — battles, empires, and oddities on a single map.",
};

export default async function MapPage() {
  const entries = await getAllEntries();
  return (
    <main className="flex flex-1 flex-col">
      <div className="wrap pt-10">
        <p className="font-mono text-xs tracking-[0.25em] text-muted uppercase">Geography</p>
        <h1 className="font-display mt-3 text-5xl sm:text-6xl">History has a location.</h1>
      </div>
      <div className="wrap mt-6 flex flex-1 flex-col pb-10">
        <div className="flex min-h-[70vh] flex-1 flex-col overflow-hidden border border-ink/10">
          <MapLoader entries={entries} />
        </div>
        <p className="mt-3 font-mono text-xs text-muted">
          Marker locations are approximate. Tiles © OpenStreetMap contributors.
        </p>
      </div>
    </main>
  );
}
