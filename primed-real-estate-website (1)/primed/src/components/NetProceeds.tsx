"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { parseMoney, usd } from "./ui";
import { writeHandoff } from "@/lib/handoff";
import { track } from "@/lib/analytics";

/**
 * Seller-friendly comparison of an illustrative listing scenario and a possible as-is purchase.
 * No defaults are invented: every amount is the visitor's own assumption. Loan payoff reduces
 * net proceeds in both scenarios; it never sets the property's value.
 */
type Row = { key: string; label: string; hint: string; kind: "money" | "percent" | "months" };

const SHARED: Row[] = [
  { key: "payoff", label: "Mortgage and lien payoffs", hint: "From your lender's payoff statement, if any.", kind: "money" },
  { key: "monthlyCarry", label: "Monthly carrying costs", hint: "Payment, taxes, insurance, utilities while you own it.", kind: "money" },
];
const LISTING: Row[] = [
  { key: "price", label: "Assumed sale price", hint: "What you think it would sell for after any preparation below.", kind: "money" },
  { key: "brokerPct", label: "Broker compensation (%)", hint: "Whatever you expect to agree to, if you list with a broker.", kind: "percent" },
  { key: "prep", label: "Repairs and preparation", hint: "Work you would do before listing.", kind: "money" },
  { key: "closing", label: "Seller closing costs", hint: "Escrow, title, excise tax and other seller charges you expect.", kind: "money" },
  { key: "concessions", label: "Concessions to the buyer", hint: "Credits after inspection, if you expect any.", kind: "money" },
  { key: "months", label: "Months until closing", hint: "Including preparation and time on market.", kind: "months" },
  { key: "other", label: "Other known deductions", hint: "Anything not already counted above.", kind: "money" },
];
const ASIS: Row[] = [
  { key: "price", label: "Purchase price in a written offer", hint: "Use an actual written figure when you have one.", kind: "money" },
  { key: "closing", label: "Seller closing costs", hint: "Whatever the written terms say you would pay.", kind: "money" },
  { key: "months", label: "Months until closing", hint: "Your expected timeline for this option.", kind: "months" },
  { key: "other", label: "Other known deductions", hint: "Anything not already counted above.", kind: "money" },
];

function parse(kind: Row["kind"], s: string) {
  if (kind === "money") return parseMoney(s);
  const t = s.trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0 || (kind === "percent" && n > 100) || (kind === "months" && n > 60)) return NaN;
  return n;
}

