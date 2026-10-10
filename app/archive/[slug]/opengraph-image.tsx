import { ImageResponse } from "next/og";
import { getEntryBySlug } from "@/lib/archive";
import { formatDate } from "@/lib/formatDate";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function EntryOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const entry = await getEntryBySlug((await params).slug);
  const title = entry?.title ?? "Historical Archive";
  const meta = entry ? `${formatDate(entry.startDate)} · ${entry.category.toUpperCase()}` : "";
  const id = entry ? `ARCHIVE ${entry.id}` : "";
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
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: 26, letterSpacing: 6, color: "#969087" }}>
          <span>HISTORICAL ARCHIVE</span>
          <span style={{ color: "#8B2F2F" }}>{id}</span>
        </div>
        <div style={{ fontSize: 88, lineHeight: 1.08, marginTop: 24 }}>{title}</div>
        <div style={{ fontFamily: "monospace", fontSize: 28, letterSpacing: 4, marginTop: 24, color: "#66615A" }}>
          {meta}
        </div>
      </div>
    ),
    { ...size }
  );
}
