/**
 * Pure underwriting engine. No I/O. Imported only by server code and tests.
 * Never import this module from a client component: it embeds the formula that
 * must stay private (see src/lib/estimator/service.ts for the public boundary).
 *
 * Formula (per scenario):
 *   sellerContractPriceCap = (ARV × buyerAcquisitionFactor)
 *                           − repairBudget
 *                           − separatelyBudgetedBuyerCosts
 *                           − targetWholesaleFee
 *                           − primedTransactionCosts
 *
 * - ARV: estimated value after the assumed repairs.
 * - buyerAcquisitionFactor: owner-defined investor pricing assumption. It is assumed to already
 *   include the investor's profit and risk margin, so neither is budgeted again below.
 * - separatelyBudgetedBuyerCosts: only allowances NOT already inside the factor
 *   (e.g. holding costs, financing, resale closing costs, contingency), configured by the owner.
 * - targetWholesaleFee: Primed's assignment/transaction compensation target (flat or % of ARV).
 * - primedTransactionCosts: Primed's own costs (e.g. earnest money carry, marketing to buyers),
 *   excluding anything already counted elsewhere.
 * The cap is the most Primed would target as the SELLER CONTRACT PRICE. It is not the seller's
 * net proceeds (seller payoffs/closing deductions are separate) and not the end buyer's total cost.
 */

export type ScenarioKey = "low" | "base" | "high";

export interface Scenario {
  /** Adjustment applied to ARV, e.g. -0.05 = 5% lower value assumption. */
  arvAdjustment: number;
  /** Multiplier applied to the repair budget, e.g. 1.25 = 25% more repairs. */
  repairMultiplier: number;
}

export interface EstimatorConfig {
  label: string;
  effectiveDate: string; // YYYY-MM-DD
  buyerAcquisitionFactor: number;
  fee: { mode: "flat" | "percentOfArv"; flat: number; percent: number };
  buyerCosts: { mode: "flat" | "percentOfArv"; flat: number; percent: number };
  primedTransactionCosts: number;
  scenarios: Record<ScenarioKey, Scenario>;
  minArv: number;
  maxArv: number;
  /** Repairs above this share of ARV are routed to manual review. */
  maxRepairRatio: number;
  roundingIncrement: number;
  eligiblePropertyTypes: string[];
  /**
   * Optional owner-defined planning model used ONLY when a seller does not know repair costs.
   * Values are $ per square foot by condition. Leave disabled until the owner has a defensible basis.
   */
  repairModel: { enabled: boolean; perSqft: Partial<Record<"good" | "fair" | "poor" | "major", number>> };
}

export interface StateRule {
  estimatesEnabled: boolean;
  buyerAcquisitionFactor?: number | null;
}

export interface EstimateInput {
  arv: number | null; // null = "I'm not sure"
  repairs: number | null; // null = "I'm not sure"
  sqft: number | null;
  propertyType: string;
  condition: "good" | "fair" | "poor" | "major" | "unsure";
  state: string;
}

export type EngineResult =
  | {
      status: "estimate";
      low: number;
      base: number;
      high: number;
      repairBasis: "seller" | "planning-model";
      repairsUsed: number;
      arvUsed: number;
    }
  | { status: "manual_review"; reasons: string[] };

const CENTS = 100;
const toCents = (d: number) => Math.round(d * CENTS);

function finitePositive(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}

/** Validates a config before it can be saved or used. Returns a list of problems (empty = valid). */
export function validateConfig(c: EstimatorConfig): string[] {
  const p: string[] = [];
  if (!(c.buyerAcquisitionFactor > 0 && c.buyerAcquisitionFactor < 1)) p.push("Buyer acquisition factor must be between 0 and 1.");
  if (c.fee.mode === "flat" && !(c.fee.flat >= 0)) p.push("Flat fee must be zero or more.");
  if (c.fee.mode === "percentOfArv" && !(c.fee.percent >= 0 && c.fee.percent < 0.5)) p.push("Fee percent must be between 0 and 0.5.");
  if (c.buyerCosts.mode === "flat" && !(c.buyerCosts.flat >= 0)) p.push("Buyer costs must be zero or more.");
  if (c.buyerCosts.mode === "percentOfArv" && !(c.buyerCosts.percent >= 0 && c.buyerCosts.percent < 0.5)) p.push("Buyer cost percent must be between 0 and 0.5.");
  if (!(c.primedTransactionCosts >= 0)) p.push("Transaction costs must be zero or more.");
  if (!(c.minArv > 0 && c.maxArv > c.minArv)) p.push("ARV bounds are invalid.");
  if (!(c.maxRepairRatio > 0 && c.maxRepairRatio <= 1)) p.push("Max repair ratio must be between 0 and 1.");
  if (!(c.roundingIncrement >= 1)) p.push("Rounding increment must be at least 1.");
  const s = c.scenarios;
  for (const k of ["low", "base", "high"] as const) {
    if (!s?.[k] || !Number.isFinite(s[k].arvAdjustment) || !(s[k].repairMultiplier > 0)) p.push(`Scenario ${k} is invalid.`);
  }
  if (s?.low && s?.base && s?.high) {
    if (!(s.low.arvAdjustment <= s.base.arvAdjustment && s.base.arvAdjustment <= s.high.arvAdjustment))
      p.push("Scenario ARV adjustments must increase from low to high.");
    if (!(s.low.repairMultiplier >= s.base.repairMultiplier && s.base.repairMultiplier >= s.high.repairMultiplier))
      p.push("Scenario repair multipliers must decrease from low to high.");
  }
  if (!Array.isArray(c.eligiblePropertyTypes) || c.eligiblePropertyTypes.length === 0) p.push("Choose at least one eligible property type.");
  return p;
}

