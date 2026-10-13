"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireOwner, verifyPassword, setSessionCookie, clearSessionCookie, adminConfigured } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { saveSettings, saveStateConfig, getSettings, type TransactionStatus } from "@/lib/settings";
import { updateLeadStatus, logActivity, setFollowUp, deleteLead, getLead } from "@/lib/leads";
import { saveVersion, activateVersion } from "@/lib/estimator/service";
import type { EstimatorConfig } from "@/lib/estimator/engine";
import { saveOverride, resetOverride, type PageSlug } from "@/content/loader";
import { saveResource, deleteResource } from "@/lib/resources";
import { retryFailed } from "@/lib/integrations";
import { db, nowIso, newId, audit } from "@/lib/db";
import { saveImage } from "@/lib/uploads";

export type ActionState = { ok?: boolean; message?: string; problems?: string[] };

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const num = (f: FormData, k: string) => Number(str(f, k));
const bool = (f: FormData, k: string) => f.get(k) === "on" || f.get(k) === "true";

/* ---------- Auth ---------- */
export async function login(_: ActionState, f: FormData): Promise<ActionState> {
  if (!adminConfigured()) return { message: "Owner access isn't configured yet. Set ADMIN_PASSWORD_HASH and SESSION_SECRET on the server." };
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0] || "local";
  if (!rateLimit(`login:${ip}`, 5, 15 * 60_000).ok) return { message: "Too many attempts. Try again in 15 minutes." };
  if (!verifyPassword(str(f, "password"))) {
    audit("auth.fail");
    return { message: "That password isn't correct." };
  }
  await setSessionCookie();
  audit("auth.login");
  redirect("/admin");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/admin/login");
}

