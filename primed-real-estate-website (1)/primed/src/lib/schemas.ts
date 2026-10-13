import { z } from "zod";
import STATES from "@/data/states.json";

/** Shared between client and server. The server always re-validates. */

const stateAbbrs = (STATES as { abbr: string }[]).map((s) => s.abbr) as [string, ...string[]];

export const PROPERTY_TYPES = [
  { value: "single_family", label: "Single-family house" },
  { value: "townhouse", label: "Townhouse" },
  { value: "condo", label: "Condo" },
  { value: "multi_2_4", label: "Duplex to fourplex" },
  { value: "manufactured_land", label: "Manufactured home on owned land" },
  { value: "manufactured_park", label: "Manufactured home in a park" },
  { value: "multi_5_plus", label: "Apartment building (5+ units)" },
  { value: "land", label: "Vacant land" },
  { value: "other", label: "Something else" },
] as const;

export const CONDITIONS = [
  { value: "good", label: "Good: livable, mostly cosmetic updates" },
  { value: "fair", label: "Fair: dated, some repairs needed" },
  { value: "poor", label: "Poor: several major items need work" },
  { value: "major", label: "Major: extensive damage or structural issues" },
  { value: "unsure", label: "I'm not sure" },
] as const;

export const OCCUPANCY = [
  { value: "owner", label: "I live there" },
  { value: "tenant", label: "Tenant-occupied" },
  { value: "vacant", label: "Vacant" },
  { value: "family", label: "Family member or other occupant" },
  { value: "unsure", label: "Not sure" },
] as const;

export const TIMELINES = [
  { value: "asap", label: "As soon as practical" },
  { value: "30_60", label: "Within 30 to 60 days" },
  { value: "60_90", label: "Within 60 to 90 days" },
  { value: "flexible", label: "Flexible / just exploring" },
  { value: "specific", label: "I have a specific date in mind" },
] as const;

export const CONTACT_METHODS = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone call" },
  { value: "text", label: "Text message" },
] as const;

const trimmed = (max: number) => z.string().trim().max(max);
const optText = (max: number) => trimmed(max).optional().or(z.literal("")).transform((v) => v || undefined);
const money = z
  .union([z.number(), z.string()])
  .transform((v) => (typeof v === "string" ? Number(v.replace(/[$,\s]/g, "")) : v))
  .refine((v) => Number.isFinite(v) && v >= 0 && v <= 50_000_000, "Enter a dollar amount between $0 and $50,000,000.");

export const estimateInputSchema = z.object({
  state: z.enum(stateAbbrs, { errorMap: () => ({ message: "Choose a state." }) }),
  zip: z.string().trim().regex(/^\d{5}$/, "Enter a 5-digit ZIP code.").optional().or(z.literal("")),
  propertyType: z.enum(PROPERTY_TYPES.map((p) => p.value) as [string, ...string[]]),
  sqft: z
    .union([z.number(), z.string(), z.null()])
    .transform((v) => (v === null || v === "" ? null : Number(v)))
    .refine((v) => v === null || (Number.isFinite(v) && v >= 200 && v <= 30000), "Enter a size between 200 and 30,000 sq ft, or leave it blank.")
    .nullable(),
  condition: z.enum(CONDITIONS.map((c) => c.value) as [string, ...string[]]),
  arv: z.union([money, z.null()]),
  repairs: z.union([money, z.null()]),
});
export type EstimateInputPayload = z.infer<typeof estimateInputSchema>;

const utmSchema = z
  .object({
    utm_source: optText(120),
    utm_medium: optText(120),
    utm_campaign: optText(120),
    utm_term: optText(120),
    utm_content: optText(120),
    landing_page: optText(300),
    referrer: optText(300),
  })
  .partial()
  .optional();

const consentSchema = z.object({
  marketingEmail: z.boolean().default(false),
  marketingSms: z.boolean().default(false),
});

