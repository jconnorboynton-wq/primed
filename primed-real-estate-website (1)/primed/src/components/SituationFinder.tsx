"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { track } from "@/lib/analytics";

/**
 * "Which path fits?" A five-question guide that points owners to the selling route that best matches
 * what they told us, including a traditional listing when that is the better fit. Runs entirely in
 * the browser; nothing is stored or sent.
 */
type Opt = { v: string; label: string; listing?: number; asis?: number };
type Q = { id: string; q: string; help?: string; options: Opt[] };

const QUESTIONS: Q[] = [
  {
    id: "priority",
    q: "What matters most to you in this sale?",
    options: [
      { v: "price", label: "Getting the highest possible price", listing: 3 },
      { v: "certainty", label: "Certainty about the sale and the date", asis: 2 },
      { v: "simplicity", label: "Skipping repairs, showings and cleanup", asis: 3 },
      { v: "unsure", label: "I'm not sure yet" },
    ],
  },
  {
    id: "condition",
    q: "What shape is the property in?",
    options: [
      { v: "ready", label: "Move-in ready or close to it", listing: 3 },
      { v: "cosmetic", label: "Dated, needs cosmetic updates", listing: 1 },
      { v: "major", label: "Needs major work (roof, foundation, systems)", asis: 2 },
      { v: "unknown", label: "Not sure, I haven't seen it recently", asis: 1 },
    ],
  },
  {
    id: "timing",
    q: "When do you need to be done?",
    options: [
      { v: "fast", label: "Within about 30 days", asis: 2 },
      { v: "months", label: "In 1 to 3 months" },
      { v: "flexible", label: "Flexible, or more than 3 months", listing: 2 },
    ],
  },
  {
    id: "funds",
    q: "Could you pay for repairs and preparation before selling?",
    options: [
      { v: "yes", label: "Yes, comfortably", listing: 1 },
      { v: "some", label: "Some, but not much" },
      { v: "no", label: "No, or I'd rather not", asis: 1 },
    ],
  },
  {
    id: "complication",
    q: "Is any of this part of the picture?",
    help: "These don't rule anything out. They change who you should talk to first.",
    options: [
      { v: "none", label: "None of these" },
      { v: "foreclosure", label: "Missed payments or a foreclosure notice" },
      { v: "estate", label: "An inheritance or estate that isn't settled" },
      { v: "tenants", label: "Tenants living in the property" },
      { v: "coowners", label: "Co-owners who disagree, or a divorce" },
    ],
  },
];

const FIRST_STOP: Record<string, { title: string; body: string; href: string; link: string }> = {
  foreclosure: {
    title: "First: call your lender and a housing counselor",
    body: "Ask your servicer about every option, and talk with a HUD-approved housing counselor (free). A sale inquiry doesn't pause any legal deadline.",
    href: "/sell-before-foreclosure",
    link: "Read: selling before a foreclosure deadline",
  },
  estate: {
    title: "First: confirm who can sign",
    body: "Until the estate gives someone authority to sell, no buyer can close. An estate or probate attorney can tell you where things stand.",
    href: "/sell-inherited-property",
    link: "Read: selling an inherited property",
  },
  tenants: {
    title: "First: check the lease",
    body: "Leases and local tenant rules usually carry over to a buyer. Know the lease terms, deposits and notice rules before you choose a route.",
    href: "/sell-rental-property",
    link: "Read: selling a rental property",
  },
  coowners: {
    title: "First: get every owner on the same page",
    body: "Generally everyone on title must agree and sign. If there's a dispute or a divorce, talk with your attorney before choosing a buyer.",
    href: "/contact#request",
    link: "Ask us a question",
  },
};

