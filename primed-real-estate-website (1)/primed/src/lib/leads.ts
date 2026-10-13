import "server-only";
import { randomBytes } from "node:crypto";
import { db, nowIso, newId } from "./db";
import { getStoredEstimate } from "./estimator/service";
import { enqueueIntegrations, processOutbox } from "./integrations";
import type { z } from "zod";
import type { sellerLeadSchema, investorLeadSchema } from "./schemas";

type Seller = z.output<typeof sellerLeadSchema>;
type Investor = z.output<typeof investorLeadSchema>;

/** Test mode: leads are flagged and no external delivery is attempted. On by default outside production. */
export const leadTestMode = () => process.env.LEADS_TEST_MODE !== "false" || process.env.SITE_ENV !== "production";

export const CONSENT_TEXT_VERSION = "2026-10-12";

/** Unguessable token for the seller's private status page (/status/[token]). Contains no personal data. */
const newStatusToken = () => randomBytes(18).toString("base64url");

export function saveSellerLead(v: Seller): { id: string; duplicate: boolean; statusToken: string | null } {
  const d = db();
  const existing = d.prepare("SELECT id, status_token FROM seller_leads WHERE idempotency_key = ?").get(v.idempotencyKey) as { id: string; status_token: string | null } | undefined;
  if (existing) return { id: existing.id, duplicate: true, statusToken: existing.status_token };

  // Never trust client-supplied estimate numbers: attach the server-stored record by id.
  let estimateJson: string | null = null;
  let modelVersion: string | null = null;
  if (v.estimateId) {
    const est = getStoredEstimate(v.estimateId);
    if (est) {
      estimateJson = est.result_json;
      modelVersion = est.model_version;
    }
  }
  const urgent = v.inquiryType === "time_sensitive" || Boolean(v.deadline) ? 1 : 0;
  const consent = { ...v.consent, textVersion: CONSENT_TEXT_VERSION, recordedAt: nowIso() };
  const id = newId("sel");
  const insert = d.prepare(`INSERT INTO seller_leads (
    id, created_at, status, idempotency_key, inquiry_type, name, email, phone, preferred_contact,
    address, city, state, zip, property_type, condition, occupancy, bedrooms, bathrooms, sqft,
    owner_arv, owner_repairs, timeline, preferred_date, deadline, urgent, notes, estimate_id, estimate_json, model_version,
    source_page, utm_json, consent_json, extra_json, is_test, status_token, updated_at
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const statusToken = newStatusToken();
  const now = nowIso();
  try {
    insert.run(
      id, now, urgent ? "urgent_review" : "new", v.idempotencyKey, v.inquiryType, v.name, v.email || null, v.phone || null, v.preferredContact,
      v.address ?? null, v.city ?? null, v.state, v.zip || null, v.propertyType ?? null, v.condition ?? null, v.occupancy ?? null,
      v.bedrooms ?? null, v.bathrooms ?? null, v.sqft ?? null, v.ownerArv ?? null, v.ownerRepairs ?? null, v.timeline ?? null,
      v.preferredDate || null, v.deadline || null, urgent, v.notes ?? null, v.estimateId || null, estimateJson, modelVersion,
      v.sourcePage ?? null, JSON.stringify(v.utm ?? {}), JSON.stringify(consent), JSON.stringify({ circumstances: v.circumstances ?? null }),
      leadTestMode() ? 1 : 0, statusToken, now,
    );
  } catch (e) {
    // Unique constraint race: a concurrent duplicate already saved this submission.
    const again = d.prepare("SELECT id, status_token FROM seller_leads WHERE idempotency_key = ?").get(v.idempotencyKey) as { id: string; status_token: string | null } | undefined;
    if (again) return { id: again.id, duplicate: true, statusToken: again.status_token };
    throw e;
  }
  logActivity("seller", id, "system", `Request received (${INQUIRY_LABELS[v.inquiryType] ?? v.inquiryType}${v.sourcePage ? ` from ${v.sourcePage}` : ""}).`);
  if (urgent) logActivity("seller", id, "system", "Flagged for urgent review (time-sensitive or a deadline was shared).");
  enqueueIntegrations("seller", id);
  void processOutbox();
  return { id, duplicate: false, statusToken };
}

export function saveInvestorLead(v: Investor): { id: string; duplicate: boolean } {
  const d = db();
  const existing = d.prepare("SELECT id FROM investor_leads WHERE idempotency_key = ?").get(v.idempotencyKey) as { id: string } | undefined;
  if (existing) return { id: existing.id, duplicate: true };
  const id = newId("inv");
  const consent = { ...v.consent, textVersion: CONSENT_TEXT_VERSION, recordedAt: nowIso() };
  try {
    d.prepare(`INSERT INTO investor_leads (
      id, created_at, status, idempotency_key, name, entity, email, phone, preferred_contact, markets, property_types,
      price_min, price_max, strategy, rehab_tolerance, timing, notes, source_page, utm_json, consent_json, is_test
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
      id, nowIso(), "new", v.idempotencyKey, v.name, v.entity ?? null, v.email, v.phone || null, v.preferredContact, v.markets,
      v.propertyTypes.join(","), v.priceMin ?? null, v.priceMax ?? null, v.strategy.join(","), v.rehabTolerance, v.timing,
      v.notes ?? null, v.sourcePage ?? null, JSON.stringify(v.utm ?? {}), JSON.stringify(consent), leadTestMode() ? 1 : 0,
    );
  } catch (e) {
    const again = d.prepare("SELECT id FROM investor_leads WHERE idempotency_key = ?").get(v.idempotencyKey) as { id: string } | undefined;
    if (again) return { id: again.id, duplicate: true };
    throw e;
  }
  logActivity("investor", id, "system", "Buy box received.");
  enqueueIntegrations("investor", id);
  void processOutbox();
  return { id, duplicate: false };
}

