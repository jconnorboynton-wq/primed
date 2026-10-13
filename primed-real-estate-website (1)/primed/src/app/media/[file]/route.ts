import { readFile } from "node:fs/promises";
import { resolve, basename, extname } from "node:path";
import { db } from "@/lib/db";
import { UPLOAD_DIR } from "@/lib/uploads";

export const runtime = "nodejs";

const TYPES: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif" };

/**
 * Serves PUBLIC images uploaded by the owner (team photos, property imagery).
 * Team photos are served only once their profile is published; unpublished files return 404.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const name = basename((await params).file);
  const type = TYPES[extname(name).toLowerCase()];
  if (!type || !/^[a-z0-9_-]+\.[a-z]+$/i.test(name)) return new Response("Not found", { status: 404 });
  const path = `/media/${name}`;
  const team = db().prepare("SELECT published FROM team_members WHERE photo_path = ?").get(path) as { published: number } | undefined;
  const asset = db().prepare("SELECT value FROM settings WHERE key = 'public_media'").get() as { value: string } | undefined;
  const publicList: string[] = asset ? JSON.parse(asset.value) : [];
  const allowed = (team && team.published === 1) || publicList.includes(path);
  if (!allowed) return new Response("Not found", { status: 404 });
  try {
    const buf = await readFile(resolve(UPLOAD_DIR, name));
    return new Response(new Uint8Array(buf), { headers: { "content-type": type, "cache-control": "public, max-age=86400" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
