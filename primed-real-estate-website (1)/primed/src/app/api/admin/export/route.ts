import { isOwner } from "@/lib/auth";
import { leadsCsv } from "@/lib/leads";
import { audit } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!(await isOwner())) return new Response("Unauthorized", { status: 401 });
  const kind = new URL(req.url).searchParams.get("kind") === "investor" ? "investor" : "seller";
  audit("lead.export", kind);
  const csv = leadsCsv(kind);
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="primed-${kind}-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      "cache-control": "no-store",
    },
  });
}
