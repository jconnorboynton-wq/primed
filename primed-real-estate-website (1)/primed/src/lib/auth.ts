import "server-only";
import { cookies } from "next/headers";
import { scryptSync, timingSafeEqual, createHmac } from "node:crypto";

/**
 * Owner authentication. One owner account configured by environment:
 *   ADMIN_PASSWORD_HASH  scrypt:<saltHex>:<hashHex>   (create with: npm run hash-password)
 *   SESSION_SECRET       32+ random characters
 * Sessions are HMAC-signed, HttpOnly, SameSite=Strict cookies that expire after 8 hours.
 * Every admin page and API handler calls requireOwner() on the server; middleware is only a first gate.
 */
export const SESSION_COOKIE = "primed_owner";
const MAX_AGE_S = 8 * 60 * 60;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be set (32+ characters).");
  return s;
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD_HASH && process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32);
}

export function verifyPassword(password: string): boolean {
  const stored = process.env.ADMIN_PASSWORD_HASH || "";
  // Format scrypt:<salt>:<hash>. (":" is used because "$" is expanded by .env loaders.)
  const [algo, saltHex, hashHex] = stored.split(/[:$]/);
  if (algo !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function signSession(): string {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_S;
  const payload = `owner.${exp}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token || !adminConfigured()) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "owner") return false;
  const exp = Number(parts[1]);
  if (!Number.isFinite(exp) || exp < Date.now() / 1000) return false;
  const expected = createHmac("sha256", secret()).update(`${parts[0]}.${parts[1]}`).digest("base64url");
  const a = Buffer.from(parts[2]);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isOwner(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

export async function setSessionCookie() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, signSession(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_S,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export class UnauthorizedError extends Error {}

export async function requireOwner() {
  if (!(await isOwner())) throw new UnauthorizedError("Unauthorized");
}