/* ---------- Leads ---------- */
export async function setLeadStatus(f: FormData) {
  await requireOwner();
  const kind = str(f, "kind") === "investor" ? "investor" : "seller";
  updateLeadStatus(kind, str(f, "id"), str(f, "status"));
  audit("lead.status", `${kind}:${str(f, "id")}:${str(f, "status")}`);
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${str(f, "id")}`);
}

const leadKind = (f: FormData) => (str(f, "kind") === "investor" ? "investor" : "seller") as "seller" | "investor";

/** Add a private note, a logged contact attempt, or an update the seller can see on their status page. */
export async function addLeadNote(_: ActionState, f: FormData): Promise<ActionState> {
  await requireOwner();
  const kind = leadKind(f);
  const id = str(f, "id");
  const body = str(f, "body");
  const type = str(f, "type");
  if (!getLead(kind, id)) return { message: "Lead not found." };
  if (!body) return { message: "Write something first." };
  if (body.length > 4000) return { message: "Keep notes under 4,000 characters." };
  const sellerVisible = kind === "seller" && type === "seller_update";
  const activityType = type === "call" || type === "email" || type === "text" ? "contact" : "note";
  const text = activityType === "contact" ? `${type === "call" ? "Call" : type === "email" ? "Email" : "Text"}: ${body}` : body;
  logActivity(kind, id, activityType, text, sellerVisible);
  audit("lead.note", `${kind}:${id}${sellerVisible ? ":visible" : ""}`);
  revalidatePath(`/admin/leads/${id}`);
  return { ok: true, message: sellerVisible ? "Update posted. The seller will see it on their status page." : "Saved to the activity log." };
}

export async function setLeadFollowUp(f: FormData) {
  await requireOwner();
  const kind = leadKind(f);
  const id = str(f, "id");
  const date = str(f, "date");
  setFollowUp(kind, id, f.get("clear") ? null : date || null);
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin");
}

export async function removeLead(f: FormData) {
  await requireOwner();
  const kind = leadKind(f);
  const id = str(f, "id");
  if (str(f, "confirm") !== "DELETE") redirect(`/admin/leads/${id}?kind=${kind}&del=confirm`);
  deleteLead(kind, id);
  audit("lead.delete", `${kind}:${id}`);
  revalidatePath("/admin/leads");
  redirect(`/admin/leads?kind=${kind}&deleted=1`);
}

export async function retryIntegrations() {
  await requireOwner();
  retryFailed();
  revalidatePath("/admin");
}

/* ---------- Business settings ---------- */
export async function updateSettings(_: ActionState, f: FormData): Promise<ActionState> {
  await requireOwner();
  const email = str(f, "email");
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return { message: "Enter a valid public email address or leave it blank." };
  const socials = str(f, "socials")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [label, url] = l.split("|").map((x) => x.trim());
      return { label, url };
    })
    .filter((x) => x.label && /^https:\/\//.test(x.url || ""));
  const logoPath = str(f, "logoPath") || "/brand/logo-cutout-720.webp";
  if (!/^\/(brand|media)\/[\w.-]+$/.test(logoPath)) return { message: "Logo path must be a file under /brand/ or /media/." };
  const cur = getSettings();
  saveSettings({
    phone: str(f, "phone"),
    email,
    contactHours: str(f, "contactHours"),
    mailingAddress: str(f, "mailingAddress"),
    socials,
    logoPath,
    logoAlt: str(f, "logoAlt") || "Primed Real Estate",
    roleStatement: str(f, "roleStatement") || cur.roleStatement,
    searchConsoleVerification: str(f, "searchConsoleVerification"),
    marketingEmailProgram: bool(f, "marketingEmailProgram"),
    marketingSmsProgram: bool(f, "marketingSmsProgram"),
    smsProgramTerms: str(f, "smsProgramTerms"),
    navLabels: {
      sell: str(f, "nav_sell") || cur.navLabels.sell,
      calculator: str(f, "nav_calculator") || cur.navLabels.calculator,
      areas: str(f, "nav_areas") || cur.navLabels.areas,
      resources: str(f, "nav_resources") || cur.navLabels.resources,
      about: str(f, "nav_about") || cur.navLabels.about,
      investors: str(f, "nav_investors") || cur.navLabels.investors,
      cta: str(f, "nav_cta") || cur.navLabels.cta,
    },
  });
  if (bool(f, "marketingSmsProgram") && !str(f, "smsProgramTerms")) return { ok: true, message: "Saved. Add your SMS program terms (frequency, rates, STOP/HELP) before relying on SMS consent." };
  revalidatePath("/", "layout");
  return { ok: true, message: "Settings saved." };
}

export async function uploadPublicImage(_: ActionState, f: FormData): Promise<ActionState> {
  await requireOwner();
  const file = f.get("image");
  if (!(file instanceof File) || file.size === 0) return { message: "Choose an image to upload." };
  const r = await saveImage(file);
  if (!r.ok) return { message: r.error };
  const row = db().prepare("SELECT value FROM settings WHERE key = 'public_media'").get() as { value: string } | undefined;
  const list: string[] = row ? JSON.parse(row.value) : [];
  list.push(r.path);
  db().prepare("INSERT INTO settings (key, value, updated_at) VALUES ('public_media', ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at").run(JSON.stringify(list), nowIso());
  audit("media.upload", r.path);
  return { ok: true, message: `Uploaded. Public path: ${r.path}` };
}

/* ---------- States ---------- */
export async function updateState(_: ActionState, f: FormData): Promise<ActionState> {
  await requireOwner();
  const abbr = str(f, "abbr");
  const status = str(f, "transactionStatus") as TransactionStatus;
  if (!["approved", "manual_review", "not_available"].includes(status)) return { message: "Invalid status." };
  const factorRaw = str(f, "buyerAcquisitionFactor");
  const factor = factorRaw ? Number(factorRaw) : null;
  if (factor !== null && !(factor > 0 && factor < 1)) return { message: "Factor override must be between 0 and 1, or blank." };
  const pageHref = str(f, "pageHref");
  if (pageHref && !/^\/[\w/-]+$/.test(pageHref)) return { message: "Page link must be an internal path like /service-areas/washington." };
  if (status === "approved" && !str(f, "reviewDate")) return { message: "Record a review date before approving transactions in a state." };
  saveStateConfig(abbr, {
    intake: true,
    transactionStatus: status,
    estimatesEnabled: bool(f, "estimatesEnabled"),
    buyerAcquisitionFactor: factor,
    publicNote: str(f, "publicNote").slice(0, 300),
    disclosure: str(f, "disclosure").slice(0, 2000),
    reviewDate: str(f, "reviewDate"),
    sourceRef: str(f, "sourceRef").slice(0, 500),
    pageHref: pageHref || null,
  });
  revalidatePath("/", "layout");
  return { ok: true, message: `${abbr} saved.` };
}

/* ---------- Estimator ---------- */
export async function saveEstimatorVersion(_: ActionState, f: FormData): Promise<ActionState> {
  await requireOwner();
  const types = f.getAll("eligiblePropertyTypes").map(String);
  const cfg: EstimatorConfig = {
    label: str(f, "label"),
    effectiveDate: str(f, "effectiveDate"),
    buyerAcquisitionFactor: num(f, "buyerAcquisitionFactor"),
    fee: { mode: str(f, "feeMode") === "percentOfArv" ? "percentOfArv" : "flat", flat: num(f, "feeFlat") || 0, percent: (num(f, "feePercent") || 0) / 100 },
    buyerCosts: { mode: str(f, "buyerCostsMode") === "percentOfArv" ? "percentOfArv" : "flat", flat: num(f, "buyerCostsFlat") || 0, percent: (num(f, "buyerCostsPercent") || 0) / 100 },
    primedTransactionCosts: num(f, "primedTransactionCosts") || 0,
    scenarios: {
      low: { arvAdjustment: num(f, "lowArv") / 100, repairMultiplier: num(f, "lowRepair") },
      base: { arvAdjustment: num(f, "baseArv") / 100, repairMultiplier: num(f, "baseRepair") },
      high: { arvAdjustment: num(f, "highArv") / 100, repairMultiplier: num(f, "highRepair") },
    },
    minArv: num(f, "minArv"),
    maxArv: num(f, "maxArv"),
    maxRepairRatio: num(f, "maxRepairRatio") / 100,
    roundingIncrement: num(f, "roundingIncrement"),
    eligiblePropertyTypes: types,
    repairModel: {
      enabled: bool(f, "repairModelEnabled"),
      perSqft: Object.fromEntries((["good", "fair", "poor", "major"] as const).map((k) => [k, str(f, `rm_${k}`) === "" ? undefined : num(f, `rm_${k}`)]).filter(([, v]) => v !== undefined && Number.isFinite(v as number))),
    },
  };
  if (!cfg.label || !/^\d{4}-\d{2}-\d{2}$/.test(cfg.effectiveDate)) return { message: "Add a version label and an effective date." };
  const r = saveVersion(cfg, str(f, "changeNote"), bool(f, "activate"));
  if (!r.ok) return { message: "This version wasn't saved.", problems: r.problems };
  revalidatePath("/admin/estimator");
  return { ok: true, message: `Version ${r.id} saved${bool(f, "activate") ? " and activated" : ""}.` };
}

export async function activateEstimatorVersion(f: FormData) {
  await requireOwner();
  activateVersion(num(f, "id"));
  revalidatePath("/admin/estimator");
}

export async function setEstimatorMode(f: FormData) {
  await requireOwner();
  saveSettings({ estimatorMode: str(f, "mode") === "live" ? "live" : "disabled" });
  revalidatePath("/admin/estimator");
}

/* ---------- Content ---------- */
export async function savePageContent(_: ActionState, f: FormData): Promise<ActionState> {
  await requireOwner();
  const slug = str(f, "slug") as PageSlug;
  let json: unknown;
  try {
    json = JSON.parse(String(f.get("json") ?? ""));
  } catch (e) {
    return { message: `That isn't valid JSON: ${(e as Error).message}` };
  }
  const r = saveOverride(slug, json);
  if (!r.ok) return { message: "Not saved. Fix these problems:", problems: r.problems };
  revalidatePath("/", "layout");
  return { ok: true, message: "Page saved and published." };
}

