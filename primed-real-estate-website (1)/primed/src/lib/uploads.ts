import "server-only";
import { resolve } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

export const UPLOAD_DIR = resolve(process.env.UPLOAD_DIR || "data/uploads");
const ALLOWED: Record<string, string> = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/avif": ".avif" };
const MAX_BYTES = 5 * 1024 * 1024;

/** Saves an owner-uploaded public image after checking type, size and magic bytes. Returns its /media path. */
export async function saveImage(file: File): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const ext = ALLOWED[file.type];
  if (!ext) return { ok: false, error: "Use a JPG, PNG, WebP or AVIF image." };
  if (file.size > MAX_BYTES) return { ok: false, error: "Images must be 5 MB or smaller." };
  const buf = Buffer.from(await file.arrayBuffer());
  const sig = buf.subarray(0, 12).toString("hex");
  const ok = sig.startsWith("ffd8ff") || sig.startsWith("89504e47") || (sig.startsWith("52494646") && buf.subarray(8, 12).toString() === "WEBP") || buf.subarray(4, 12).toString().includes("ftypavif");
  if (!ok) return { ok: false, error: "That file doesn't look like a valid image." };
  await mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}${ext}`;
  await writeFile(resolve(UPLOAD_DIR, name), buf);
  return { ok: true, path: `/media/${name}` };
}
