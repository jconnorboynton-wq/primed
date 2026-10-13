import type { MetadataRoute } from "next";
import { siteUrl, isProductionSite } from "@/content/site";

export const dynamic = "force-dynamic";

/** Preview environments block all crawling. Production allows public pages and points to the sitemap. */
export default function robots(): MetadataRoute.Robots {
  const url = siteUrl();
  if (!isProductionSite() || !url) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/thank-you", "/status/"] }],
    sitemap: `${url}/sitemap.xml`,
  };
}
