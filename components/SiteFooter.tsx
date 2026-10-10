import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-ink/10">
      <div className="wrap grid gap-10 py-12 sm:grid-cols-3">
        <div>
          <p className="font-display text-xl tracking-[0.2em] uppercase">Historical Archive</p>
          <p className="mt-3 max-w-xs text-sm text-secondary">
            A collection of stories from human history.
          </p>
        </div>
        <nav aria-label="Explore">
          <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">Explore</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/explore" className="transition-colors hover:text-accent">
                All entries
              </Link>
            </li>
            <li>
              <Link href="/timeline" className="transition-colors hover:text-accent">
                Timeline
              </Link>
            </li>
            <li>
              <Link href="/map" className="transition-colors hover:text-accent">
                Map
              </Link>
            </li>
            <li>
              <Link href="/random" className="transition-colors hover:text-accent">
                Random
              </Link>
            </li>
          </ul>
        </nav>
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">About</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/about" className="transition-colors hover:text-accent">
                About the archive
              </Link>
            </li>
            <li>
              <Link href="/about" className="transition-colors hover:text-accent">
                Sources
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink/10">
        <p className="wrap py-5 font-mono text-xs text-muted">© 2026 Historical Archive</p>
      </div>
    </footer>
  );
}
