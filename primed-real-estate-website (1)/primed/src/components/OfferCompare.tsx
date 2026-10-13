"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { parseMoney, usd } from "./ui";
import { track } from "@/lib/analytics";

/**
 * Offer checker: put up to three written offers side by side. It compares what you'd keep and flags
 * terms worth asking about. Everything stays in the browser; nothing is saved or sent.
 */
type Offer = {
  name: string;
  price: string;
  costs: string;
  deposit: string;
  days: string;
  review: string;
  financing: "" | "cash" | "loan";
  assign: "" | "no" | "yes" | "unknown";
  proof: "" | "yes" | "no";
};

const blank = (n: number): Offer => ({ name: `Offer ${String.fromCharCode(65 + n)}`, price: "", costs: "", deposit: "", days: "", review: "", financing: "", assign: "", proof: "" });

const int = (s: string) => {
  const t = s.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 && n <= 730 ? Math.round(n) : NaN;
};

function analyze(o: Offer) {
  const price = parseMoney(o.price);
  const costs = parseMoney(o.costs);
  const deposit = parseMoney(o.deposit);
  const days = int(o.days);
  const review = int(o.review);
  const invalid = [price, costs, deposit].some((v) => typeof v === "number" && Number.isNaN(v)) || [days, review].some((v) => typeof v === "number" && Number.isNaN(v));
  const ok = (v: number | null) => (typeof v === "number" && !Number.isNaN(v) ? v : null);
  const p = ok(price);
  const net = p !== null ? p - (ok(costs) ?? 0) : null;
  const flags: string[] = [];
  const good: string[] = [];
  if (p !== null && ok(deposit) !== null) {
    const pct = (ok(deposit)! / p) * 100;
    if (pct < 0.5) flags.push(`Deposit is ${pct.toFixed(2)}% of the price. A small deposit means less at stake for the buyer if they walk away.`);
    else good.push(`Deposit of ${pct.toFixed(1)}% of the price`);
  } else if (p !== null) flags.push("No deposit amount entered. Ask how much earnest money is deposited, with whom, and when.");
  if (ok(review) !== null && ok(review)! > 10) flags.push(`${ok(review)}-day inspection or review period. The buyer can usually cancel during it.`);
  else if (ok(review) !== null) good.push(`Short review period (${ok(review)} days)`);
  if (o.financing === "loan") flags.push("Depends on the buyer's loan approval and an appraisal.");
  if (o.financing === "cash") good.push("No loan approval needed");
  if (o.assign === "yes" || o.assign === "unknown") flags.push(o.assign === "yes" ? "Contract may be assigned. Ask who will actually close and what happens to the deposit if they don't." : "Not sure whether the contract can be assigned. Read the assignment clause or ask.");
  if (o.proof === "no") flags.push("No proof of funds yet. It's reasonable to ask for it.");
  if (o.proof === "yes") good.push("Proof of funds provided");
  if (ok(days) !== null) good.push(`Closes in about ${ok(days)} days`);
  return { net, flags, good, invalid, filled: p !== null };
}

