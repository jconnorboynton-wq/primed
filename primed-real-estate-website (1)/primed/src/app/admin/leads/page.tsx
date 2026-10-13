import Link from "next/link";
import { guard } from "@/components/admin/guard";
import { listLeads, LEAD_STATUSES, STATUS_LABELS, INQUIRY_LABELS, type Lead, type LeadStatus } from "@/lib/leads";
import { ago, FollowUp } from "@/components/admin/leadUi";
import { setLeadStatus } from "../actions";

type Props = { searchParams: Promise<{ kind?: string; status?: string; q?: string; view?: string; deleted?: string }> };

/** Board columns for seller requests. Closed-out statuses are listed separately below the board. */
const BOARD: { title: string; statuses: LeadStatus[] }[] = [
  { title: "New", statuses: ["urgent_review", "new"] },
  { title: "Contacted", statuses: ["contacted"] },
  { title: "Reviewing", statuses: ["reviewing"] },
  { title: "Offer sent", statuses: ["offer_sent"] },
  { title: "Under contract", statuses: ["under_contract"] },
  { title: "Closed", statuses: ["closed"] },
];

function LeadCard({ r, kind }: { r: Lead; kind: "seller" | "investor" }) {
  const where = kind === "seller" ? [r.city, r.state].filter(Boolean).join(", ") : String(r.markets ?? "");
  return (
    <li className="card card-link relative p-4">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/admin/leads/${r.id}?kind=${kind}`} className="font-display text-[1.02rem] font-bold leading-snug after:absolute after:inset-0 after:content-['']">
          {String(r.name)}
        </Link>
        {r.is_test ? <span className="relative rounded bg-warn-soft px-1.5 py-0.5 text-[0.68rem] font-bold text-warn">TEST</span> : null}
      </div>
      <p className="mt-1 line-clamp-1 text-[0.88rem] text-fg-2">{where || "Location not given"}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8rem] text-fg-muted">
        {kind === "seller" && <span>{INQUIRY_LABELS[String(r.inquiry_type)] ?? String(r.inquiry_type)}</span>}
        <span>{ago(r.created_at)}</span>
        {r.status === "urgent_review" && <span className="font-semibold text-err">Urgent</span>}
        {r.estimate_json ? <span>Has estimate</span> : null}
      </div>
      <div className="mt-1"><FollowUp date={r.follow_up_at} /></div>
    </li>
  );
}

export default async function Leads({ searchParams }: Props) {
  await guard();
  const sp = await searchParams;
  const kind = sp.kind === "investor" ? "investor" : "seller";
  const q = (sp.q ?? "").trim().slice(0, 80);
  const status = sp.status && (LEAD_STATUSES as readonly string[]).includes(sp.status) ? sp.status : undefined;
  const view = kind === "investor" || q || status || sp.view === "list" ? "list" : "board";
  const rows = listLeads(kind, { status, q: q || undefined, limit: 500 });
  const closedOut = rows.filter((r) => r.status === "not_a_fit" || r.status === "spam");
  const base = `/admin/leads?kind=${kind}`;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[2rem] font-bold">Lead inbox</h1>
          <p className="mt-1 text-fg-muted">Every request from the website lands here. Open one to see details, add notes and move it along.</p>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Lead type">
            <Link href="/admin/leads" aria-current={kind === "seller" ? "page" : undefined} className={`rounded-full px-4 py-2 text-[0.92rem] font-semibold ${kind === "seller" ? "bg-fg text-ink" : "border border-line-strong"}`}>Sellers</Link>
            <Link href="/admin/leads?kind=investor" aria-current={kind === "investor" ? "page" : undefined} className={`rounded-full px-4 py-2 text-[0.92rem] font-semibold ${kind === "investor" ? "bg-fg text-ink" : "border border-line-strong"}`}>Investors</Link>
            {kind === "seller" && (
              <>
                <span aria-hidden className="mx-1 w-px bg-line-strong" />
                <Link href={base} aria-current={view === "board" ? "page" : undefined} className={`rounded-full px-4 py-2 text-[0.92rem] ${view === "board" ? "bg-black font-semibold" : "text-fg-2"}`}>Board</Link>
                <Link href={`${base}&view=list`} aria-current={view === "list" ? "page" : undefined} className={`rounded-full px-4 py-2 text-[0.92rem] ${view === "list" ? "bg-black font-semibold" : "text-fg-2"}`}>List</Link>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <form className="flex flex-wrap items-end gap-2" role="search">
            <input type="hidden" name="kind" value={kind} />
            <div>
              <label htmlFor="q" className="mb-1 block text-[0.85rem] text-fg-muted">Search</label>
              <input id="q" name="q" defaultValue={q} placeholder="Name, phone, city…" className="field !min-h-10 !w-56" />
            </div>
            <div>
              <label htmlFor="st" className="mb-1 block text-[0.85rem] text-fg-muted">Status</label>
              <select id="st" name="status" defaultValue={status ?? ""} className="field !min-h-10 !w-auto"><option value="">All</option>{LEAD_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}</select>
            </div>
            <button className="btn btn-secondary !min-h-10">Search</button>
            {(q || status) && <Link href={base} className="btn btn-ghost !min-h-10">Clear</Link>}
          </form>
          <a href={`/api/admin/export?kind=${kind}`} className="btn btn-primary !min-h-10">Export CSV</a>
        </div>
      </div>

      {sp.deleted && <p role="status" className="mt-5 rounded-xl border border-ok bg-ok-soft px-4 py-3">The lead and its activity log were deleted.</p>}

      {rows.length === 0 ? (
        <div className="card mt-8 p-8 text-center">
          <p className="font-display text-[1.2rem] font-bold">{q || status ? "No matches" : `No ${kind} requests yet`}</p>
          <p className="mt-1 text-fg-muted">{q || status ? "Try a different search." : "When someone submits a form on the site, it appears here immediately."}</p>
        </div>
      ) : view === "board" ? (
        <>
          <div className="kanban mt-8" aria-label="Seller pipeline">
            {BOARD.map((col) => {
              const items = rows.filter((r) => col.statuses.includes(r.status));
              return (
                <section key={col.title} aria-labelledby={`col-${col.title}`} className="rounded-2xl border border-line bg-black p-3">
                  <h2 id={`col-${col.title}`} className="mb-3 flex items-center justify-between px-1 text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-fg-2">
                    {col.title}<span className="rounded-full bg-black px-2 py-0.5 text-[0.75rem] text-fg">{items.length}</span>
                  </h2>
                  {items.length === 0 ? <p className="px-1 pb-2 text-[0.85rem] text-fg-muted">Empty</p> : (
                    <ul className="space-y-2.5">{items.map((r) => <LeadCard key={r.id} r={r} kind="seller" />)}</ul>
                  )}
                </section>
              );
            })}
          </div>
          {closedOut.length > 0 && (
            <p className="mt-4 text-[0.92rem] text-fg-muted">
              {closedOut.length} closed out as not a fit or spam. <Link className="inline-link" href={`${base}&view=list&status=not_a_fit`}>View not a fit</Link> · <Link className="inline-link" href={`${base}&view=list&status=spam`}>View spam</Link>
            </p>
          )}
        </>
      ) : (
        <div className="table-scroll mt-8" tabIndex={0} role="region" aria-label="Leads">
          <table className="card w-full min-w-[760px] border-separate border-spacing-0 overflow-hidden text-left text-[0.95rem]">
            <thead>
              <tr className="text-[0.78rem] uppercase tracking-[0.12em] text-fg-muted">
                <th scope="col" className="border-b border-line px-4 py-3 font-semibold">Name</th>
                <th scope="col" className="border-b border-line px-4 py-3 font-semibold">{kind === "seller" ? "Location" : "Markets"}</th>
                <th scope="col" className="border-b border-line px-4 py-3 font-semibold">{kind === "seller" ? "Type" : "Strategy"}</th>
                <th scope="col" className="border-b border-line px-4 py-3 font-semibold">Received</th>
                <th scope="col" className="border-b border-line px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} className="hover:bg-black">
                  <td className={`px-4 py-3 ${i ? "border-t border-line" : ""}`}>
                    <Link className="font-semibold underline-offset-4 hover:underline" href={`/admin/leads/${r.id}?kind=${kind}`}>{String(r.name)}</Link>
                    {r.is_test ? <span className="ml-2 rounded bg-warn-soft px-1.5 py-0.5 text-[0.68rem] font-bold text-warn">TEST</span> : null}
                    <div><FollowUp date={r.follow_up_at} /></div>
                  </td>
                  <td className={`px-4 py-3 text-fg-2 ${i ? "border-t border-line" : ""}`}>{kind === "seller" ? [r.city, r.state].filter(Boolean).join(", ") : String(r.markets ?? "")}</td>
                  <td className={`px-4 py-3 text-fg-2 ${i ? "border-t border-line" : ""}`}>{kind === "seller" ? INQUIRY_LABELS[String(r.inquiry_type)] ?? String(r.inquiry_type) : String(r.strategy ?? "")}</td>
                  <td className={`px-4 py-3 text-fg-2 ${i ? "border-t border-line" : ""}`}>{ago(r.created_at)}</td>
                  <td className={`px-4 py-3 ${i ? "border-t border-line" : ""}`}>
                    <form action={setLeadStatus} className="flex items-center gap-2">
                      <input type="hidden" name="kind" value={kind} /><input type="hidden" name="id" value={r.id} />
                      <label className="sr-only" htmlFor={`s-${r.id}`}>Status for {String(r.name)}</label>
                      <select id={`s-${r.id}`} name="status" defaultValue={r.status} className="field !min-h-9 !w-auto !py-1 text-[0.9rem]">{LEAD_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}</select>
                      <button className="btn btn-secondary !min-h-9 !px-3 !text-[0.85rem]">Save</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
