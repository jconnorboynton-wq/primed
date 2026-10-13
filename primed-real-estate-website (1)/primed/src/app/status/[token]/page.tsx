import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicStatus, SELLER_STAGES } from "@/lib/leads";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

// Private page: never indexed, never sends its URL as a referrer.
export const metadata: Metadata = {
  title: "Your request status | Primed Real Estate",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

const STAGE_TEXT = [
  "We have your request. A person will review the property, its location and whether a transaction may fit.",
  "We're reviewing the property and may reach out with questions or to arrange a walkthrough.",
  "Written terms have been sent. Take the time you need; you can ask questions or have anyone you trust review them.",
  "A purchase agreement is signed. Title or escrow is working toward closing under the agreement's conditions.",
  "This transaction has closed.",
];

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/Los_Angeles" });

export default async function StatusPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const st = getPublicStatus(token);
  if (!st) notFound();
  const s = getSettings();
  const where = [st.city, st.state].filter(Boolean).join(", ");
  return (
    <>
      <section className="hero-glow tone-dark relative overflow-hidden">
        <div aria-hidden className="photo-bg" style={{ backgroundImage: "url(/images/bg-roofline.webp)", backgroundPosition: "70% center" }} />
        <div aria-hidden className="photo-fade-hero" />
        <div className="relative mx-auto max-w-[880px] px-4 pb-12 pt-12 sm:px-6">
          <p className="pill mb-6"><span aria-hidden className="pill-dot" />Private request status</p>
          <h1 className="metal-text text-[2.3rem] font-extrabold sm:text-[3rem]">
            {st.ended ? "Review complete" : SELLER_STAGES[st.stage]}
          </h1>
          <p className="mt-4 text-[1.1rem] text-fg-2">Property in {where}. Submitted {fmt(st.submitted)}. Last update {fmt(st.updated)}.</p>
        </div>
      </section>
      <section className="tone-light">
        <div className="mx-auto grid max-w-[880px] gap-8 px-4 py-14 sm:px-6 md:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="mb-6 text-[1.35rem] font-bold">Where things stand</h2>
            {st.ended ? (
              <p className="card p-6 text-fg-2">
                We reviewed this request and a transaction with us doesn&apos;t look like the right fit right now. That isn&apos;t a judgment
                about your property. A listing broker or another buyer may be a better route, and our{" "}
                <Link className="inline-link" href="/resources">seller resources</Link> can help you compare options.
              </p>
            ) : (
              <ol className="space-y-3">
                {SELLER_STAGES.map((label, i) => {
                  const state = i < st.stage ? "done" : i === st.stage ? "current" : "todo";
                  return (
                    <li key={label} className="track-step flex gap-4 pb-3" data-state={state} aria-current={state === "current" ? "step" : undefined}>
                      <span
                        aria-hidden
                        className={`relative z-10 flex h-8 w-8 flex-none items-center justify-center rounded-full text-[0.8rem] font-bold ${state === "todo" ? "border border-line-strong text-fg-muted" : "metal-bg text-ink"} ${state === "current" ? "ring-4 ring-white/10" : ""}`}
                      >
                        {state === "done" ? "✓" : i + 1}
                      </span>
                      <div>
                        <p className={`font-semibold ${state === "todo" ? "text-fg-muted" : ""}`}>
                          {label}
                          <span className="sr-only"> ({state === "done" ? "complete" : state === "current" ? "current step" : "not started"})</span>
                        </p>
                        {state === "current" && <p className="mt-1 text-[0.95rem] text-fg-2">{STAGE_TEXT[i]}</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
          <div>
            <h2 className="mb-6 text-[1.35rem] font-bold">Updates from our team</h2>
            {st.updates.length === 0 ? (
              <p className="card p-6 text-fg-muted">No updates posted yet. We&apos;ll contact you by the method you chose.</p>
            ) : (
              <ul className="space-y-3">
                {st.updates.map((u, i) => (
                  <li key={i} className="card p-5">
                    <p className="text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-fg-muted">{fmt(u.at)}</p>
                    <p className="mt-1.5 whitespace-pre-line text-fg-2">{u.body}</p>
                  </li>
                ))}
              </ul>
            )}
            <div className="card mt-6 p-5 text-[0.95rem] text-fg-2">
              <p className="font-semibold text-fg">Questions?</p>
              <p className="mt-1">
                {s.phone || s.email ? (
                  <>Reach us{s.phone ? <> at <a className="inline-link" href={`tel:${s.phone.replace(/[^\d+]/g, "")}`}>{s.phone}</a></> : null}{s.phone && s.email ? " or" : ""}{s.email ? <> at <a className="inline-link" href={`mailto:${s.email}`}>{s.email}</a></> : null}.</>
                ) : (
                  <>Reply to any message from us, or use the <Link className="inline-link" href="/contact">contact page</Link>.</>
                )}{" "}
                Nothing here obligates you to anything.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
