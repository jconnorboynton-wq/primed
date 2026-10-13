import { NextResponse, type NextRequest } from "next/server";

/**
 * First gate for owner routes (edge runtime). Verifies the signed session cookie with Web Crypto.
 * Every admin page, server action and API handler re-checks authorization on the server.
 */
async function valid(token: string | undefined) {
  const secret = process.env.SESSION_SECRET;
  if (!token || !secret || secret.length < 32) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "owner" || Number(parts[1]) < Date.now() / 1000) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${parts[0]}.${parts[1]}`)));
  const b64 = btoa(String.fromCharCode(...sig)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return b64 === parts[2];
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  const ok = await valid(req.cookies.get("primed_owner")?.value);
  if (ok) return NextResponse.next();
  if (pathname.startsWith("/api/admin")) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
