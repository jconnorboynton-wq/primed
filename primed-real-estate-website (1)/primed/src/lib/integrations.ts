import "server-only";
import { db, nowIso, newId } from "./db";

/**
 * Optional delivery of saved leads to outside systems. The lead is ALWAYS saved first;
 * delivery problems never affect the visitor's confirmation and are recorded privately in the outbox.
 *
 * Supported today: a generic CRM webhook (any CRM or automation tool that accepts JSON POSTs).
 *   CRM_WEBHOOK_URL     https endpoint supplied by the owner's CRM / automation tool
 *   CRM_WEBHOOK_SECRET  shared secret, sent as an HMAC-SHA256 signature header
 * Nothing is sent while leads are in test mode (LEADS_TEST_MODE / non-production SITE_ENV).
 */

const MAX_ATTEMPTS = 6;

function targets(): string[] {
  const t: string[] = [];
  if (process.env.CRM_WEBHOOK_URL) t.push("crm_webhook");
  return t;
}

function deliveryAllowed() {
  return process.env.SITE_ENV === "production" && process.env.LEADS_TEST_MODE === "false";
}

export function enqueueIntegrations(kind: "seller" | "investor", leadId: string) {
  const list = targets();
  if (!list.length) return;
  const d = db();
  const table = kind === "seller" ? "seller_leads" : "investor_leads";
  const lead = d.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(leadId) as Record<string, unknown> | undefined;
  if (!lead) return;
  delete lead.idempotency_key;
  for (const target of list) {
    d.prepare("INSERT INTO outbox (id, lead_type, lead_id, target, payload_json, status, attempts, created_at, updated_at) VALUES (?,?,?,?,?,?,0,?,?)").run(
      newId("obx"), kind, leadId, target, JSON.stringify({ type: `${kind}_lead`, lead }), deliveryAllowed() ? "pending" : "held_test_mode", nowIso(), nowIso(),
    );
  }
}

async function sign(body: string) {
  const { createHmac } = await import("node:crypto");
  return createHmac("sha256", process.env.CRM_WEBHOOK_SECRET || "").update(body).digest("hex");
}

let running = false;
export async function processOutbox() {
  if (running || !deliveryAllowed()) return;
  running = true;
  try {
    const d = db();
    const due = d.prepare("SELECT * FROM outbox WHERE status IN ('pending','retry') AND attempts < ? ORDER BY created_at LIMIT 20").all(MAX_ATTEMPTS) as {
      id: string; target: string; payload_json: string; attempts: number;
    }[];
    for (const job of due) {
      try {
        if (job.target === "crm_webhook") {
          const res = await fetch(process.env.CRM_WEBHOOK_URL as string, {
            method: "POST",
            headers: { "content-type": "application/json", "x-primed-signature": await sign(job.payload_json) },
            body: job.payload_json,
            signal: AbortSignal.timeout(8000),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
        }
        d.prepare("UPDATE outbox SET status='delivered', attempts=attempts+1, last_error=NULL, updated_at=? WHERE id=?").run(nowIso(), job.id);
      } catch (e) {
        const attempts = job.attempts + 1;
        d.prepare("UPDATE outbox SET status=?, attempts=?, last_error=?, updated_at=? WHERE id=?").run(
          attempts >= MAX_ATTEMPTS ? "failed" : "retry", attempts, String((e as Error).message).slice(0, 300), nowIso(), job.id,
        );
      }
    }
  } finally {
    running = false;
  }
}

export function outboxSummary() {
  return db().prepare("SELECT status, COUNT(*) AS n FROM outbox GROUP BY status").all() as { status: string; n: number }[];
}

export function retryFailed() {
  db().prepare("UPDATE outbox SET status='retry', attempts=0 WHERE status='failed'").run();
  void processOutbox();
}
