import Link from "next/link";
import { guard } from "@/components/admin/guard";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { activeVersion, previewModeActive } from "@/lib/estimator/service";
import { outboxSummary } from "@/lib/integrations";
import { leadTestMode, followUpsDue, listLeads, pipelineCounts, STATUS_LABELS } from "@/lib/leads";
import { ago, todayLocal, StatusBadge } from "@/components/admin/leadUi";
import { retryIntegrations } from "./actions";
import { siteUrl, isProductionSite } from "@/content/site";

export default async function Dashboard() {
  await guard();
  const d = db();
  const count = (sql: string) => (d.prepare(sql).get() as { n: number }).n;
  const s = getSettings();
  const v = activeVersion();
  const outbox = outboxSummary();
  const failed = outbox.find((o) => o.status === "failed")?.n ?? 0;
  const today = todayLocal();
  const due = followUpsDue(today);
  const recent = listLeads("seller", { limit: 6 });
  const pipe = pipelineCounts("seller");
  const tiles = [
    ["New seller requests", count("SELECT COUNT(*) n FROM seller_leads WHERE status IN ('new','urgent_review')"), "/admin/leads"],
    ["Urgent reviews", count("SELECT COUNT(*) n FROM seller_leads WHERE status = 'urgent_review'"), "/admin/leads?status=urgent_review"],
    ["Investor buy boxes", count("SELECT COUNT(*) n FROM investor_leads"), "/admin/leads?kind=investor"],
    ["Estimates run (30 days)", count("SELECT COUNT(*) n FROM estimates WHERE created_at > datetime('now','-30 days')"), "/admin/estimator"],
  ] as const;
  const warnings: string[] = [];
  if (leadTestMode()) warnings.push("Lead test mode is on: new leads are flagged as tests and nothing is sent to outside systems. Set SITE_ENV=production and LEADS_TEST_MODE=false at launch.");
  if (!siteUrl()) warnings.push("NEXT_PUBLIC_SITE_URL isn't set, so canonical URLs, the sitemap and structured data are switched off.");
  if (!isProductionSite()) warnings.push("This environment is marked as preview, so search engines are told not to index it.");
  if (s.estimatorMode !== "live" || !v) warnings.push(previewModeActive() ? "The calculator is running the documented TEST fixture (preview only). Live estimates are off until you save and activate your own assumptions." : "Online estimates are off. Visitors are routed to a personal review until you activate an estimator version.");
  if (!s.phone && !s.email) warnings.push("No public phone or email is configured. That's fine; the site simply won't show them.");
  return (
    <div>
      <h1 className="text-[2rem] font-bold">Dashboard</h1>
      {warnings.length > 0 && (
        <ul className="mt-5 space-y-2">
          {warnings.map((w) => (<li key={w} className="rounded-xl border border-warn bg-warn-soft px-4 py-3 text-[0.95rem]">{w}</li>))}
        </ul>
      )}
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(([label, n, href]) => (
          <li key={label}><Link href={href} className="card card-link block p-5"><span className="block font-display text-[2rem] font-bold">{n}</span><span className="text-fg-muted">{label}</span></Link></li>
        ))}
      </ul>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-5" aria-labelledby="due-h">
          <h2 id="due-h" className="text-[1.2rem] font-bold">Follow-ups due</h2>
          {due.length === 0 ? <p className="mt-2 text-fg-muted">Nothing due today. Set follow-up dates on a lead to see them here.</p> : (
            <ul className="mt-3 divide-y divide-line">
              {due.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link href={`/admin/leads/${l.id}?kind=${l.kind}`} className="font-semibold hover:underline">{l.name}</Link>
                  <span className={`text-[0.85rem] font-semibold ${l.follow_up_at < today ? "text-err" : "text-warn"}`}>{l.follow_up_at < today ? `Overdue (${l.follow_up_at})` : "Today"}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card p-5" aria-labelledby="recent-h">
          <div className="flex items-center justify-between"><h2 id="recent-h" className="text-[1.2rem] font-bold">Latest seller requests</h2><Link href="/admin/leads" className="text-[0.9rem] underline underline-offset-4">Open inbox</Link></div>
          {recent.length === 0 ? <p className="mt-2 text-fg-muted">No requests yet.</p> : (
            <ul className="mt-3 divide-y divide-line">
              {recent.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <span><Link href={`/admin/leads/${l.id}`} className="font-semibold hover:underline">{l.name}</Link> <span className="text-[0.88rem] text-fg-muted">· {[l.city, l.state].filter(Boolean).join(", ")} · {ago(l.created_at)}</span></span>
                  <StatusBadge status={l.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <section className="card mt-6 p-5" aria-labelledby="pipe-h">
        <h2 id="pipe-h" className="text-[1.2rem] font-bold">Seller pipeline</h2>
        <ol className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {(["new", "contacted", "reviewing", "offer_sent", "under_contract", "closed"] as const).map((st) => (
            <li key={st} className="rounded-xl border border-line bg-black p-3">
              <span className="block font-display text-[1.5rem] font-bold">{st === "new" ? pipe.new + pipe.urgent_review : pipe[st]}</span>
              <span className="text-[0.85rem] text-fg-muted">{STATUS_LABELS[st]}</span>
            </li>
          ))}
        </ol>
      </section>
      <div className="card mt-6 p-5">
        <h2 className="text-[1.2rem] font-bold">Integrations</h2>
        <p className="mt-1 text-[0.95rem] text-fg-muted">Leads are always saved here first. Optional CRM delivery: {process.env.CRM_WEBHOOK_URL ? "webhook configured" : "not configured"}.</p>
        {outbox.length > 0 && <p className="mt-2 text-[0.95rem]">{outbox.map((o) => `${o.status}: ${o.n}`).join(" · ")}</p>}
        {failed > 0 && <form action={retryIntegrations} className="mt-3"><button className="btn btn-secondary !min-h-10">Retry failed deliveries</button></form>}
      </div>
    </div>
  );
}
