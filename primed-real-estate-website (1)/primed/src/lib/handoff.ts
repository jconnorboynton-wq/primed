"use client";

/**
 * Carries property details between tools and forms (calculator -> contact, map -> contact,
 * timeline planner -> form) inside the browser tab only. Nothing personal is ever put in a URL.
 */
export interface Handoff {
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  propertyType?: string;
  condition?: string;
  occupancy?: string;
  sqft?: string;
  arv?: string;
  repairs?: string;
  estimateId?: string;
  estimateSummary?: string;
  timeline?: string;
  preferredDate?: string;
  circumstances?: string;
  source?: string;
}

const KEY = "primed.handoff";
export const HANDOFF_EVENT = "primed:handoff";

export function readHandoff(): Handoff {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || "{}") as Handoff;
  } catch {
    return {};
  }
}

export function writeHandoff(patch: Handoff) {
  try {
    const next = { ...readHandoff(), ...patch };
    sessionStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(HANDOFF_EVENT, { detail: next }));
  } catch {
    /* storage unavailable: forms still work with manual entry */
  }
}

const UTM_KEY = "primed.attribution";
export function readAttribution(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(UTM_KEY) || "{}");
  } catch {
    return {};
  }
}

/** First-touch attribution for this visit. UTM values stay in the URL only on the landing request. */
export function captureAttribution() {
  try {
    if (sessionStorage.getItem(UTM_KEY)) return;
    const u = new URL(window.location.href);
    const out: Record<string, string> = { landing_page: u.pathname };
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
      const v = u.searchParams.get(k);
      if (v) out[k] = v.slice(0, 120);
    }
    if (document.referrer) {
      try {
        const r = new URL(document.referrer);
        if (r.host !== u.host) out.referrer = r.origin;
      } catch {}
    }
    sessionStorage.setItem(UTM_KEY, JSON.stringify(out));
  } catch {}
}

export function newIdempotencyKey() {
  return crypto.randomUUID();
}
