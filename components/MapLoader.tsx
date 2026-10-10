"use client";

import dynamic from "next/dynamic";
import type { HistoricalEntry } from "@/types/archive";

// ponytail: route-split maplibre (~1MB) off the shared bundle — static import if the map ever needs SSR.
const ArchiveMap = dynamic(() => import("@/components/ArchiveMap"), {
  ssr: false,
  loading: () => (
    <p className="p-6 font-mono text-xs tracking-[0.25em] text-muted uppercase">Loading the map…</p>
  ),
});

export default function MapLoader({ entries }: { entries: HistoricalEntry[] }) {
  return <ArchiveMap entries={entries} />;
}
