"use client";

import { useEffect, useRef, useState } from "react";
import ArchiveImage from "@/components/ArchiveImage";

export interface LightboxMeta {
  title: string;
  date?: string;
  location?: string;
  source?: string;
}

// ponytail: single-image dialog (Esc/backdrop/close only) — sibling arrows if gallery arrays gain images.
export default function Lightbox({
  src,
  alt,
  ratio = "hero",
  meta,
  triggerLabel,
  priority = false,
}: {
  src: string;
  alt: string;
  ratio?: "hero" | "card" | "feature" | "portrait";
  meta: LightboxMeta;
  triggerLabel: string;
  priority?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const triggerNode = trigger.current;
    closeBtn.current?.focus();
    document.body.style.overflow = "hidden";
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") {
        setOpen(false);
        return;
      }
      // ponytail: minimal Tab cycle (two focusables max) — full focus-trap lib if dialogs multiply.
      if (ev.key === "Tab") {
        const nodes = dialog.current?.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])'
        );
        if (!nodes || nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (ev.shiftKey && document.activeElement === first) {
          ev.preventDefault();
          last.focus();
        } else if (!ev.shiftKey && document.activeElement === last) {
          ev.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      triggerNode?.focus();
    };
  }, [open ]);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Enlarge image: ${triggerLabel}`}
        className="block w-full cursor-zoom-in"
      >
        <ArchiveImage src={src} alt={alt} ratio={ratio} priority={priority} />
      </button>
      {open && (
        <div
          ref={dialog}
          role="dialog"
          aria-modal="true"
          aria-label={meta.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4 sm:p-6"
          onClick={() => setOpen(false)}
        >
          <div className="w-full max-w-4xl" onClick={(ev) => ev.stopPropagation()}>
            <ArchiveImage src={src} alt={alt} ratio={ratio} />
            <div className="mt-4 flex flex-wrap items-start justify-between gap-4 text-paper">
              <div>
                <p className="font-display text-2xl">{meta.title}</p>
                <p className="mt-1 font-mono text-xs tracking-[0.15em] text-paper/60 uppercase">
                  {[meta.date, meta.location, meta.source].filter(Boolean).join(" · ")}
                </p>
              </div>
              <button
                ref={closeBtn}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close image viewer"
                className="border border-paper/40 px-4 py-2 text-sm tracking-[0.15em] uppercase transition-colors hover:border-paper"
              >
                ✕ Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
