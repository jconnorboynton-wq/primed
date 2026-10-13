import Link from "next/link";
import { notFound } from "next/navigation";
import { guard } from "@/components/admin/guard";
import { getLead, leadActivity, LEAD_STATUSES, STATUS_LABELS, INQUIRY_LABELS } from "@/lib/leads";
import { setLeadStatus, addLeadNote, setLeadFollowUp, removeLead } from "../../actions";
import { ActionForm } from "@/components/admin/ActionForm";
import { CopyButton } from "@/components/admin/CopyButton";
import { StatusBadge, ago, todayLocal } from "@/components/admin/leadUi";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ kind?: string; del?: string }> };

const money = (v: unknown) => (typeof v === "number" && v > 0 ? v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) : null);
const hz = (v: unknown) => (v ? String(v).replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase()) : null);
const parse = (v: unknown) => { try { return v ? JSON.parse(String(v)) : null; } catch { return null; } };

const ACTIVITY_ICON: Record<string, string> = { system: "•", status: "→", note: "✎", contact: "☎", follow_up: "⏰" };

export default async function LeadDetail({ params, searchParams }: Props) {
  await guard();
  const { id } = await params;
  const sp = await searchParams;
  const kind = sp.kind === "investor" ? "investor" : "seller";
  const r = getLead(kind, id);
  if (!r) notFound();
  const activity = leadActivity(kind, id);
  const est = parse(r.estimate_json);
  const extra = parse(r.extra_json);
  const rawPhone = r.phone ? String(r.phone) : "";
  const ten = rawPhone.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  const phone = ten.length === 10 ? `(${ten.slice(0, 3)}) ${ten.slice(3, 6)}-${ten.slice(6)}` : rawPhone;
  const email = r.email ? String(r.email) : "";
  const digits = rawPhone.replace(/[^\d+]/g, "");
  const place = kind === "seller" ? [r.city, r.state].filter(Boolean).join(", ") : "";
  const subject = encodeURIComponent(kind === "seller" ? `Your property${place ? ` in ${place}` : ""}` : "Your buy box with Primed Real Estate");

  const details: [string, unknown][] =
    kind === "seller"
      ? [
          ["Request type", INQUIRY_LABELS[String(r.inquiry_type)] ?? r.inquiry_type],
          ["Preferred contact", hz(r.preferred_contact)],
          ["Address", [r.address, r.city, r.state, r.zip].filter(Boolean).join(", ")],
          ["Property type", hz(r.property_type)],
          ["Condition", hz(r.condition)],
          ["Occupancy", hz(r.occupancy)],
          ["Beds / baths", r.bedrooms || r.bathrooms ? `${r.bedrooms ?? "?"} bd / ${r.bathrooms ?? "?"} ba` : null],
          ["Square feet", r.sqft],
          ["Owner's value estimate", money(r.owner_arv)],
          ["Owner's repair estimate", money(r.owner_repairs)],
          ["Timeline", hz(r.timeline)],
          ["Preferred closing date", r.preferred_date],
          ["Deadline", r.deadline],
          ["Situation", Array.isArray(extra?.circumstances) ? extra.circumstances.join(", ") : null],
          ["Came from", r.source_page],
        ]
      : [
          ["Company", r.entity],
          ["Preferred contact", hz(r.preferred_contact)],
          ["Markets", r.markets],
          ["Property types", r.property_types],
          ["Price range", r.price_min || r.price_max ? `${money(r.price_min) ?? "any"} – ${money(r.price_max) ?? "any"}` : null],
          ["Strategy", r.strategy],
          ["Rehab tolerance", hz(r.rehab_tolerance)],
          ["Timing", hz(r.timing)],
          ["Came from", r.source_page],
        ];

  return (
    <div>
      <Link href={`/admin/leads${kind === "investor" ? "?kind=investor" : ""}`} className="text-[0.92rem] text-fg-muted hover:text-fg">← All {kind} leads</Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[2rem] font-bold">{String(r.name)}</h1>
            <StatusBadge status={r.status} />
            {r.is_test ? <span className="rounded bg-warn-soft px-2 py-0.5 text-[0.75rem] font-bold text-warn">TEST</span> : null}
          </div>
          <p className="mt-1 text-fg-muted">
            {place && <>{place} · </>}Received {new Date(r.created_at).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })} ({ago(r.created_at)})
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {digits && <a href={`tel:${digits}`} className="btn btn-primary !min-h-10 !px-4 !text-[0.88rem]">Call</a>}
          {digits && <a href={`sms:${digits}`} className="btn btn-secondary !min-h-10 !px-4 !text-[0.88rem]">Text</a>}
          {email && <a href={`mailto:${email}?subject=${subject}`} className="btn btn-secondary !min-h-10 !px-4 !text-[0.88rem]">Email</a>}
        </div>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <div className="space-y-6">
          <section className="card p-6" aria-labelledby="contact-h">
            <h2 id="contact-h" className="text-[1.15rem] font-bold">Contact</h2>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <div><dt className="text-[0.85rem] text-fg-muted">Phone</dt><dd className="mt-0.5 flex flex-wrap items-center gap-2">{phone || "—"}{phone && <CopyButton value={phone} label="Copy" />}</dd></div>
              <div><dt className="text-[0.85rem] text-fg-muted">Email</dt><dd className="mt-0.5 flex flex-wrap items-center gap-2 break-all">{email || "—"}{email && <CopyButton value={email} label="Copy" />}</dd></div>
            </dl>
            {kind === "seller" && r.status_token ? (
              <div className="mt-4 rounded-xl border border-line bg-black p-4 text-[0.92rem]">
                <p className="font-semibold">Seller&apos;s private status page</p>
                <p className="mt-1 text-fg-muted">They received this link when they submitted. It shows the stage and any updates you mark &ldquo;visible to seller&rdquo;.</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <CopyButton value={`/status/${r.status_token}`} label="Copy status link" absolute />
                  <a href={`/status/${r.status_token}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost !min-h-10">Preview it<span className="sr-only"> (opens in a new tab)</span></a>
                </div>
              </div>
            ) : null}
          </section>

          <section className="card p-6" aria-labelledby="details-h">
            <h2 id="details-h" className="text-[1.15rem] font-bold">{kind === "seller" ? "Property and situation" : "Buy box"}</h2>
            <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {details.filter(([, v]) => v !== null && v !== undefined && v !== "").map(([k, v]) => (
                <div key={k}><dt className="text-[0.85rem] text-fg-muted">{k}</dt><dd className="mt-0.5 break-words">{String(v)}</dd></div>
              ))}
            </dl>
            {r.notes ? (
              <div className="mt-5 border-t border-line pt-4">
                <p className="text-[0.85rem] text-fg-muted">In their words</p>
                <p className="mt-1 whitespace-pre-line">{String(r.notes)}</p>
              </div>
            ) : null}
          </section>

          {est && (
            <section className="card p-6" aria-labelledby="est-h">
              <h2 id="est-h" className="text-[1.15rem] font-bold">Calculator result they saw</h2>
              {est.status === "estimate" ? (
                <p className="mt-2 font-display text-[1.6rem] font-bold">{money(est.low)} – {money(est.high)}</p>
              ) : (
                <p className="mt-2">Routed to manual review{Array.isArray(est.reasons) ? ` (${est.reasons.join(", ")})` : ""}.</p>
              )}
              <p className="mt-1 text-[0.9rem] text-fg-muted">Calculated on the server{r.model_version ? ` with model ${String(r.model_version)}` : ""}. Not an offer.</p>
              <details className="mt-3 text-[0.9rem]"><summary className="cursor-pointer font-semibold">Full calculation record</summary><pre className="mt-2 overflow-auto rounded-lg bg-surface-3 p-3">{JSON.stringify(est, null, 2)}</pre></details>
            </section>
          )}

          <details className="card p-6 text-[0.92rem]">
            <summary className="cursor-pointer font-semibold">Attribution and consent record</summary>
            <pre className="mt-3 overflow-auto rounded-lg bg-surface-3 p-3">{JSON.stringify({ utm: parse(r.utm_json), consent: parse(r.consent_json) }, null, 2)}</pre>
          </details>
        </div>

        <div className="space-y-6">
          <section className="card p-6" aria-labelledby="pipe-h">
            <h2 id="pipe-h" className="text-[1.15rem] font-bold">Pipeline</h2>
            <form action={setLeadStatus} className="mt-3 flex flex-wrap items-end gap-2">
              <input type="hidden" name="kind" value={kind} /><input type="hidden" name="id" value={id} />
              <div className="grow">
                <label htmlFor="status" className="field-label">Status</label>
                <select id="status" name="status" defaultValue={r.status} className="field">{LEAD_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}</select>
              </div>
              <button className="btn btn-primary !min-h-12">Update</button>
            </form>
            <form action={setLeadFollowUp} className="mt-4 flex flex-wrap items-end gap-2">
              <input type="hidden" name="kind" value={kind} /><input type="hidden" name="id" value={id} />
              <div className="grow">
                <label htmlFor="fu" className="field-label">Follow-up date</label>
                <input id="fu" type="date" name="date" min={todayLocal()} defaultValue={r.follow_up_at ? String(r.follow_up_at) : ""} className="field" />
              </div>
              <button className="btn btn-secondary !min-h-12">Set</button>
              {r.follow_up_at ? <button name="clear" value="1" className="btn btn-ghost !min-h-12">Clear</button> : null}
            </form>
          </section>

          <section className="card p-6" aria-labelledby="note-h">
            <h2 id="note-h" className="text-[1.15rem] font-bold">Add to the log</h2>
            <ActionForm action={addLeadNote} submitLabel="Add" className="mt-3">
              <input type="hidden" name="kind" value={kind} /><input type="hidden" name="id" value={id} />
              <fieldset>
                <legend className="field-label">Type</legend>
                <div className="grid grid-cols-2 gap-2 text-[0.92rem]">
                  {[
                    ["note", "Private note"],
                    ["call", "Logged a call"],
                    ["text", "Logged a text"],
                    ["email", "Logged an email"],
                    ...(kind === "seller" ? [["seller_update", "Update visible to seller"]] : []),
                  ].map(([v, l], i) => (
                    <label key={v} className={`choice ${v === "seller_update" ? "col-span-2" : ""}`}>
                      <input type="radio" name="type" value={v} defaultChecked={i === 0} />
                      <span>{l}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <label htmlFor="body" className="field-label mt-4">Note</label>
              <textarea id="body" name="body" className="field" maxLength={4000} placeholder="What happened, what's next…" />
              <p className="field-hint">Updates marked &ldquo;visible to seller&rdquo; appear on their private status page. Everything else stays private.</p>
            </ActionForm>
          </section>

          <section className="card p-6" aria-labelledby="act-h">
            <h2 id="act-h" className="text-[1.15rem] font-bold">Activity</h2>
            {activity.length === 0 ? <p className="mt-2 text-fg-muted">Nothing logged yet.</p> : (
              <ol className="mt-4 space-y-4">
                {activity.map((a) => (
                  <li key={a.id} className="flex gap-3">
                    <span aria-hidden className="flex h-7 w-7 flex-none items-center justify-center rounded-full border border-line-strong text-[0.8rem]">{ACTIVITY_ICON[a.kind] ?? "•"}</span>
                    <div>
                      <p className="whitespace-pre-line text-[0.95rem]">{a.body}</p>
                      <p className="mt-0.5 text-[0.8rem] text-fg-muted">
                        {new Date(a.at).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}
                        {a.seller_visible ? <span className="ml-2 font-semibold text-ok">Visible to seller</span> : null}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <details className="card p-6" open={sp.del === "confirm"}>
            <summary className="cursor-pointer font-semibold text-err">Delete this lead</summary>
            <p className="mt-2 text-[0.92rem] text-fg-muted">Use this for privacy requests or junk. It permanently removes the lead and its activity log. Export first if you need a record.</p>
            <form action={removeLead} className="mt-3 flex flex-wrap items-end gap-2">
              <input type="hidden" name="kind" value={kind} /><input type="hidden" name="id" value={id} />
              <div>
                <label htmlFor="confirm" className="field-label">Type DELETE to confirm</label>
                <input id="confirm" name="confirm" className="field !w-44" autoComplete="off" aria-invalid={sp.del === "confirm" ? true : undefined} aria-describedby={sp.del === "confirm" ? "del-err" : undefined} />
                {sp.del === "confirm" && <p id="del-err" className="field-error">Type DELETE in capitals to delete.</p>}
              </div>
              <button className="btn btn-secondary !min-h-12 !border-err !text-err">Delete permanently</button>
            </form>
          </details>
        </div>
      </div>
    </div>
  );
}
