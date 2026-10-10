import type { MetadataRoute } from "next";
import { getAllEntries } from "@/lib/archive";
import { CATEGORIES } from "@/lib/categories";
import { SITE_URL } from "@/lib/site";

// ponytail: no lastModified — the model carries no per-entry timestamps; honest omission over invented dates.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL;
  const staticRoutes = ["", "/explore", "/timeline", "/map", "/random", "/about"].map((p) => ({
    url: `${base}${p || "/"}`,
    changeFrequency: "weekly" as const,
  }));
  const entries = (await getAllEntries()).map((e) => ({
    url: `${base}/archive/${e.slug}`,
    changeFrequency: "monthly" as const,
  }));
  const categories = CATEGORIES.map((c) => ({
    url: `${base}/category/${c.slug}`,
    changeFrequency: "monthly" as const,
  }));
  return [...staticRoutes, ...entries, ...categories];
}