export async function resetPageContent(f: FormData) {
  await requireOwner();
  resetOverride(str(f, "slug") as PageSlug);
  revalidatePath("/", "layout");
}

export async function saveArticle(_: ActionState, f: FormData): Promise<ActionState> {
  await requireOwner();
  let json: unknown;
  try {
    json = JSON.parse(String(f.get("json") ?? ""));
  } catch (e) {
    return { message: `That isn't valid JSON: ${(e as Error).message}` };
  }
  const r = saveResource(json, str(f, "status") === "published" ? "published" : "draft");
  if (!r.ok) return { message: "Not saved.", problems: r.problems };
  revalidatePath("/", "layout");
  return { ok: true, message: "Article saved." };
}

export async function removeArticle(f: FormData) {
  await requireOwner();
  deleteResource(str(f, "slug"));
  revalidatePath("/admin/resources");
}

/* ---------- Team ---------- */
export async function saveTeamMember(_: ActionState, f: FormData): Promise<ActionState> {
  await requireOwner();
  const name = str(f, "name");
  if (!name) return { message: "Name is required." };
  let photo = str(f, "existingPhoto") || null;
  const file = f.get("photo");
  if (file instanceof File && file.size > 0) {
    const r = await saveImage(file);
    if (!r.ok) return { message: r.error };
    photo = r.path;
  }
  const alt = str(f, "alt");
  if (photo && !alt) return { message: "Add alt text describing the photo." };
  const id = str(f, "id") || newId("tm");
  db()
    .prepare(`INSERT INTO team_members (id, name, role, bio, photo_path, alt, display_order, published, created_at) VALUES (?,?,?,?,?,?,?,?,?)
      ON CONFLICT(id) DO UPDATE SET name=excluded.name, role=excluded.role, bio=excluded.bio, photo_path=excluded.photo_path, alt=excluded.alt, display_order=excluded.display_order, published=excluded.published`)
    .run(id, name, str(f, "role") || null, str(f, "bio") || null, photo, alt || null, num(f, "displayOrder") || 0, bool(f, "published") ? 1 : 0, nowIso());
  audit("team.save", id);
  revalidatePath("/", "layout");
  return { ok: true, message: "Profile saved." };
}

