"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const LIVE = [
  { label: "Explore", href: "/explore" },
  { label: "Timeline", href: "/timeline" },
  { label: "Map", href: "/map" },
  { label: "Random", href: "/random" },
  { label: "About", href: "/about" },
];

// ponytail: localStorage + class toggle, no theme lib — next-themes if the toggle ever leaves the navbar.
function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync with the pre-paint theme script; no render loop.
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("archive-theme", next ? "dark" : "light");
    } catch {
      /* private mode: theme just won't persist */
    }
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex min-h-[44px] min-w-[44px] items-center justify-center p-2 transition-colors hover:text-accent"
    >
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        {dark ? (
          <>
            <circle cx="10" cy="10" r="4" />
            <path d="M10 1.5v2M10 16.5v2M1.5 10h2M16.5 10h2M4 4l1.4 1.4M14.6 14.6L16 16M16 4l-1.4 1.4M5.4 14.6L4 16" strokeLinecap="round" />
          </>
        ) : (
          <path d="M15.5 12.5A6.5 6.5 0 0 1 7.5 4.5a6.5 6.5 0 1 0 8 8Z" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);  return (
    <header className="border-b border-ink/10">
      <nav className="wrap flex items-center justify-between py-4" aria-label="Main">
        <Link href="/" className="flex items-center gap-3" aria-label="Historical Archive — home">
          <Image src="/logo.png" alt="" width={96} height={96} className="h-10 w-10" priority />
          <span className="font-mono text-[10px] leading-relaxed tracking-[0.3em] text-muted uppercase">
            Historical
            <br />
            Archive
          </span>
        </Link>
        <div className="flex items-center gap-6 md:gap-8">
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
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              className="min-h-[44px] min-w-[44px] p-2 text-sm tracking-[0.2em] uppercase md:hidden"
            >
              {open ? "✕" : "☰"}
            </button>
          </div>
        </div>
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
