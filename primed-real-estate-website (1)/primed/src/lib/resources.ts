import "server-only";
import { z } from "zod";
import { db, nowIso, audit } from "./db";

/**
 * Future resource articles. Empty at launch; nothing links to an article until it is published.
 * Author/reviewer fields are optional and must be real people with real credentials when used.
 */
export const articleSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]{3,80}$/),
  title: z.string().min(10).max(110),
  description: z.string().min(50).max(170),
  summary: z.string().max(400),
  body: z.array(z.object({ heading: z.string().max(140).optional(), paragraphs: z.array(z.string().max(2000)).min(1) })).min(1),
  author: z.string().max(80).optional(),
  reviewedBy: z.string().max(120).optional(),
  publishedAt: z.string().optional(),
});
export type Article = z.infer<typeof articleSchema>;

export function publishedResources(): (Article & { updatedAt: string })[] {
  const rows = db().prepare("SELECT json, updated_at FROM resources WHERE status = 'published' ORDER BY updated_at DESC").all() as { json: string; updated_at: string }[];
  return rows.map((r) => ({ ...(JSON.parse(r.json) as Article), updatedAt: r.updated_at }));
}

export function getResource(slug: string, includeDrafts = false) {
  const row = db().prepare("SELECT json, status, updated_at FROM resources WHERE slug = ?").get(slug) as { json: string; status: string; updated_at: string } | undefined;
  if (!row || (!includeDrafts && row.status !== "published")) return null;
  return { ...(JSON.parse(row.json) as Article), status: row.status, updatedAt: row.updated_at };
}

export function allResources() {
  return db().prepare("SELECT slug, status, updated_at, json FROM resources ORDER BY updated_at DESC").all() as { slug: string; status: string; updated_at: string; json: string }[];
}

export function saveResource(json: unknown, status: "draft" | "published") {
  const parsed = articleSchema.safeParse(json);
  if (!parsed.success) return { ok: false as const, problems: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) };
  db().prepare("INSERT INTO resources (slug, json, status, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(slug) DO UPDATE SET json = excluded.json, status = excluded.status, updated_at = excluded.updated_at")
    .run(parsed.data.slug, JSON.stringify(parsed.data), status, nowIso());
  audit("resource.save", `${parsed.data.slug}:${status}`);
  return { ok: true as const };
}

export function deleteResource(slug: string) {
  db().prepare("DELETE FROM resources WHERE slug = ?").run(slug);
  audit("resource.delete", slug);
}