export async function deleteTeamMember(f: FormData) {
  await requireOwner();
  db().prepare("DELETE FROM team_members WHERE id = ?").run(str(f, "id"));
  audit("team.delete", str(f, "id"));
  revalidatePath("/", "layout");
}

export async function setTeamEnabled(f: FormData) {
  await requireOwner();
  saveSettings({ teamEnabled: str(f, "enabled") === "true" });
  revalidatePath("/", "layout");
}

/* ---------- Estimator test bench (owner only; shows private detail) ---------- */
export async function testEstimator(_: ActionState, f: FormData): Promise<ActionState> {
  await requireOwner();
  const { listVersions } = await import("@/lib/estimator/service");
  const { computeEstimate, contractPriceCap, TEST_FIXTURE_CONFIG } = await import("@/lib/estimator/engine");
  const id = str(f, "versionId");
  const v = id === "fixture" ? { config: TEST_FIXTURE_CONFIG } : listVersions().find((x) => String(x.id) === id);
  if (!v) return { message: "Choose a version." };
  const arv = num(f, "arv"), repairs = num(f, "repairs");
  const r = computeEstimate({ arv, repairs, sqft: null, propertyType: "single_family", condition: "fair", state: "WA" }, v.config, { estimatesEnabled: true });
  const rawBase = contractPriceCap(arv, repairs, v.config);
  if (r.status !== "estimate") return { ok: true, message: `Manual review: ${r.reasons.join(", ")} (unrounded base cap ${rawBase.toLocaleString()})` };
  return { ok: true, message: `Low ${r.low.toLocaleString()} · Base ${r.base.toLocaleString()} · High ${r.high.toLocaleString()} (unrounded base cap ${rawBase.toLocaleString()})` };
}
