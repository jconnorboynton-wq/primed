import "server-only";
import { db, nowIso, newId, audit } from "../db";
import { getSettings, getStateConfig } from "../settings";
import { computeEstimate, validateConfig, TEST_FIXTURE_CONFIG, type EstimatorConfig, type EstimateInput } from "./engine";

/**
 * Public boundary of the estimator. Everything returned from here may be shown to sellers.
 * Fee targets, factors, cost allowances and formula details stay on the server.
 */

export type PublicEstimate =
  | {
      status: "estimate";
      estimateId: string;
      mode: "live" | "preview";
      low: number;
      high: number;
      modelVersion: string;
      assumptions: string[];
    }
  | { status: "manual_review"; estimateId: string; mode: "live" | "preview" | "disabled"; reasons: string[]; message: string }
  | { status: "disabled"; estimateId: string; message: string };

/** Preview mode demonstrates the calculator with the documented test fixture. Never allowed in production. */
export function previewModeActive() {
  return process.env.ESTIMATOR_PREVIEW_FIXTURE === "true" && process.env.SITE_ENV !== "production";
}

export interface StoredVersion {
  id: number;
  label: string;
  effective_date: string;
  config: EstimatorConfig;
  change_note: string | null;
  created_at: string;
  active: boolean;
}

export function listVersions(): StoredVersion[] {
  const rows = db().prepare("SELECT * FROM estimator_versions ORDER BY id DESC").all() as Record<string, unknown>[];
  return rows.map((r) => ({
    id: r.id as number,
    label: r.label as string,
    effective_date: r.effective_date as string,
    config: JSON.parse(r.config_json as string),
    change_note: r.change_note as string | null,
    created_at: r.created_at as string,
    active: r.active === 1,
  }));
}

export function activeVersion(): StoredVersion | null {
  return listVersions().find((v) => v.active) ?? null;
}

export function saveVersion(config: EstimatorConfig, note: string, activate: boolean): { ok: true; id: number } | { ok: false; problems: string[] } {
  const problems = validateConfig(config);
  if (problems.length) return { ok: false, problems };
  const d = db();
  const tx = d.transaction(() => {
    if (activate) d.prepare("UPDATE estimator_versions SET active = 0").run();
    const info = d
      .prepare("INSERT INTO estimator_versions (label, effective_date, config_json, change_note, created_at, active) VALUES (?, ?, ?, ?, ?, ?)")
      .run(config.label, config.effectiveDate, JSON.stringify(config), note || null, nowIso(), activate ? 1 : 0);
    return Number(info.lastInsertRowid);
  });
  const id = tx();
  audit("estimator.version.save", `${id}${activate ? " (activated)" : ""}`);
  return { ok: true, id };
}

export function activateVersion(id: number) {
  const d = db();
  d.transaction(() => {
    d.prepare("UPDATE estimator_versions SET active = 0").run();
    d.prepare("UPDATE estimator_versions SET active = 1 WHERE id = ?").run(id);
  })();
  audit("estimator.version.activate", String(id));
}

const REASON_TEXT: Record<string, string> = {
  state_not_enabled: "Numerical estimates are not yet available for properties in this state, but we can still review it personally.",
  property_type_needs_review: "This property type is reviewed individually.",
  value_unknown: "We need an estimated after-repair value to calculate a range.",
  value_invalid: "The value entered could not be used.",
  value_outside_range: "The value entered is outside the range our calculator handles.",
  repairs_invalid: "The repair estimate could not be used.",
  repairs_unknown: "We need a rough repair budget to calculate a range.",
  repairs_high_relative_to_value: "The repair budget is large relative to the property's value, so this one needs a personal look.",
  no_positive_range: "Based on these inputs, a calculated range would not be meaningful.",
  range_inconsistent: "These inputs produced an inconsistent range.",
  estimator_disabled: "Online estimates are currently turned off.",
};

const MANUAL_MESSAGE = "This property needs a personalized review. Send us the details and we will look at it individually.";

function store(mode: string, modelVersion: string | null, input: EstimateInput, result: unknown) {
  const id = newId("est");
  db()
    .prepare("INSERT INTO estimates (id, created_at, mode, model_version, state, inputs_json, result_json) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run(id, nowIso(), mode, modelVersion, input.state, JSON.stringify(input), JSON.stringify(result));
  return id;
}

export function runEstimate(input: EstimateInput): PublicEstimate {
  const preview = previewModeActive();
  const settings = getSettings();
  const version = activeVersion();
  const live = settings.estimatorMode === "live" && version !== null;

  if (!live && !preview) {
    const result = { status: "disabled" as const, message: "Online estimates are not available right now. You can still request a personal property review." };
    return { ...result, estimateId: store("disabled", null, input, result) };
  }

  const config = live ? version!.config : TEST_FIXTURE_CONFIG;
  const mode: "live" | "preview" = live ? "live" : "preview";
  const st = getStateConfig(input.state);
  if (!st) {
    const result = { status: "manual_review" as const, mode, reasons: ["Please choose a valid state."], message: MANUAL_MESSAGE };
    return { ...result, estimateId: store(mode, config.label, input, result) };
  }
  // In preview mode every state is enabled so the tool can be demonstrated; live mode honors owner settings.
  const stateRule = live
    ? { estimatesEnabled: st.estimatesEnabled && st.transactionStatus !== "not_available", buyerAcquisitionFactor: st.buyerAcquisitionFactor }
    : { estimatesEnabled: true, buyerAcquisitionFactor: null };

  const r = computeEstimate(input, config, stateRule);
  if (r.status === "manual_review") {
    const result = { status: "manual_review" as const, mode, reasons: r.reasons.map((x) => REASON_TEXT[x] ?? x), message: MANUAL_MESSAGE };
    const id = store(mode, config.label, input, { ...result, internal: r.reasons });
    return { ...result, estimateId: id };
  }
  const assumptions = [
    `After-repair value you entered: ${usd(r.arvUsed)}.`,
    r.repairBasis === "seller" ? `Repair budget you entered: ${usd(r.repairsUsed)}.` : `Planning repair budget based on size and condition: ${usd(r.repairsUsed)}.`,
    "The range runs from more conservative to more optimistic assumptions about value and repairs.",
    "It assumes an as-is sale with the property delivered in its current condition.",
  ];
  const result = { status: "estimate" as const, mode, low: r.low, high: r.high, modelVersion: config.label, assumptions };
  // The base scenario is stored privately for the owner; the public range shows low to high.
  const id = store(mode, config.label, input, { ...result, base: r.base });
  return { ...result, estimateId: id };
}

export function getStoredEstimate(id: string) {
  const row = db().prepare("SELECT * FROM estimates WHERE id = ?").get(id) as
    | { id: string; mode: string; model_version: string | null; result_json: string; inputs_json: string }
    | undefined;
  return row ?? null;
}

function usd(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
