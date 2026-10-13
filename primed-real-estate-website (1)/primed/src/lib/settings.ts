import "server-only";
import { db, nowIso, audit } from "./db";
import STATES from "@/data/states.json";

/** Public business settings, editable in /admin/settings. Empty values are simply not shown. */
export interface BusinessSettings {
  phone: string;
  email: string;
  contactHours: string;
  mailingAddress: string; // only shown if the owner supplies a real address
  socials: { label: string; url: string }[];
  logoPath: string;
  logoAlt: string;
  teamEnabled: boolean;
  estimatorMode: "disabled" | "live";
  roleStatement: string;
  navLabels: { sell: string; calculator: string; areas: string; resources: string; about: string; investors: string; cta: string };
  searchConsoleVerification: string;
  /** Turn on only when a real email marketing program exists. */
  marketingEmailProgram: boolean;
  /** Turn on only when a compliant SMS program (with its own terms) exists. */
  marketingSmsProgram: boolean;
  smsProgramTerms: string;
}

export const DEFAULT_SETTINGS: BusinessSettings = {
  phone: process.env.PUBLIC_PHONE || "",
  email: process.env.PUBLIC_EMAIL || "",
  contactHours: "",
  mailingAddress: "",
  socials: [],
  logoPath: "/brand/logo-cutout-720.webp",
  logoAlt: "Primed Real Estate",
  teamEnabled: false,
  estimatorMode: "disabled",
  roleStatement:
    "Primed Real Estate is a real estate wholesaling company based in Washington State. We are not a real estate brokerage and do not represent sellers or buyers as agents. When we sign a purchase agreement, we may close on the property ourselves, or we may assign our contract rights to another buyer and be paid for that assignment. Any arrangement is disclosed in writing before you sign.",
  navLabels: {
    sell: "Sell Your Property",
    calculator: "Cash Offer Calculator",
    areas: "Service Areas",
    resources: "Resources",
    about: "About",
    investors: "Investors",
    cta: "Estimate My Cash Offer",
  },
  searchConsoleVerification: process.env.GOOGLE_SITE_VERIFICATION || "",
  marketingEmailProgram: false,
  marketingSmsProgram: false,
  smsProgramTerms: "",
};

export function getSettings(): BusinessSettings {
  const row = db().prepare("SELECT value FROM settings WHERE key = 'business'").get() as { value: string } | undefined;
  if (!row) return DEFAULT_SETTINGS;
  const saved = JSON.parse(row.value) as Partial<BusinessSettings>;
  // Older saves pointed at the dark-background crop; move them to the transparent cutout.
  if (saved.logoPath === "/brand/logo.webp") saved.logoPath = DEFAULT_SETTINGS.logoPath;
  return { ...DEFAULT_SETTINGS, ...saved, navLabels: { ...DEFAULT_SETTINGS.navLabels, ...(saved.navLabels || {}) } };
}

export function saveSettings(next: Partial<BusinessSettings>) {
  const merged = { ...getSettings(), ...next };
  db()
    .prepare("INSERT INTO settings (key, value, updated_at) VALUES ('business', ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at")
    .run(JSON.stringify(merged), nowIso());
  audit("settings.update", Object.keys(next).join(","));
  return merged;
}

/* ---------------- State eligibility ---------------- */

export type TransactionStatus = "approved" | "manual_review" | "not_available";

export interface StateConfig {
  abbr: string;
  intake: boolean; // inquiries accepted (all states by default)
  transactionStatus: TransactionStatus; // default manual review: never auto-approved
  estimatesEnabled: boolean; // numerical estimates allowed in this state
  buyerAcquisitionFactor: number | null; // optional per-state override (private)
  publicNote: string; // short public text shown in the map panel
  disclosure: string; // owner-supplied, approved state disclosure (shown on forms when present)
  reviewDate: string; // when the owner last reviewed this state's rules
  sourceRef: string; // private reference to the rule source / counsel review
  pageHref: string | null; // substantive public page, if one exists
}

export const HOME_STATE = "WA";

export function defaultStateConfig(abbr: string): StateConfig {
  return {
    abbr,
    intake: true,
    transactionStatus: "manual_review",
    estimatesEnabled: false,
    buyerAcquisitionFactor: null,
    publicNote: "",
    disclosure: "",
    reviewDate: "",
    sourceRef: "",
    pageHref: abbr === "WA" ? "/service-areas/washington" : null,
  };
}

export function getAllStateConfigs(): Record<string, StateConfig> {
  const rows = db().prepare("SELECT abbr, json FROM state_config").all() as { abbr: string; json: string }[];
  const saved = Object.fromEntries(rows.map((r) => [r.abbr, JSON.parse(r.json) as Partial<StateConfig>]));
  return Object.fromEntries(
    (STATES as { abbr: string }[]).map((s) => [s.abbr, { ...defaultStateConfig(s.abbr), ...(saved[s.abbr] || {}), abbr: s.abbr }]),
  );
}

export function getStateConfig(abbr: string): StateConfig | null {
  return getAllStateConfigs()[abbr] ?? null;
}

export function saveStateConfig(abbr: string, patch: Partial<StateConfig>) {
  const current = getStateConfig(abbr);
  if (!current) throw new Error("Unknown state");
  const next = { ...current, ...patch, abbr };
  db()
    .prepare("INSERT INTO state_config (abbr, json, updated_at) VALUES (?, ?, ?) ON CONFLICT(abbr) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at")
    .run(abbr, JSON.stringify(next), nowIso());
  audit("state.update", abbr);
  return next;
}

/** Only non-sensitive fields ever leave the server. */
export interface PublicStateInfo {
  abbr: string;
  name: string;
  isHome: boolean;
  status: TransactionStatus;
  estimatesEnabled: boolean;
  note: string;
  pageHref: string | null;
}

export function getPublicStates(): PublicStateInfo[] {
  const all = getAllStateConfigs();
  return (STATES as { abbr: string; name: string }[]).map((s) => {
    const c = all[s.abbr];
    return {
      abbr: s.abbr,
      name: s.name,
      isHome: s.abbr === HOME_STATE,
      status: c.transactionStatus,
      estimatesEnabled: c.estimatesEnabled,
      note: c.publicNote,
      pageHref: c.pageHref,
    };
  });
}