export function OfferCompare() {
  const [offers, setOffers] = useState<Offer[]>([blank(0), blank(1)]);
  const tracked = useRef(false);
  const set = (i: number, k: keyof Offer, v: string) => setOffers((os) => os.map((o, j) => (j === i ? { ...o, [k]: v } : o)));
  const results = useMemo(() => offers.map(analyze), [offers]);
  const filled = results.filter((r) => r.filled && !r.invalid);
  const bestNet = filled.length > 1 ? Math.max(...filled.map((r) => r.net ?? -Infinity)) : null;
  const fewestFlags = filled.length > 1 ? Math.min(...filled.map((r) => r.flags.length)) : null;
  useEffect(() => {
    if (filled.length >= 2 && !tracked.current) { tracked.current = true; track("tool_completed", { form: "offer_compare" }); }
  }, [filled.length]);

  return (
    <div className="card p-5 sm:p-8" id="offer-compare" data-hide-actionbar>
      <div className={`grid gap-5 ${offers.length === 3 ? "lg:grid-cols-3" : "md:grid-cols-2"}`}>
        {offers.map((o, i) => {
          const r = results[i];
          const p = `oc${i}`;
          const best = bestNet !== null && r.net === bestNet && r.filled;
          const safest = fewestFlags !== null && r.filled && r.flags.length === fewestFlags;
          return (
            <section key={i} aria-labelledby={`${p}-h`} className={`rounded-2xl border p-5 ${best ? "border-fg/60 bg-black" : "border-line bg-black"}`}>
              <div className="flex items-center justify-between gap-2">
                <h3 id={`${p}-h`} className="sr-only">{o.name}</h3>
                <label htmlFor={`${p}-name`} className="sr-only">Name for this offer</label>
                <input id={`${p}-name`} value={o.name} maxLength={30} onChange={(e) => set(i, "name", e.target.value)} className="w-full bg-transparent font-display text-[1.2rem] font-bold outline-none focus-visible:underline" />
                {offers.length > 2 && (
                  <button type="button" onClick={() => setOffers(offers.filter((_, j) => j !== i))} className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-line-strong text-fg-muted hover:text-fg">
                    <span aria-hidden>×</span><span className="sr-only">Remove {o.name}</span>
                  </button>
                )}
              </div>
              <div className="mt-4 grid gap-3">
                {([
                  ["price", "Offer price", "$"],
                  ["costs", "Costs you'd pay at closing", "$"],
                  ["deposit", "Earnest money deposit", "$"],
                  ["days", "Days until closing", ""],
                  ["review", "Inspection or review period (days)", ""],
                ] as const).map(([k, label, pre]) => (
                  <div key={k}>
                    <label htmlFor={`${p}-${k}`} className="field-label !text-[0.88rem]">{label}</label>
                    <div className="relative">
                      {pre && <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted">{pre}</span>}
                      <input id={`${p}-${k}`} inputMode="numeric" className={`field !min-h-11 ${pre ? "!pl-7" : ""}`} value={o[k]} onChange={(e) => set(i, k, e.target.value)} />
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor={`${p}-fin`} className="field-label !text-[0.88rem]">Paying with</label>
                    <select id={`${p}-fin`} className="field !min-h-11" value={o.financing} onChange={(e) => set(i, "financing", e.target.value)}>
                      <option value="">Not sure</option><option value="cash">Cash</option><option value="loan">A loan</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor={`${p}-proof`} className="field-label !text-[0.88rem]">Proof of funds</label>
                    <select id={`${p}-proof`} className="field !min-h-11" value={o.proof} onChange={(e) => set(i, "proof", e.target.value)}>
                      <option value="">Not sure</option><option value="yes">Provided</option><option value="no">Not yet</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor={`${p}-assign`} className="field-label !text-[0.88rem]">Can the contract be assigned?</label>
                  <select id={`${p}-assign`} className="field !min-h-11" value={o.assign} onChange={(e) => set(i, "assign", e.target.value)}>
                    <option value="">Choose</option><option value="no">No</option><option value="yes">Yes</option><option value="unknown">Not sure</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 border-t border-line pt-4" aria-live="polite">
                {r.invalid ? (
                  <p className="field-error">Check the numbers: use whole amounts and days (0–730).</p>
                ) : r.filled ? (
                  <>
                    <p className="text-[0.85rem] text-fg-muted">You&apos;d keep before any loan payoff</p>
                    <p className="font-display text-[1.7rem] font-bold">{usd(r.net ?? 0)}</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {best && <span className="rounded-full bg-fg px-2.5 py-0.5 text-[0.75rem] font-bold text-ink">Highest net</span>}
                      {safest && <span className="rounded-full border border-ok/60 px-2.5 py-0.5 text-[0.75rem] font-bold text-ok">Fewest flags</span>}
                    </div>
                    {r.flags.length > 0 && (
                      <ul className="mt-3 space-y-1.5 text-[0.9rem]">
                        {r.flags.map((f) => (<li key={f} className="flex gap-2 text-fg-2"><span aria-hidden className="text-warn">!</span><span><span className="sr-only">Ask about: </span>{f}</span></li>))}
                      </ul>
                    )}
                    {r.good.length > 0 && (
                      <ul className="mt-3 space-y-1 text-[0.88rem] text-fg-muted">
                        {r.good.map((g) => (<li key={g} className="flex gap-2"><span aria-hidden className="text-ok">✓</span>{g}</li>))}
                      </ul>
                    )}
                  </>
                ) : (
                  <p className="text-[0.92rem] text-fg-muted">Enter the offer price to see a result.</p>
                )}
              </div>
            </section>
          );
        })}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        {offers.length < 3 ? (
          <button type="button" className="btn btn-secondary" onClick={() => setOffers([...offers, blank(offers.length)])}>Add a third offer</button>
        ) : <span />}
        <p className="max-w-xl text-[0.85rem] text-fg-muted">
          The highest price isn&apos;t always the best offer. A bigger deposit, fewer contingencies and a buyer who will actually close can matter as much.
          This tool doesn&apos;t replace reading the agreement; consider having an attorney review it. Nothing here is saved or sent.
        </p>
      </div>
    </div>
  );
}
