import { guard } from "@/components/admin/guard";
import { listVersions, activeVersion, previewModeActive } from "@/lib/estimator/service";
import { getSettings } from "@/lib/settings";
import { PROPERTY_TYPES } from "@/lib/schemas";
import { ActionForm } from "@/components/admin/ActionForm";
import { saveEstimatorVersion, activateEstimatorVersion, setEstimatorMode, testEstimator } from "../actions";

export default async function EstimatorAdmin() {
  await guard();
  const versions = listVersions();
  const active = activeVersion();
  const s = getSettings();
  const c = active?.config;
  const N = ({ name, label, value, hint, step = "any" }: { name: string; label: string; value?: number | string; hint?: string; step?: string }) => (
    <div><label htmlFor={name} className="field-label">{label}</label><input id={name} name={name} type="number" step={step} defaultValue={value ?? ""} className="field" />{hint && <p className="field-hint">{hint}</p>}</div>
  );
  return (
    <div>
      <h1 className="text-[2rem] font-bold">Estimator</h1>
      <p className="mt-2 max-w-3xl text-fg-muted">
        Private underwriting assumptions. Nothing on this page is ever sent to visitors' browsers. Formula per scenario:
        <strong> cap = ARV × factor − repairs − separate buyer costs − wholesale fee − Primed transaction costs</strong>. The factor should already include the
        investor's profit and risk margin; don't budget those again as buyer costs.
      </p>

      <div className="card mt-6 flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="font-semibold">Public estimates: {s.estimatorMode === "live" && active ? "LIVE" : "OFF"}</p>
          <p className="text-[0.95rem] text-fg-muted">{active ? `Active version: ${active.label} (#${active.id}, effective ${active.effective_date})` : "No active version yet."}{previewModeActive() ? " Preview test fixture is enabled in this environment." : ""}</p>
        </div>
        <form action={setEstimatorMode} className="">
          <input type="hidden" name="mode" value={s.estimatorMode === "live" ? "disabled" : "live"} />
          <button className="btn btn-primary !min-h-11" disabled={!active && s.estimatorMode !== "live"}>{s.estimatorMode === "live" ? "Turn estimates off" : "Turn estimates on"}</button>
        </form>
      </div>

      <h2 className="mt-10 text-[1.4rem] font-bold">New version</h2>
      <ActionForm action={saveEstimatorVersion} submitLabel="Save version" className="card mt-3 grid gap-5 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div><label htmlFor="label" className="field-label">Version label</label><input id="label" name="label" required className="field" placeholder="e.g. 2026-Q4 WA base" /></div>
          <div><label htmlFor="effectiveDate" className="field-label">Effective date</label><input id="effectiveDate" name="effectiveDate" type="date" required className="field" /></div>
          <div><label htmlFor="changeNote" className="field-label">Change note</label><input id="changeNote" name="changeNote" className="field" /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <N name="buyerAcquisitionFactor" label="Buyer acquisition factor" value={c?.buyerAcquisitionFactor} hint="Between 0 and 1. Includes investor profit/risk." />
          <N name="primedTransactionCosts" label="Primed transaction costs ($)" value={c?.primedTransactionCosts} />
          <N name="roundingIncrement" label="Round ranges down to ($)" value={c?.roundingIncrement} />
        </div>
        <fieldset className="grid gap-4 sm:grid-cols-3"><legend className="field-label">Wholesale fee target</legend>
          <div><label htmlFor="feeMode" className="field-label">Mode</label><select id="feeMode" name="feeMode" defaultValue={c?.fee.mode ?? "flat"} className="field"><option value="flat">Flat $</option><option value="percentOfArv">% of ARV</option></select></div>
          <N name="feeFlat" label="Flat fee ($)" value={c?.fee.flat} />
          <N name="feePercent" label="Percent of ARV (%)" value={c ? c.fee.percent * 100 : undefined} />
        </fieldset>
        <fieldset className="grid gap-4 sm:grid-cols-3"><legend className="field-label">Separately budgeted buyer costs / reserves (not already in the factor)</legend>
          <div><label htmlFor="buyerCostsMode" className="field-label">Mode</label><select id="buyerCostsMode" name="buyerCostsMode" defaultValue={c?.buyerCosts.mode ?? "flat"} className="field"><option value="flat">Flat $</option><option value="percentOfArv">% of ARV</option></select></div>
          <N name="buyerCostsFlat" label="Flat ($)" value={c?.buyerCosts.flat} />
          <N name="buyerCostsPercent" label="Percent of ARV (%)" value={c ? c.buyerCosts.percent * 100 : undefined} />
        </fieldset>
        <fieldset className="grid gap-4 sm:grid-cols-3"><legend className="field-label">Scenarios (ARV adjustment % and repair multiplier)</legend>
          {(["low", "base", "high"] as const).map((k) => (
            <div key={k} className="grid grid-cols-2 gap-2">
              <N name={`${k}Arv`} label={`${k} ARV %`} value={c ? c.scenarios[k].arvAdjustment * 100 : undefined} />
              <N name={`${k}Repair`} label={`${k} repair ×`} value={c?.scenarios[k].repairMultiplier} />
            </div>
          ))}
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-3">
          <N name="minArv" label="Minimum eligible ARV ($)" value={c?.minArv} />
          <N name="maxArv" label="Maximum eligible ARV ($)" value={c?.maxArv} />
          <N name="maxRepairRatio" label="Manual review above repairs/ARV (%)" value={c ? c.maxRepairRatio * 100 : undefined} />
        </div>
        <fieldset><legend className="field-label">Eligible property types for numerical estimates</legend>
          <div className="grid gap-2 sm:grid-cols-3">{PROPERTY_TYPES.map((p) => (<label key={p.value} className="flex items-center gap-2"><input type="checkbox" name="eligiblePropertyTypes" value={p.value} defaultChecked={c?.eligiblePropertyTypes.includes(p.value)} className="h-4 w-4 accent-black" />{p.label}</label>))}</div>
        </fieldset>
        <fieldset><legend className="field-label">Optional repair planning model ($/sq ft by condition) — only with a defensible basis</legend>
          <label className="mb-2 flex items-center gap-2"><input type="checkbox" name="repairModelEnabled" defaultChecked={c?.repairModel.enabled} className="h-4 w-4 accent-black" /> Use this model when a seller doesn't know repair costs</label>
          <div className="grid gap-3 sm:grid-cols-4">{(["good", "fair", "poor", "major"] as const).map((k) => (<div key={k}><label htmlFor={`rm_${k}`} className="field-label">{k}</label><input id={`rm_${k}`} name={`rm_${k}`} type="number" step="any" defaultValue={c?.repairModel.perSqft[k] ?? ""} className="field" /></div>))}</div>
        </fieldset>
        <label className="flex items-center gap-2"><input type="checkbox" name="activate" className="h-4 w-4 accent-black" /> Activate this version immediately</label>
      </ActionForm>

      <h2 className="mt-10 text-[1.4rem] font-bold">Test bench</h2>
      <ActionForm action={testEstimator} submitLabel="Run test" className="card mt-3 grid gap-4 p-6 sm:grid-cols-3">
        <div><label htmlFor="versionId" className="field-label">Version</label><select id="versionId" name="versionId" className="field"><option value="fixture">Test fixture</option>{versions.map((v) => <option key={v.id} value={v.id}>#{v.id} {v.label}</option>)}</select></div>
        <div><label htmlFor="t-arv" className="field-label">ARV ($)</label><input id="t-arv" name="arv" type="number" defaultValue={400000} className="field" /></div>
        <div><label htmlFor="t-rep" className="field-label">Repairs ($)</label><input id="t-rep" name="repairs" type="number" defaultValue={40000} className="field" /></div>
      </ActionForm>

      <h2 className="mt-10 text-[1.4rem] font-bold">Version history</h2>
      {versions.length === 0 ? <p className="card mt-3 p-5 text-fg-muted">No versions saved yet.</p> : (
        <ul className="mt-3 space-y-3">
          {versions.map((v) => (
            <li key={v.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div><p className="font-semibold">#{v.id} {v.label} {v.active && <span className="ml-2 rounded bg-ok-soft px-2 py-0.5 text-[0.8rem]">active</span>}</p><p className="text-[0.9rem] text-fg-muted">Effective {v.effective_date} · saved {new Date(v.created_at).toLocaleString()}{v.change_note ? ` · ${v.change_note}` : ""}</p></div>
              {!v.active && <form action={activateEstimatorVersion} className=""><input type="hidden" name="id" value={v.id} /><button className="btn btn-secondary !min-h-10">Activate</button></form>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
