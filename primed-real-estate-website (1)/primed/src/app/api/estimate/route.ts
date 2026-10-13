import { NextResponse } from "next/server";
import { estimateInputSchema, fieldErrors } from "@/lib/schemas";
import { runEstimate } from "@/lib/estimator/service";
import { rateLimit, clientKey, sameOrigin } from "@/lib/rateLimit";

export const runtime = "nodejs";

/**
 * Public estimate endpoint. Accepts ONLY seller-facing inputs; any extra fields (fees, factors, etc.)
 * are stripped by the schema and ignored. Results are recomputed on the server every time.
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const rl = rateLimit(`est:${clientKey(req)}`, 20, 60_000);
  if (!rl.ok) return NextResponse.json({ message: "Too many requests" }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
  const parsed = estimateInputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Please check your entries.", errors: fieldErrors(parsed.error) }, { status: 422 });
  const v = parsed.data;
  try {
    const result = runEstimate({
      arv: v.arv,
      repairs: v.repairs,
      sqft: v.sqft,
      propertyType: v.propertyType,
      condition: v.condition as "good" | "fair" | "poor" | "major" | "unsure",
      state: v.state,
    });
    return NextResponse.json(result);
  } catch (e) {
    console.error("estimate_failed", (e as Error).message);
    return NextResponse.json({ message: "We could not calculate an estimate right now." }, { status: 500 });
  }
}
