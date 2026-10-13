import { guard } from "@/components/admin/guard";
import { getAllStateConfigs, HOME_STATE } from "@/lib/settings";
import STATES from "@/data/states.json";
import { ActionForm } from "@/components/admin/ActionForm";
import { updateState } from "../actions";

export default async function StatesPage() {
  await guard();
  const cfg = getAllStateConfigs();
  return (
    <div>
      <h1 className="text-[2rem] font-bold">State eligibility</h1>
      <p className="mt-2 max-w-3xl text-fg-muted">
        Inquiries are always accepted from every state. Transaction status, online estimates and public pages are separate settings.
        Unreviewed states stay on manual review. Approve a state only after its rules (including any wholesaler registration or disclosure
        requirements) have been reviewed, and record the date and source.
      </p>
      <div className="mt-6 space-y-3">
        {(STATES as { abbr: string; name: string }[]).map((st) => {
          const c = cfg[st.abbr];
          return (
            <details key={st.abbr} className="card p-4">
              <summary className="flex cursor-pointer flex-wrap items-center gap-3">
                <span className="font-semibold">{st.name}{st.abbr === HOME_STATE ? " (home base)" : ""}</span>
                <span className="rounded bg-surface-3 px-2 py-0.5 text-[0.8rem]">{c.transactionStatus.replace("_", " ")}</span>
                {c.estimatesEnabled && <span className="rounded bg-ok-soft px-2 py-0.5 text-[0.8rem]">estimates on</span>}
              </summary>
              <ActionForm action={updateState} className="mt-4 grid gap-4">
                <input type="hidden" name="abbr" value={st.abbr} />
                <div className="grid gap-4 sm:grid-cols-3">
                  <div><label className="field-label" htmlFor={`ts-${st.abbr}`}>Transaction status</label>
                    <select id={`ts-${st.abbr}`} name="transactionStatus" defaultValue={c.transactionStatus} className="field">
                      <option value="manual_review">Manual review (default)</option><option value="approved">Approved</option><option value="not_available">Not available</option>
                    </select></div>
                  <div><label className="field-label" htmlFor={`rd-${st.abbr}`}>Review date</label><input id={`rd-${st.abbr}`} type="date" name="reviewDate" defaultValue={c.reviewDate} className="field" /></div>
                  <div><label className="field-label" htmlFor={`bf-${st.abbr}`}>Private factor override</label><input id={`bf-${st.abbr}`} name="buyerAcquisitionFactor" defaultValue={c.buyerAcquisitionFactor ?? ""} className="field" placeholder="e.g. 0.78" /></div>
                </div>
                <label className="flex items-center gap-2"><input type="checkbox" name="estimatesEnabled" defaultChecked={c.estimatesEnabled} className="h-4 w-4 accent-black" /> Allow online numerical estimates in this state</label>
                <div><label className="field-label" htmlFor={`pn-${st.abbr}`}>Public note (map panel)</label><input id={`pn-${st.abbr}`} name="publicNote" defaultValue={c.publicNote} className="field" /></div>
                <div><label className="field-label" htmlFor={`ds-${st.abbr}`}>Approved state disclosure (shown on forms and the disclosures page)</label><textarea id={`ds-${st.abbr}`} name="disclosure" defaultValue={c.disclosure} rows={3} className="field" /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="field-label" htmlFor={`sr-${st.abbr}`}>Private source / counsel reference</label><input id={`sr-${st.abbr}`} name="sourceRef" defaultValue={c.sourceRef} className="field" /></div>
                  <div><label className="field-label" htmlFor={`ph-${st.abbr}`}>Public page path (only if a substantive page exists)</label><input id={`ph-${st.abbr}`} name="pageHref" defaultValue={c.pageHref ?? ""} className="field" /></div>
                </div>
              </ActionForm>
            </details>
          );
        })}
      </div>
    </div>
  );
}