export const LEAD_STATUSES = ["new", "urgent_review", "contacted", "reviewing", "offer_sent", "under_contract", "closed", "not_a_fit", "spam"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type LeadKind = "seller" | "investor";

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  urgent_review: "Urgent",
  contacted: "Contacted",
  reviewing: "Reviewing",
  offer_sent: "Offer sent",
  under_contract: "Under contract",
  closed: "Closed",
  not_a_fit: "Not a fit",
  spam: "Spam",
};

export const INQUIRY_LABELS: Record<string, string> = {
  property_review: "Property review",
  reviewed_offer: "Reviewed offer request",
  time_sensitive: "Time-sensitive",
  location_check: "Location check",
  general: "General question",
};

const table = (kind: LeadKind) => (kind === "seller" ? "seller_leads" : "investor_leads");

export type Lead = Record<string, unknown> & { id: string; name: string; status: LeadStatus; created_at: string };

/** List or search leads. `q` matches name, email, phone, city, address, ZIP or notes. */
export function listLeads(kind: LeadKind, opts: { status?: string; q?: string; limit?: number } = {}) {
  const where: string[] = [];
  const params: unknown[] = [];
  if (opts.status) { where.push("status = ?"); params.push(opts.status); }
  if (opts.q) {
    const like = `%${opts.q.replace(/[%_]/g, (m) => `\\${m}`)}%`;
    const cols = kind === "seller" ? ["name", "email", "phone", "city", "address", "zip", "notes", "state"] : ["name", "entity", "email", "phone", "markets", "notes"];
    const digits = opts.q.replace(/\D/g, "");
    const phoneMatch = digits.length >= 4 ? " OR phone LIKE ?" : "";
    where.push(`(${cols.map((c) => `${c} LIKE ? ESCAPE '\\'`).join(" OR ")}${phoneMatch})`);
    params.push(...cols.map(() => like), ...(phoneMatch ? [`%${digits}%`] : []));
  }
  const sql = `SELECT * FROM ${table(kind)} ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY created_at DESC LIMIT ?`;
  return db().prepare(sql).all(...params, opts.limit ?? 500) as Lead[];
}

export function getLead(kind: LeadKind, id: string) {
  return (db().prepare(`SELECT * FROM ${table(kind)} WHERE id = ?`).get(id) as Lead | undefined) ?? null;
}

export function logActivity(kind: LeadKind, id: string, type: "system" | "status" | "note" | "contact" | "follow_up", body: string, sellerVisible = false) {
  db().prepare("INSERT INTO lead_activity (lead_kind, lead_id, at, kind, body, seller_visible) VALUES (?,?,?,?,?,?)").run(kind, id, nowIso(), type, body, sellerVisible ? 1 : 0);
  db().prepare(`UPDATE ${table(kind)} SET updated_at = ? WHERE id = ?`).run(nowIso(), id);
}

export type Activity = { id: number; at: string; kind: string; body: string; seller_visible: number };
export function leadActivity(kind: LeadKind, id: string) {
  return db().prepare("SELECT id, at, kind, body, seller_visible FROM lead_activity WHERE lead_kind = ? AND lead_id = ? ORDER BY at DESC, id DESC").all(kind, id) as Activity[];
}

