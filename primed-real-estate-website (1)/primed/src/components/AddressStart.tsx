"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import STATES from "@/data/states.json";
import { writeHandoff } from "@/lib/handoff";
import { track } from "@/lib/analytics";

/** Hero entry: starts the calculator with an address or ZIP. Nothing is put in the URL. */
export function AddressStart({ primaryLabel, secondary }: { primaryLabel: string; secondary?: { label: string; href: string } }) {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [zip, setZip] = useState("");
  const [state, setState] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state) return setError("Choose the property's state to continue.");
    if (zip && !/^\d{5}$/.test(zip)) return setError("Enter a 5-digit ZIP code or leave it blank.");
    writeHandoff({ address: address.trim(), zip, state, source: "home_hero" });
    track("calculator_start", { step: "hero", state });
    router.push("/cash-offer-calculator#calculator");
  };

  return (
    <form onSubmit={submit} noValidate className="card relative p-6 backdrop-blur-md sm:p-8" aria-labelledby="start-title">
      <div aria-hidden className="silver-rule absolute inset-x-8 top-0 opacity-60" />
      <h2 id="start-title" className="text-[1.3rem] font-bold">Start with your property</h2>
      <p className="mt-1 text-[0.95rem] text-fg-muted">Enter what you know. You can fill in or correct details on the next step.</p>
      <div className="mt-5 grid gap-4">
        <div>
          <label htmlFor="hs-address" className="field-label">Street address <span className="font-normal text-fg-muted">(optional)</span></label>
          <input id="hs-address" className="field" autoComplete="street-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="hs-zip" className="field-label">ZIP code</label>
            <input id="hs-zip" className="field" inputMode="numeric" autoComplete="postal-code" maxLength={5} value={zip} onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))} />
          </div>
          <div>
            <label htmlFor="hs-state" className="field-label">State<span className="ml-1 text-err" aria-hidden>*</span></label>
            <select id="hs-state" className="field" value={state} onChange={(e) => { setState(e.target.value); setError(""); }} aria-required aria-invalid={error && !state ? true : undefined} aria-describedby={error ? "hs-err" : undefined}>
              <option value="">Select</option>
              {(STATES as { abbr: string; name: string }[]).map((s) => (<option key={s.abbr} value={s.abbr}>{s.name}</option>))}
            </select>
          </div>
        </div>
        {error && <p id="hs-err" role="alert" className="field-error !mt-0">{error}</p>}
        <div className="grid gap-2">
          <button type="submit" className="btn btn-primary w-full">{primaryLabel}</button>
          {secondary && <Link href={secondary.href} className="btn btn-secondary w-full" onClick={() => track("cta_click", { cta_id: "hero_property_review" })}>{secondary.label}</Link>}
        </div>
        <p className="text-[0.82rem] text-fg-muted">An estimate is not a purchase offer. Address lookup is manual; we never pull a price from an address alone.</p>
      </div>
    </form>
  );
}
