import { ImageResponse } from "next/og";

// ponytail: static default card — per-entry cards live at archive/[slug]/opengraph-image.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function DefaultOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 96,
          background: "#F3F0E8",
          color: "#171717",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontFamily: "monospace", fontSize: 28, letterSpacing: 8, color: "#969087" }}>
          HISTORICAL ARCHIVE
        </div>
        <div style={{ fontSize: 96, lineHeight: 1.05, marginTop: 24 }}>Stories that shaped</div>
        <div style={{ fontSize: 96, lineHeight: 1.05 }}>the world.</div>
        <div style={{ marginTop: 32, height: 8, width: 160, background: "#8B2F2F" }} />
      </div>
    ),
    { ...size }
  );
}
