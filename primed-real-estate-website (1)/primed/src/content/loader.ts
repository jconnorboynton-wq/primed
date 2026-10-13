import "server-only";
import type { Metadata } from "next";
import { db, nowIso, audit } from "@/lib/db";
import { pageSchema, type PageContent } from "./types";
import { siteUrl, isProductionSite } from "./site";
import { PAGES } from "./pages";

export type PageSlug = keyof typeof PAGES;

/** Returns the page content, preferring a valid owner override saved in /admin/content. */
export function getPage(slug: PageSlug): PageContent {
  const def = PAGES[slug];
  const row = db().prepare("SELECT json FROM content_overrides WHERE slug = ?").get(slug) as { json: string } | undefined;
  if (row) {
    const parsed = pageSchema.safeParse(JSON.parse(row.json));
    if (parsed.success) return { ...parsed.data, slug: def.slug, path: def.path };
  }
  return def;
}

export function saveOverride(slug: PageSlug, json: unknown): { ok: true } | { ok: false; problems: string[] } {
  const parsed = pageSchema.safeParse(json);
  if (!parsed.success) return { ok: false, problems: parsed.error.issues.slice(0, 12).map((i) => `${i.path.join(".")}: ${i.message}`) };
  const def = PAGES[slug];
  const data = { ...parsed.data, slug: def.slug, path: def.path };
  db()
    .prepare("INSERT INTO content_overrides (slug, json, updated_at) VALUES (?, ?, ?) ON CONFLICT(slug) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at")
    .run(slug, JSON.stringify(data), nowIso());
  audit("content.save", slug);
  return { ok: true };
}

export function resetOverride(slug: PageSlug) {
  db().prepare("DELETE FROM content_overrides WHERE slug = ?").run(slug);
  audit("content.reset", slug);
}

export function hasOverride(slug: string) {
  return Boolean(db().prepare("SELECT 1 FROM content_overrides WHERE slug = ?").get(slug));
}

export function pageMetadata(p: PageContent): Metadata {
  const url = siteUrl();
  const indexable = isProductionSite() && !p.noindex && p.published !== false;
  return {
    title: p.seo.title,
    description: p.seo.description,
    alternates: url ? { canonical: `${url}${p.path === "/" ? "" : p.path}` } : undefined,
    robots: indexable ? { index: true, follow: true } : { index: false, follow: !p.noindex },
    openGraph: { title: p.seo.title, description: p.seo.description, url: url ? `${url}${p.path}` : undefined },
  };
}

export function allPages(): PageContent[] {
  return (Object.keys(PAGES) as PageSlug[]).map((k) => getPage(k));
}
