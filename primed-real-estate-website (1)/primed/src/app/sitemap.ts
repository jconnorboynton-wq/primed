import type { MetadataRoute } from "next";
import { allPages } from "@/content/loader";
import { siteUrl, isProductionSite } from "@/content/site";
import { publishedResources } from "@/lib/resources";

export const dynamic = "force-dynamic";

/** Only canonical, published, indexable URLs on a configured production domain. */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = siteUrl();
  if (!url || !isProductionSite()) return [];
  const pages = allPages()
    .filter((p) => p.published !== false && !p.noindex)
    .map((p) => ({ url: `${url}${p.path === "/" ? "" : p.path}`, changeFrequency: "monthly" as const, priority: p.path === "/" ? 1 : 0.7 }));
  const utility = ["/privacy", "/terms", "/disclosures"].map((p) => ({ url: `${url}${p}`, changeFrequency: "yearly" as const, priority: 0.2 }));
  const articles = publishedResources().map((r) => ({ url: `${url}/resources/${r.slug}`, lastModified: r.updatedAt, changeFrequency: "monthly" as const, priority: 0.5 }));
  return [...pages, ...articles, ...utility];
}
