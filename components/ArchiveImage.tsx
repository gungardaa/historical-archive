"use client";

import Image from "next/image";
import { useState } from "react";

const RATIOS: Record<string, string> = {
  hero: "aspect-[16/9]",
  card: "aspect-[16/10]",
  feature: "aspect-[3/2]",
  portrait: "aspect-[4/5]",
};

// ponytail: paper-deep blur pixel, not a generated blurmap — per-image blurDataURL if LQIP matters later.
const BLUR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 5'%3E%3Crect width='8' height='5' fill='%23E8E3D8'/%3E%3C/svg%3E";

export default function ArchiveImage({
  src,
  alt,
  ratio = "card",
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw",
}: {
  src: string;
  alt: string;
  ratio?: keyof typeof RATIOS;
  priority?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-paper-deep ${RATIOS[ratio]}`}>
      <Image
        src={failed ? "/images/placeholder.svg" : src}
        alt={failed ? "Image pending — archival placeholder" : alt}
        fill
        sizes={sizes}
        priority={priority}
        placeholder="blur"
        blurDataURL={BLUR}
        onError={() => setFailed(true)}
        className="object-cover"
      />
    </div>
  );
}
