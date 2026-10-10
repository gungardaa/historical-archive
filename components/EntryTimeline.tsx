import type { TimelineEvent } from "@/types/archive";

export default function EntryTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="mt-8 border-l border-ink/20">
      {events.map((ev, i) => (
        <li key={`${ev.date}-${i}`} className="relative pb-8 pl-8 last:pb-0">
          <span aria-hidden="true" className="absolute top-1.5 -left-[5px] h-2 w-2 rounded-full bg-accent" />
          <p className="font-mono text-xs tracking-[0.15em] text-accent uppercase">{ev.date}</p>
          <p className="font-display mt-1 text-2xl">{ev.title}</p>
          {ev.description && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-secondary">{ev.description}</p>}
        </li>
      ))}
      <li aria-hidden="true" className="relative pl-8">
        <span className="absolute top-1.5 -left-[5px] h-2 w-2 rounded-full bg-muted" />
        <p className="font-mono text-xs tracking-[0.25em] text-muted uppercase">End</p>
      </li>
    </ol>
  );
}