export function SituationFinder() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const headRef = useRef<HTMLHeadingElement>(null);
  const done = step >= QUESTIONS.length;

  const choose = (qid: string, v: string) => {
    const next = { ...answers, [qid]: v };
    setAnswers(next);
    const n = step + 1;
    setStep(n);
    if (n >= QUESTIONS.length) track("tool_completed", { form: "situation_finder" });
    requestAnimationFrame(() => headRef.current?.focus());
  };

  let listing = 0, asis = 0;
  for (const q of QUESTIONS) {
    const o = q.options.find((x) => x.v === answers[q.id]);
    listing += o?.listing ?? 0;
    asis += o?.asis ?? 0;
  }
  const diff = asis - listing;
  const verdict = diff >= 2 ? "asis" : diff <= -2 ? "listing" : "both";
  const firstStop = FIRST_STOP[answers.complication ?? ""];
  const q = QUESTIONS[Math.min(step, QUESTIONS.length - 1)];

  return (
    <div className="card overflow-hidden" id="situation-finder">
      <div className="h-1 w-full bg-black" aria-hidden>
        <div className="metal-bg h-full transition-[width] duration-500" style={{ width: `${(Math.min(step, QUESTIONS.length) / QUESTIONS.length) * 100}%` }} />
      </div>
      <div className="p-6 sm:p-9">
        {!done ? (
          <fieldset key={q.id}>
            <legend className="w-full">
              <span className="block text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-fg-muted">Question {step + 1} of {QUESTIONS.length}</span>
              <span ref={headRef} tabIndex={-1} className="mt-2 block font-display text-[1.45rem] font-bold leading-snug outline-none sm:text-[1.7rem]">{q.q}</span>
            </legend>
            {q.help && <p className="mt-2 text-fg-muted">{q.help}</p>}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {q.options.map((o) => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => choose(q.id, o.v)}
                  aria-pressed={answers[q.id] === o.v}
                  className="card-link flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-line-strong bg-black px-5 py-3.5 text-left text-[1.02rem] font-medium hover:bg-black aria-pressed:border-fg"
                >
                  <span>{o.label}</span>
                  <span aria-hidden className="card-arrow text-fg-muted">→</span>
                </button>
              ))}
            </div>
            {step > 0 && (
              <button type="button" onClick={() => setStep(step - 1)} className="btn btn-ghost mt-5 !px-0 text-fg-2">← Back</button>
            )}
          </fieldset>
        ) : (
          <div role="region" aria-labelledby="sf-result">
            <p className="text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-fg-muted">Based on your answers</p>
            <h3 id="sf-result" ref={headRef} tabIndex={-1} className="mt-2 text-[1.6rem] font-bold outline-none sm:text-[2rem]">
              {verdict === "listing" && "A traditional listing deserves a serious look"}
              {verdict === "asis" && "An as-is sale may fit your situation"}
              {verdict === "both" && "Compare both routes with real numbers"}
            </h3>
            <p className="mt-3 max-w-3xl text-[1.05rem] text-fg-2">
              {verdict === "listing" &&
                "You put price first, the property is in reasonable shape or you have time and funds to prepare it. Those are the conditions where listing with a broker often brings the strongest price. We'd rather tell you that than talk you into a sale that leaves money behind."}
              {verdict === "asis" &&
                "Condition, timing or the effort of preparing the property weigh more for you than squeezing out the top price. That's where an as-is sale can make sense: the price reflects the work, and you skip repairs, showings and most of the uncertainty."}
              {verdict === "both" &&
                "Your answers pull both ways. The fairest way to decide is to compare what you'd actually keep from each route after costs and time, using your own figures."}
            </p>

            {firstStop && (
              <div className="mt-6 rounded-2xl border border-warn/40 bg-warn-soft p-5">
                <p className="font-semibold">{firstStop.title}</p>
                <p className="mt-1 text-fg-2">{firstStop.body}</p>
                <Link href={firstStop.href} className="mt-2 inline-block font-semibold underline underline-offset-4">{firstStop.link}</Link>
              </div>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              {verdict === "listing" ? (
                <>
                  <Link href="/resources#net-proceeds" className="btn btn-primary">Compare net proceeds</Link>
                  <Link href="/cash-offer-calculator" className="btn btn-secondary">See an as-is range anyway</Link>
                </>
              ) : verdict === "asis" ? (
                <>
                  <Link href="/cash-offer-calculator" className="btn btn-primary">Estimate my cash offer</Link>
                  <Link href="/contact#request" className="btn btn-secondary">Request a property review</Link>
                </>
              ) : (
                <>
                  <Link href="/resources#net-proceeds" className="btn btn-primary">Compare net proceeds</Link>
                  <Link href="/cash-offer-calculator" className="btn btn-secondary">Estimate my cash offer</Link>
                </>
              )}
              <button type="button" className="btn btn-ghost" onClick={() => { setAnswers({}); setStep(0); requestAnimationFrame(() => headRef.current?.focus()); }}>Start over</button>
            </div>
            <p className="mt-6 text-[0.85rem] text-fg-muted">General guidance from your answers only, not legal, tax or financial advice. Nothing you chose here was saved or sent.</p>
          </div>
        )}
      </div>
    </div>
  );
}
