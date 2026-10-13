"use client";

import { useEffect, useRef, useState } from "react";
import { PROPERTY_TYPES, INVESTOR_STRATEGIES, REHAB_TOLERANCE, INVESTOR_TIMING, CONTACT_METHODS } from "@/lib/schemas";
import { readAttribution, newIdempotencyKey } from "@/lib/handoff";
import { track } from "@/lib/analytics";
import { TextField, RadioGroup, CheckboxGroup, TextArea, ErrorSummary, Honeypot, SelectField } from "./ui";
import { MarketingChoices } from "./Calculator";

/** Investor "buy box" intake. Proof of funds is requested later through a secure process, never uploaded here. */
export function InvestorForm() {
  const [v, setV] = useState({
    name: "", entity: "", email: "", phone: "", preferredContact: "email", markets: "",
    propertyTypes: [] as string[], strategy: [] as string[], priceMin: "", priceMax: "", rehabTolerance: "", timing: "", notes: "",
    marketingEmail: false, marketingSms: false, company: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [serverMsg, setServerMsg] = useState("");
  const [started, setStarted] = useState(false);
  const key = useRef("");
  const summaryRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  useEffect(() => { key.current = newIdempotencyKey(); }, []);

  const set = <K extends keyof typeof v>(k: K) => (val: (typeof v)[K]) => {
    if (!started) { setStarted(true); track("investor_form_start", { form: "investor" }); }
    setV((p) => ({ ...p, [k]: val }));
    if (errors[k as string]) setErrors((e) => { const n = { ...e }; delete n[k as string]; return n; });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "saving") return;
    const errs: Record<string, string> = {};
    if (!v.name.trim()) errs.name = "Please tell us your name.";
    if (!/^\S+@\S+\.\S+$/.test(v.email)) errs.email = "Enter a valid email address.";
    if (v.preferredContact !== "email" && v.phone.replace(/\D/g, "").length < 10) errs.phone = "Add a 10-digit phone number so we can call or text.";
    if (v.markets.trim().length < 2) errs.markets = "List at least one market (city, county, metro or state).";
    if (!v.propertyTypes.length) errs.propertyTypes = "Choose at least one property type.";
    if (!v.strategy.length) errs.strategy = "Choose at least one strategy.";
    if (!v.rehabTolerance) errs.rehabTolerance = "Choose your rehab tolerance.";
    if (!v.timing) errs.timing = "Choose your acquisition timing.";
    const mn = Number(v.priceMin.replace(/[$,]/g, "")), mx = Number(v.priceMax.replace(/[$,]/g, ""));
    if (v.priceMin && v.priceMax && mn > mx) errs.priceMax = "Maximum price should be higher than the minimum.";
    if (Object.keys(errs).length) { setErrors(errs); requestAnimationFrame(() => summaryRef.current?.focus()); return; }
    setErrors({});
    setStatus("saving");
    try {
      const res = await fetch("/api/leads/investor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: key.current, name: v.name, entity: v.entity, email: v.email, phone: v.phone, preferredContact: v.preferredContact,
          markets: v.markets, propertyTypes: v.propertyTypes, priceMin: v.priceMin, priceMax: v.priceMax, strategy: v.strategy,
          rehabTolerance: v.rehabTolerance, timing: v.timing, notes: v.notes, sourcePage: window.location.pathname, utm: readAttribution(),
          consent: { marketingEmail: v.marketingEmail, marketingSms: v.marketingSms }, company: v.company,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 422 && data.errors) { setErrors(data.errors); setStatus("idle"); requestAnimationFrame(() => summaryRef.current?.focus()); return; }
      if (!res.ok || !data.ok) throw new Error(data.message || "Your criteria were not saved.");
      setStatus("saved");
      track("investor_inquiry_submitted", { form: "investor" }, key.current);
      requestAnimationFrame(() => doneRef.current?.focus());
    } catch (err) {
      setServerMsg((err as Error).message);
      setStatus("error");
    }
  };

  if (status === "saved")
    return (
      <div ref={doneRef} tabIndex={-1} role="status" className="rounded-2xl border border-ok bg-ok-soft p-6 text-fg outline-none sm:p-8">
        <p className="font-display text-[1.4rem] font-bold">Your buying criteria were received</p>
        <p className="mt-2">We saved your buy box. If we have a property under contract that matches, we will contact you by your preferred method. We may ask to verify funding through a secure, private process before sharing full property details.</p>
      </div>
    );

  return (
    <form onSubmit={submit} noValidate className="rounded-2xl border border-line bg-surface p-5 text-fg shadow-[0_30px_60px_-45px_rgba(8,9,11,.5)] sm:p-8" aria-label="Investor buying criteria">
      <ErrorSummary ref={summaryRef} errors={errors} fieldIds={{ name: "iv-name", email: "iv-email", phone: "iv-phone", markets: "iv-markets", priceMax: "iv-max" }} />
      <Honeypot value={v.company} onChange={(x) => set("company")(x)} />
      <h3 className="text-[1.2rem] font-bold">About you</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <TextField id="iv-name" label="Your name" required autoComplete="name" value={v.name} error={errors.name} onChange={(e) => set("name")(e.target.value)} />
        <TextField label="Company or entity" optional autoComplete="organization" value={v.entity} onChange={(e) => set("entity")(e.target.value)} />
        <TextField id="iv-email" label="Email" type="email" required autoComplete="email" value={v.email} error={errors.email} onChange={(e) => set("email")(e.target.value)} />
        <TextField id="iv-phone" label="Phone" type="tel" autoComplete="tel" required={v.preferredContact !== "email"} optional={v.preferredContact === "email"} value={v.phone} error={errors.phone} onChange={(e) => set("phone")(e.target.value)} />
        <div className="sm:col-span-2"><RadioGroup legend="Preferred communication" name="iv-method" columns={3} value={v.preferredContact} onChange={(x) => set("preferredContact")(x)} options={CONTACT_METHODS} /></div>
      </div>
      <h3 className="mt-8 text-[1.2rem] font-bold">Your buy box</h3>
      <div className="mt-4 grid gap-5">
        <TextArea id="iv-markets" label="Markets you buy in" required rows={2} value={v.markets} error={errors.markets} onChange={(e) => set("markets")(e.target.value)} hint="Cities, counties, metros or states. For example: Pierce and King counties, WA; Boise metro." />
        <CheckboxGroup legend="Property types" options={PROPERTY_TYPES} values={v.propertyTypes} onChange={(x) => set("propertyTypes")(x)} error={errors.propertyTypes} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Minimum purchase price" optional inputMode="decimal" value={v.priceMin} onChange={(e) => set("priceMin")(e.target.value)} />
          <TextField id="iv-max" label="Maximum purchase price" optional inputMode="decimal" value={v.priceMax} error={errors.priceMax} onChange={(e) => set("priceMax")(e.target.value)} />
        </div>
        <CheckboxGroup legend="Strategy" options={INVESTOR_STRATEGIES} values={v.strategy} onChange={(x) => set("strategy")(x)} error={errors.strategy} />
        <RadioGroup legend="Rehab tolerance" name="iv-rehab" required columns={2} value={v.rehabTolerance} onChange={(x) => set("rehabTolerance")(x)} options={REHAB_TOLERANCE} error={errors.rehabTolerance} />
        <SelectField label="Acquisition timing" required options={INVESTOR_TIMING} value={v.timing} error={errors.timing} onChange={(e) => set("timing")(e.target.value)} />
        <TextArea label="Anything else about your criteria?" optional rows={3} value={v.notes} onChange={(e) => set("notes")(e.target.value)} hint="Financing type, closing speed, exclusions. Please don't upload or paste bank statements or proof of funds here." />
      </div>
      <MarketingChoices email={v.marketingEmail} sms={v.marketingSms} onEmail={(x) => set("marketingEmail")(x)} onSms={(x) => set("marketingSms")(x)} />
      {status === "error" && (
        <div role="alert" className="mt-4 rounded-xl border border-err bg-err-soft p-4">
          <p className="font-semibold">Your criteria were not saved.</p>
          <p className="text-[0.95rem]">{serverMsg} Your entries are still here; please try again.</p>
        </div>
      )}
      <div className="mt-6"><button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={status === "saving"}>{status === "saving" ? "Sending…" : "Submit My Buy Box"}</button></div>
      <p className="mt-3 text-[0.85rem] text-fg-muted">Submitting criteria does not entitle you to any property. See our <a className="inline-link" href="/privacy">privacy policy</a>.</p>
    </form>
  );
}
