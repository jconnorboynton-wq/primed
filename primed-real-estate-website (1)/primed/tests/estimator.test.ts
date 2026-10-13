import { test } from "node:test";
import assert from "node:assert/strict";
import { computeEstimate, contractPriceCap, validateConfig, TEST_FIXTURE_CONFIG as F } from "../src/lib/estimator/engine.ts";

const base = { sqft: 1600, propertyType: "single_family", condition: "fair" as const, state: "WA" };
const on = { estimatesEnabled: true };

test("formula fixture: ARV 400k, factor .80, repairs 40k, buyer costs 15k, fee 20k, Primed costs 5k = 240,000", () => {
  assert.equal(contractPriceCap(400000, 40000, F), 240000);
});

test("base scenario equals fixture result and ranges are ordered", () => {
  const r = computeEstimate({ ...base, arv: 400000, repairs: 40000 }, F, on);
  assert.equal(r.status, "estimate");
  if (r.status !== "estimate") return;
  assert.equal(r.base, 240000);
  assert.ok(r.low <= r.base && r.base <= r.high, `${r.low} <= ${r.base} <= ${r.high}`);
  assert.equal(r.low % F.roundingIncrement, 0);
  assert.equal(r.high % F.roundingIncrement, 0);
});

test("percent fee mode uses ARV", () => {
  const c = { ...F, fee: { mode: "percentOfArv" as const, flat: 0, percent: 0.05 } };
  assert.equal(contractPriceCap(400000, 40000, c), 320000 - 40000 - 15000 - 20000 - 5000);
});

test("missing ARV or repairs routes to manual review", () => {
  assert.deepEqual(computeEstimate({ ...base, arv: null, repairs: 1000 }, F, on), { status: "manual_review", reasons: ["value_unknown"] });
  const r = computeEstimate({ ...base, arv: 300000, repairs: null }, F, on);
  assert.equal(r.status, "manual_review");
});

test("negative, non-finite and out-of-bounds inputs never produce an estimate", () => {
  for (const arv of [-1, 0, Number.NaN, Number.POSITIVE_INFINITY, 10, 99_000_000]) {
    assert.equal(computeEstimate({ ...base, arv, repairs: 1000 }, F, on).status, "manual_review", `arv ${arv}`);
  }
  for (const repairs of [-5, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.equal(computeEstimate({ ...base, arv: 300000, repairs }, F, on).status, "manual_review", `repairs ${repairs}`);
  }
});

test("non-positive cap returns manual review, never $0 or a floor", () => {
  const r = computeEstimate({ ...base, arv: 120000, repairs: 60000 }, F, on);
  assert.equal(r.status, "manual_review");
});

test("repairs too large relative to value go to manual review", () => {
  const r = computeEstimate({ ...base, arv: 200000, repairs: 150000 }, F, on);
  assert.deepEqual(r, { status: "manual_review", reasons: ["repairs_high_relative_to_value"] });
});

test("disabled state and ineligible property type go to manual review", () => {
  assert.equal(computeEstimate({ ...base, arv: 400000, repairs: 40000 }, F, { estimatesEnabled: false }).status, "manual_review");
  assert.equal(computeEstimate({ ...base, propertyType: "land", arv: 400000, repairs: 40000 }, F, on).status, "manual_review");
});

test("state factor override is applied", () => {
  const r = computeEstimate({ ...base, arv: 400000, repairs: 40000 }, F, { estimatesEnabled: true, buyerAcquisitionFactor: 0.75 });
  assert.equal(r.status, "estimate");
  if (r.status === "estimate") assert.equal(r.base, 220000);
});

test("repair planning model is used only when enabled and configured", () => {
  const off = computeEstimate({ ...base, arv: 400000, repairs: null }, F, on);
  assert.equal(off.status, "manual_review");
  const c = { ...F, repairModel: { enabled: true, perSqft: { fair: 25 } } };
  const r = computeEstimate({ ...base, arv: 400000, repairs: null }, c, on);
  assert.equal(r.status, "estimate");
  if (r.status === "estimate") { assert.equal(r.repairsUsed, 40000); assert.equal(r.repairBasis, "planning-model"); }
  assert.equal(computeEstimate({ ...base, condition: "unsure", arv: 400000, repairs: null }, c, on).status, "manual_review");
});

test("config validation catches bad settings", () => {
  assert.deepEqual(validateConfig(F), []);
  assert.ok(validateConfig({ ...F, buyerAcquisitionFactor: 1.2 }).length > 0);
  assert.ok(validateConfig({ ...F, scenarios: { ...F.scenarios, low: { arvAdjustment: 0.1, repairMultiplier: 1 } } }).length > 0);
  assert.ok(validateConfig({ ...F, eligiblePropertyTypes: [] }).length > 0);
});

test("currency arithmetic avoids floating point drift", () => {
  const c = { ...F, buyerAcquisitionFactor: 0.7 };
  // 333,333.33 × 0.70 = 233,333.33 (to the cent); minus 12,345.67 + 40,000 = 180,987.66 exactly
  assert.equal(contractPriceCap(333333.33, 12345.67, c), 180987.66);
});
