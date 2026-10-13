import { NextResponse } from "next/server";
import { sellerLeadSchema, fieldErrors } from "@/lib/schemas";
import { saveSellerLead } from "@/lib/leads";
import { rateLimit, clientKey, sameOrigin } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  const rl = rateLimit(`seller:${clientKey(req)}`, 8, 10 * 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false, message: "Too many submissions. Please wait a few minutes and try again." }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request" }, { status: 400 });
  }
  const parsed = sellerLeadSchema.safeParse(body);
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    if (errors.company) return NextResponse.json({ ok: true }); // honeypot: pretend success, store nothing
    return NextResponse.json({ ok: false, message: "Please check your entries.", errors }, { status: 422 });
  }
  try {
    const { duplicate, statusToken } = saveSellerLead(parsed.data);
    // Only now — after a durable save — do we report success. The status token links to a private,
    // noindex status page that shows only the stage, city and state.
    return NextResponse.json({ ok: true, duplicate, statusToken });
  } catch (e) {
    console.error("seller_lead_save_failed", (e as Error).message);
    return NextResponse.json({ ok: false, message: "We could not save your request." }, { status: 500 });
  }
}
