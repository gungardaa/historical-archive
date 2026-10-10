"use client";

import Link from "next/link";
import { useState } from "react";

const LIVE = [
  { label: "Explore", href: "/explore" },
  { label: "Timeline", href: "/timeline" },
  { label: "Map", href: "/map" },
  { label: "Random", href: "/random" },
  { label: "About", href: "/about" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-ink/10">
      <nav className="wrap flex items-center justify-between py-4" aria-label="Main">
        <Link href="/" className="font-display text-lg leading-none tracking-[0.2em] uppercase">
          HA
          <span className="mt-1 block font-mono text-[10px] tracking-[0.3em] text-muted">
            Historical Archive
          </span>
        </Link>
        <ul className="hidden items-center gap-8 md:flex">
          {LIVE.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="text-sm tracking-[0.12em] uppercase transition-colors hover:text-accent"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="min-h-[44px] min-w-[44px] p-2 text-sm tracking-[0.2em] uppercase md:hidden"
        >
          {open ? "✕" : "☰"}
        </button>
      </nav>
      {open && (
        <div className="border-t border-ink/10 md:hidden">
          <ul className="wrap py-4">
            {LIVE.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="font-display block py-3 text-3xl uppercase"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
