import { NextResponse } from "next/server";
import { investorLeadSchema, fieldErrors } from "@/lib/schemas";
import { saveInvestorLead } from "@/lib/leads";
import { rateLimit, clientKey, sameOrigin } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  const rl = rateLimit(`investor:${clientKey(req)}`, 6, 10 * 60_000);
  if (!rl.ok) return NextResponse.json({ ok: false, message: "Too many submissions. Please wait a few minutes and try again." }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request" }, { status: 400 });
  }
  const parsed = investorLeadSchema.safeParse(body);
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    if (errors.company) return NextResponse.json({ ok: true });
    return NextResponse.json({ ok: false, message: "Please check your entries.", errors }, { status: 422 });
  }
  try {
    const { duplicate } = saveInvestorLead(parsed.data);
    return NextResponse.json({ ok: true, duplicate });
  } catch (e) {
    console.error("investor_lead_save_failed", (e as Error).message);
    return NextResponse.json({ ok: false, message: "We could not save your criteria." }, { status: 500 });
  }
}