export function NetProceeds() {
  const [shared, setShared] = useState<Record<string, string>>({});
  const [a, setA] = useState<Record<string, string>>({});
  const [b, setB] = useState<Record<string, string>>({});

  const calc = useMemo(() => {
    const num = (rows: Row[], vals: Record<string, string>) => Object.fromEntries(rows.map((r) => [r.key, parse(r.kind, vals[r.key] ?? "")]));
    const S = num(SHARED, shared), L = num(LISTING, a), P = num(ASIS, b);
    const bad = [...Object.entries(S), ...Object.entries(L).map(([k, v]) => [`l-${k}`, v] as const), ...Object.entries(P).map(([k, v]) => [`p-${k}`, v] as const)]
      .filter(([, v]) => typeof v === "number" && Number.isNaN(v)).map(([k]) => k as string);
    const n = (v: number | null) => (typeof v === "number" && !Number.isNaN(v) ? v : 0);
    const payoff = n(S.payoff), carry = n(S.monthlyCarry);
    const listing = L.price && !Number.isNaN(L.price)
      ? (() => {
          const broker = n(L.price) * (n(L.brokerPct) / 100);
          const carrying = carry * n(L.months);
          const items = [
            ["Assumed sale price", n(L.price)], ["Broker compensation", -broker], ["Repairs and preparation", -n(L.prep)],
            ["Seller closing costs", -n(L.closing)], ["Concessions", -n(L.concessions)], ["Carrying costs", -carrying],
            ["Other deductions", -n(L.other)], ["Loan and lien payoffs", -payoff],
          ] as [string, number][];
          return { items, net: items.reduce((s, [, v]) => s + v, 0) };
        })()
      : null;
    const asis = P.price && !Number.isNaN(P.price)
      ? (() => {
          const carrying = carry * n(P.months);
          const items = [
            ["Purchase price", n(P.price)], ["Seller closing costs", -n(P.closing)], ["Carrying costs", -carrying],
            ["Other deductions", -n(P.other)], ["Loan and lien payoffs", -payoff],
          ] as [string, number][];
          return { items, net: items.reduce((s, [, v]) => s + v, 0) };
        })()
      : null;
    return { listing, asis, bad };
  }, [shared, a, b]);

  const Result = ({ title, data }: { title: string; data: { items: [string, number][]; net: number } | null }) => (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <h4 className="font-display text-[1.1rem] font-bold">{title}</h4>
      {data ? (
        <>
          <dl className="mt-3 space-y-1.5 text-[0.95rem]">
            {data.items.filter(([, v], i) => i === 0 || v !== 0).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3"><dt className="text-fg-muted">{k}</dt><dd className="tabular-nums">{v < 0 ? `−${usd(-v)}` : usd(v)}</dd></div>
            ))}
          </dl>
          <div className="mt-3 flex justify-between gap-3 border-t border-line pt-3 font-semibold">
            <span>Estimated net to you</span><span className="tabular-nums">{data.net < 0 ? `−${usd(-data.net)}` : usd(data.net)}</span>
          </div>
        </>
      ) : (
        <p className="mt-3 text-[0.95rem] text-fg-muted">Enter a price to see this scenario.</p>
      )}
    </div>
  );

  const difference = calc.listing && calc.asis ? calc.asis.net - calc.listing.net : null;

  return (
    <div id="net-proceeds" className="scroll-mt-28 rounded-[22px] border border-line bg-surface-2 p-5 text-fg sm:p-8">
      <fieldset>
        <legend className="font-display text-[1.15rem] font-bold">Costs that apply either way</legend>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">{SHARED.map((r) => <NPInput key={r.key} r={r} value={shared[r.key] ?? ""} onChange={(v) => setShared((p) => ({ ...p, [r.key]: v }))} id={`np-s-${r.key}`} invalid={calc.bad.includes(r.key)} />)}</div>
      </fieldset>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <fieldset>
          <legend className="font-display text-[1.15rem] font-bold">Scenario A: list the property</legend>
          <div className="mt-3 grid gap-4">{LISTING.map((r) => <NPInput key={r.key} r={r} value={a[r.key] ?? ""} onChange={(v) => setA((p) => ({ ...p, [r.key]: v }))} id={`np-l-${r.key}`} invalid={calc.bad.includes(`l-${r.key}`)} />)}</div>
        </fieldset>
        <fieldset>
          <legend className="font-display text-[1.15rem] font-bold">Scenario B: possible as-is purchase</legend>
          <div className="mt-3 grid gap-4">{ASIS.map((r) => <NPInput key={r.key} r={r} value={b[r.key] ?? ""} onChange={(v) => setB((p) => ({ ...p, [r.key]: v }))} id={`np-p-${r.key}`} invalid={calc.bad.includes(`p-${r.key}`)} />)}</div>
        </fieldset>
      </div>
      <div className="mt-8" aria-live="polite">
        <h3 className="font-display text-[1.25rem] font-bold">Side-by-side scenario estimate</h3>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <Result title="Scenario A: listing" data={calc.listing} />
          <Result title="Scenario B: as-is purchase" data={calc.asis} />
        </div>
        {difference !== null && (
          <p className="mt-4 text-[1rem]">
            With your assumptions, Scenario B nets <strong>{usd(Math.abs(difference))} {difference >= 0 ? "more" : "less"}</strong> than Scenario A.
            Timing, certainty and effort matter too, and only you can weigh those.
          </p>
        )}
        <p className="mt-3 text-[0.88rem] text-fg-muted">
          Scenario estimates only, based entirely on the numbers you entered. Not tax, legal or financial advice. Neither option is right for everyone.
        </p>
      </div>
      {(calc.listing || calc.asis) && (
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/contact#request" className="btn btn-primary" onClick={() => {
            const note = `Net proceeds comparison I ran: ${calc.listing ? `listing net ${usd(calc.listing.net)}` : ""}${calc.listing && calc.asis ? "; " : ""}${calc.asis ? `as-is net ${usd(calc.asis.net)}` : ""}.`;
            writeHandoff({ source: "net_proceeds" });
            try { sessionStorage.setItem("primed.noteDraft", note); } catch {}
            track("net_proceeds_compared", { result: calc.listing && calc.asis ? "both" : "one" });
          }}>Bring these assumptions to a property review</Link>
        </div>
      )}
    </div>
  );
}

function NPInput({ r, value, onChange, id, invalid }: { r: Row; value: string; onChange: (v: string) => void; id: string; invalid: boolean }) {
  return (
    <div>
      <label htmlFor={id} className="field-label !mb-1 text-[0.93rem]">{r.label}</label>
      <div className="relative">
        {r.kind === "money" && <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted">$</span>}
        <input id={id} inputMode="decimal" className={`field ${r.kind === "money" ? "!pl-7" : ""}`} value={value}
          aria-describedby={`${id}-h`} aria-invalid={invalid || undefined} onChange={(e) => onChange(e.target.value)} />
        {r.kind === "percent" && <span aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted">%</span>}
      </div>
      <p id={`${id}-h`} className="field-hint !mt-1">{invalid ? <span className="text-err">{r.kind === "months" ? "Enter 0 to 60 months." : r.kind === "percent" ? "Enter 0 to 100." : "Enter a number, like 12500."}</span> : r.hint}</p>
    </div>
  );
}