/** Seller contract price cap for one scenario, in whole dollars (unrounded). */
export function contractPriceCap(
  arv: number,
  repairs: number,
  c: Pick<EstimatorConfig, "buyerAcquisitionFactor" | "fee" | "buyerCosts" | "primedTransactionCosts">,
): number {
  const arvC = toCents(arv);
  const gross = Math.round(arvC * c.buyerAcquisitionFactor);
  const fee = c.fee.mode === "flat" ? toCents(c.fee.flat) : Math.round(arvC * c.fee.percent);
  const buyerCosts = c.buyerCosts.mode === "flat" ? toCents(c.buyerCosts.flat) : Math.round(arvC * c.buyerCosts.percent);
  const capC = gross - toCents(repairs) - buyerCosts - fee - toCents(c.primedTransactionCosts);
  return capC / CENTS;
}

export function computeEstimate(input: EstimateInput, config: EstimatorConfig, stateRule: StateRule): EngineResult {
  const reasons: string[] = [];
  if (!stateRule.estimatesEnabled) reasons.push("state_not_enabled");
  if (!config.eligiblePropertyTypes.includes(input.propertyType)) reasons.push("property_type_needs_review");

  const arv = input.arv;
  if (arv === null) reasons.push("value_unknown");
  else if (!finitePositive(arv)) reasons.push("value_invalid");
  else if (arv < config.minArv || arv > config.maxArv) reasons.push("value_outside_range");

  let repairs: number | null = null;
  let repairBasis: "seller" | "planning-model" = "seller";
  if (input.repairs !== null) {
    if (typeof input.repairs !== "number" || !Number.isFinite(input.repairs) || input.repairs < 0) reasons.push("repairs_invalid");
    else repairs = input.repairs;
  } else if (config.repairModel.enabled && input.condition !== "unsure" && finitePositive(input.sqft)) {
    const rate = config.repairModel.perSqft[input.condition];
    if (typeof rate === "number" && rate >= 0) {
      repairs = Math.round(rate * input.sqft);
      repairBasis = "planning-model";
    } else reasons.push("repairs_unknown");
  } else reasons.push("repairs_unknown");

  if (reasons.length) return { status: "manual_review", reasons };
  const a = arv as number;
  const r = repairs as number;
  if (r / a > config.maxRepairRatio) return { status: "manual_review", reasons: ["repairs_high_relative_to_value"] };

  const factor = stateRule.buyerAcquisitionFactor ?? config.buyerAcquisitionFactor;
  const cfg = { ...config, buyerAcquisitionFactor: factor };
  const inc = config.roundingIncrement;
  const round = (v: number) => Math.floor(v / inc) * inc; // round down: never overstate
  const out = {} as Record<ScenarioKey, number>;
  for (const k of ["low", "base", "high"] as const) {
    const s = config.scenarios[k];
    out[k] = round(contractPriceCap(a * (1 + s.arvAdjustment), r * s.repairMultiplier, cfg));
  }
  if (!(out.low > 0)) return { status: "manual_review", reasons: ["no_positive_range"] };
  if (!(out.low <= out.base && out.base <= out.high)) return { status: "manual_review", reasons: ["range_inconsistent"] };
  return { status: "estimate", ...out, repairBasis, repairsUsed: r, arvUsed: a };
}

/** Private automated-test fixture. Not a recommendation, company policy, or live default. */
export const TEST_FIXTURE_CONFIG: EstimatorConfig = {
  label: "TEST-FIXTURE (not a Primed offer)",
  effectiveDate: "2026-01-01",
  buyerAcquisitionFactor: 0.8,
  fee: { mode: "flat", flat: 20000, percent: 0 },
  buyerCosts: { mode: "flat", flat: 15000, percent: 0 },
  primedTransactionCosts: 5000,
  scenarios: {
    low: { arvAdjustment: -0.05, repairMultiplier: 1.2 },
    base: { arvAdjustment: 0, repairMultiplier: 1 },
    high: { arvAdjustment: 0.03, repairMultiplier: 0.9 },
  },
  minArv: 50000,
  maxArv: 3000000,
  maxRepairRatio: 0.6,
  roundingIncrement: 1000,
  eligiblePropertyTypes: ["single_family", "townhouse", "condo", "multi_2_4", "manufactured_land"],
  repairModel: { enabled: false, perSqft: {} },
};
