"use client";

/**
 * Provider-neutral analytics. Events only carry non-personal identifiers.
 * Configure with NEXT_PUBLIC_ANALYTICS_PROVIDER = "none" | "plausible" | "ga4" and NEXT_PUBLIC_ANALYTICS_ID.
 * Payloads are filtered through an allowlist so addresses, names, contact details and dollar values
 * can never be sent, even by mistake.
 */

export type EventName =
  | "cta_click"
  | "seller_form_start"
  | "seller_inquiry_submitted"
  | "calculator_start"
  | "calculator_step_complete"
  | "estimate_generated"
  | "estimate_manual_review"
  | "reviewed_offer_requested"
  | "state_selected"
  | "eligibility_inquiry_submitted"
  | "investor_form_start"
  | "investor_inquiry_submitted"
  | "contact_click"
  | "net_proceeds_compared"
  | "tool_completed";

const ALLOWED_KEYS = new Set(["route", "cta_id", "step", "state", "form", "method", "inquiry_type", "mode", "result"]);
const STATE_RE = /^[A-Z]{2}$/;

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Record<string, string> }) => void;
    gtag?: (...args: unknown[]) => void;
    __primedConsent?: boolean;
  }
}

function sanitize(props: Record<string, unknown>) {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(props)) {
    if (!ALLOWED_KEYS.has(k) || v === undefined || v === null) continue;
    const s = String(v).slice(0, 80);
    if (k === "state" && !STATE_RE.test(s)) continue;
    if (/@|\d{5,}|\$/.test(s)) continue; // never let contact details, ZIPs or amounts through
    out[k] = s;
  }
  return out;
}

const fired = new Set<string>();

/** dedupeKey: send a conversion once per page load (e.g. the lead id is NOT used; a random submission token is). */
export function track(name: EventName, props: Record<string, unknown> = {}, dedupeKey?: string) {
  if (typeof window === "undefined") return;
  if (dedupeKey) {
    const k = `${name}:${dedupeKey}`;
    if (fired.has(k)) return;
    fired.add(k);
  }
  const clean = sanitize({ route: window.location.pathname, ...props });
  const provider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER || "none";
  try {
    if (provider === "plausible" && window.plausible) window.plausible(name, { props: clean });
    if (provider === "ga4" && window.gtag && window.__primedConsent) window.gtag("event", name, clean);
    if (process.env.NODE_ENV !== "production" && provider === "none") console.debug("[analytics]", name, clean);
  } catch {
    /* analytics must never break the page */
  }
}