export function updateLeadStatus(kind: LeadKind, id: string, status: string) {
  if (!(LEAD_STATUSES as readonly string[]).includes(status)) throw new Error("Invalid status");
  const lead = getLead(kind, id);
  if (!lead || lead.status === status) return 0;
  const changes = db().prepare(`UPDATE ${table(kind)} SET status = ? WHERE id = ?`).run(status, id).changes;
  logActivity(kind, id, "status", `Status: ${STATUS_LABELS[lead.status] ?? lead.status} → ${STATUS_LABELS[status as LeadStatus]}`);
  return changes;
}

export function setFollowUp(kind: LeadKind, id: string, date: string | null) {
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Invalid date");
  db().prepare(`UPDATE ${table(kind)} SET follow_up_at = ? WHERE id = ?`).run(date, id);
  logActivity(kind, id, "follow_up", date ? `Follow-up set for ${date}` : "Follow-up cleared");
}

export function deleteLead(kind: LeadKind, id: string) {
  const d = db();
  d.prepare("DELETE FROM lead_activity WHERE lead_kind = ? AND lead_id = ?").run(kind, id);
  d.prepare("DELETE FROM outbox WHERE lead_type = ? AND lead_id = ?").run(kind, id);
  return d.prepare(`DELETE FROM ${table(kind)} WHERE id = ?`).run(id).changes;
}

/** Open leads whose follow-up date is today or earlier (local date string comparison). */
export function followUpsDue(today: string) {
  const open = "status NOT IN ('closed','not_a_fit','spam')";
  const s = db().prepare(`SELECT 'seller' AS kind, id, name, city, state, status, follow_up_at FROM seller_leads WHERE follow_up_at IS NOT NULL AND follow_up_at <= ? AND ${open}`).all(today);
  const i = db().prepare(`SELECT 'investor' AS kind, id, name, NULL AS city, NULL AS state, status, follow_up_at FROM investor_leads WHERE follow_up_at IS NOT NULL AND follow_up_at <= ? AND ${open}`).all(today);
  return ([...s, ...i] as { kind: LeadKind; id: string; name: string; city: string | null; state: string | null; status: LeadStatus; follow_up_at: string }[]).sort((a, b) => a.follow_up_at.localeCompare(b.follow_up_at));
}

export function pipelineCounts(kind: LeadKind) {
  const rows = db().prepare(`SELECT status, COUNT(*) n FROM ${table(kind)} GROUP BY status`).all() as { status: LeadStatus; n: number }[];
  return Object.fromEntries(LEAD_STATUSES.map((st) => [st, rows.find((r) => r.status === st)?.n ?? 0])) as Record<LeadStatus, number>;
}

/* ---------------- Seller-facing status page ---------------- */

export const SELLER_STAGES = ["Received", "In review", "Offer sent", "Under contract", "Closed"] as const;

const STAGE_INDEX: Partial<Record<LeadStatus, number>> = {
  new: 0, urgent_review: 0, contacted: 1, reviewing: 1, offer_sent: 2, under_contract: 3, closed: 4,
};

export type PublicStatus = {
  stage: number; // -1 when the review ended without a fit
  ended: boolean;
  city: string | null;
  state: string;
  submitted: string;
  updated: string;
  updates: { at: string; body: string }[];
};

/** Only coarse, non-sensitive information is ever returned for the token holder. */
export function getPublicStatus(token: string): PublicStatus | null {
  if (!/^[A-Za-z0-9_-]{20,40}$/.test(token)) return null;
  const r = db().prepare("SELECT id, status, city, state, created_at, updated_at FROM seller_leads WHERE status_token = ?").get(token) as
    | { id: string; status: LeadStatus; city: string | null; state: string; created_at: string; updated_at: string | null }
    | undefined;
  if (!r || r.status === "spam") return null;
  const updates = db()
    .prepare("SELECT at, body FROM lead_activity WHERE lead_kind = 'seller' AND lead_id = ? AND seller_visible = 1 ORDER BY at DESC, id DESC LIMIT 20")
    .all(r.id) as { at: string; body: string }[];
  return {
    stage: r.status === "not_a_fit" ? -1 : (STAGE_INDEX[r.status] ?? 0),
    ended: r.status === "not_a_fit",
    city: r.city,
    state: r.state,
    submitted: r.created_at,
    updated: r.updated_at ?? r.created_at,
    updates,
  };
}

export function leadsCsv(kind: "seller" | "investor") {
  const rows = listLeads(kind, { limit: 100000 });
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]).filter((c) => c !== "idempotency_key" && c !== "status_token");
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    // Neutralize spreadsheet formula injection.
    const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}