export const sellerLeadSchema = z
  .object({
    idempotencyKey: z.string().uuid(),
    inquiryType: z.enum(["property_review", "reviewed_offer", "time_sensitive", "location_check", "general"]),
    name: trimmed(120).min(1, "Please tell us your name."),
    email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(200).optional().or(z.literal("")),
    phone: z
      .string()
      .trim()
      .transform((v) => v.replace(/[^\d+]/g, ""))
      .refine((v) => v === "" || /^\+?1?\d{10}$/.test(v), "Enter a 10-digit US phone number.")
      .optional(),
    preferredContact: z.enum(["email", "phone", "text"]),
    address: optText(200),
    city: optText(100),
    state: z.enum(stateAbbrs, { errorMap: () => ({ message: "Choose the property's state." }) }),
    zip: z.string().trim().regex(/^\d{5}$/, "Enter a 5-digit ZIP code.").optional().or(z.literal("")),
    propertyType: z.enum(PROPERTY_TYPES.map((p) => p.value) as [string, ...string[]]).optional(),
    condition: z.enum(CONDITIONS.map((c) => c.value) as [string, ...string[]]).optional(),
    occupancy: z.enum(OCCUPANCY.map((c) => c.value) as [string, ...string[]]).optional(),
    bedrooms: optText(10),
    bathrooms: optText(10),
    sqft: z.union([z.number(), z.string()]).optional().transform((v) => (v === undefined || v === "" ? undefined : Number(v))).refine((v) => v === undefined || (Number.isFinite(v) && v > 0 && v < 100000), "Enter a valid size."),
    ownerArv: money.optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),
    ownerRepairs: money.optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),
    timeline: z.enum(TIMELINES.map((c) => c.value) as [string, ...string[]]).optional(),
    preferredDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
    deadline: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
    circumstances: optText(60),
    notes: optText(2000),
    estimateId: z.string().regex(/^est_[a-z0-9]{20}$/).optional().or(z.literal("")),
    sourcePage: optText(200),
    utm: utmSchema,
    consent: consentSchema,
    company: z.string().max(0, "Leave this field empty.").optional().or(z.literal("")), // honeypot
  })
  .superRefine((v, ctx) => {
    const needsEmail = v.preferredContact === "email";
    const needsPhone = v.preferredContact === "phone" || v.preferredContact === "text";
    if (needsEmail && !v.email) ctx.addIssue({ code: "custom", path: ["email"], message: "Add an email address so we can reply by email." });
    if (needsPhone && !v.phone) ctx.addIssue({ code: "custom", path: ["phone"], message: "Add a phone number so we can call or text." });
    if (v.consent.marketingSms && !v.phone) ctx.addIssue({ code: "custom", path: ["phone"], message: "Text updates need a phone number." });
  });
export type SellerLeadPayload = z.input<typeof sellerLeadSchema>;

export const INVESTOR_STRATEGIES = [
  { value: "fix_flip", label: "Fix and flip" },
  { value: "buy_hold", label: "Buy and hold rental" },
  { value: "brrrr", label: "Renovate, rent and refinance" },
  { value: "new_build", label: "Redevelopment / new construction" },
  { value: "short_term", label: "Short-term rental" },
  { value: "other", label: "Other" },
] as const;

export const REHAB_TOLERANCE = [
  { value: "turnkey", label: "Turnkey or light cosmetic only" },
  { value: "moderate", label: "Moderate: kitchens, baths, systems" },
  { value: "heavy", label: "Heavy: full gut and major systems" },
  { value: "structural", label: "Structural and teardown candidates" },
] as const;

export const INVESTOR_TIMING = [
  { value: "now", label: "Actively buying now" },
  { value: "90_days", label: "Within 90 days" },
  { value: "6_months", label: "Within 6 months" },
  { value: "watching", label: "Watching the market" },
] as const;

export const investorLeadSchema = z
  .object({
    idempotencyKey: z.string().uuid(),
    name: trimmed(120).min(1, "Please tell us your name."),
    entity: optText(160),
    email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(200),
    phone: z
      .string()
      .trim()
      .transform((v) => v.replace(/[^\d+]/g, ""))
      .refine((v) => v === "" || /^\+?1?\d{10}$/.test(v), "Enter a 10-digit US phone number.")
      .optional(),
    preferredContact: z.enum(["email", "phone", "text"]),
    markets: trimmed(600).min(2, "List at least one market (city, county, metro or state)."),
    propertyTypes: z.array(z.enum(PROPERTY_TYPES.map((p) => p.value) as [string, ...string[]])).min(1, "Choose at least one property type."),
    priceMin: money.optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),
    priceMax: money.optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),
    strategy: z.array(z.enum(INVESTOR_STRATEGIES.map((p) => p.value) as [string, ...string[]])).min(1, "Choose at least one strategy."),
    rehabTolerance: z.enum(REHAB_TOLERANCE.map((p) => p.value) as [string, ...string[]]),
    timing: z.enum(INVESTOR_TIMING.map((p) => p.value) as [string, ...string[]]),
    notes: optText(2000),
    sourcePage: optText(200),
    utm: utmSchema,
    consent: consentSchema,
    company: z.string().max(0).optional().or(z.literal("")), // honeypot
  })
  .superRefine((v, ctx) => {
    if ((v.preferredContact === "phone" || v.preferredContact === "text") && !v.phone)
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Add a phone number so we can call or text." });
    if (v.priceMin !== undefined && v.priceMax !== undefined && v.priceMin > v.priceMax)
      ctx.addIssue({ code: "custom", path: ["priceMax"], message: "Maximum price should be higher than the minimum." });
    if (v.consent.marketingSms && !v.phone) ctx.addIssue({ code: "custom", path: ["phone"], message: "Text updates need a phone number." });
  });
export type InvestorLeadPayload = z.input<typeof investorLeadSchema>;

export function fieldErrors(err: z.ZodError) {
  const out: Record<string, string> = {};
  for (const i of err.issues) {
    const k = i.path.join(".") || "_form";
    if (!out[k]) out[k] = i.message;
  }
  return out;
}
