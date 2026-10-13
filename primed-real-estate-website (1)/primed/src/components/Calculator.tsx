"use client";

import { useEffect, useRef, useState } from "react";
import STATES from "@/data/states.json";
import { PROPERTY_TYPES, CONDITIONS, OCCUPANCY, TIMELINES, CONTACT_METHODS } from "@/lib/schemas";
import { readHandoff, writeHandoff, readAttribution, newIdempotencyKey, HANDOFF_EVENT } from "@/lib/handoff";
import { StatusLink } from "./StatusLink";
import { track } from "@/lib/analytics";
import { TextField, SelectField, RadioGroup, TextArea, ErrorSummary, Honeypot, parseMoney, usd } from "./ui";
import { RepairGuide } from "./RepairGuide";
import { usePublicConfig } from "./PublicConfig";

type Step = 1 | 2 | 3 | 4 | 5;
const STEP_NAMES = ["Location", "Property", "Repairs", "Estimate", "Reviewed offer"];

type EstimateResponse =
  | { status: "estimate"; estimateId: string; mode: "live" | "preview"; low: number; high: number; modelVersion: string; assumptions: string[] }
  | { status: "manual_review"; estimateId: string; mode: string; reasons: string[]; message: string }
  | { status: "disabled"; estimateId: string; message: string };

const stateList = STATES as { abbr: string; name: string }[];

export function Calculator({ compact = false }: { compact?: boolean }) {
  const [step, setStep] = useState<Step>(1);
  const [f, setF] = useState({
    address: "", city: "", state: "", zip: "",
    propertyType: "", sqft: "", bedrooms: "", bathrooms: "", condition: "", occupancy: "", timeline: "",
    arvMode: "known" as "known" | "unsure", arv: "",
    repairMode: "known" as "known" | "guided" | "unsure", repairs: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<EstimateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [started, setStarted] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const live = useRef<HTMLDivElement>(null);

  // Prefill from the hero, map or repair guide (same browser tab only).
  useEffect(() => {
    const apply = () => {
      const h = readHandoff();
      setF((p) => ({
        ...p,
        address: h.address ?? p.address, city: h.city ?? p.city, state: h.state ?? p.state, zip: h.zip ?? p.zip,
        propertyType: h.propertyType ?? p.propertyType, condition: h.condition ?? p.condition, sqft: h.sqft ?? p.sqft,
        repairs: h.repairs ?? p.repairs, repairMode: h.repairs ? "known" : p.repairMode,
      }));
    };
    apply();
    window.addEventListener(HANDOFF_EVENT, apply);
    return () => window.removeEventListener(HANDOFF_EVENT, apply);
  }, []);

  const set = (k: keyof typeof f) => (v: string) => {
    if (!started) { setStarted(true); track("calculator_start", { step: "1" }); }
    setF((p) => ({ ...p, [k]: v }));
    setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  const go = (s: Step) => {
    setStep(s);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const fail = (e: Record<string, string>) => {
    setErrors(e);
    requestAnimationFrame(() => summaryRef.current?.focus());
    return false;
  };

  const validate = (s: Step) => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!f.state) e.state = "Choose the property's state.";
      if (f.zip && !/^\d{5}$/.test(f.zip)) e.zip = "Enter a 5-digit ZIP code or leave it blank.";
    }
    if (s === 2) {
      if (!f.propertyType) e.propertyType = "Choose a property type.";
      if (!f.condition) e.condition = "Choose the condition that fits best.";
      if (f.sqft && !(Number(f.sqft) >= 200 && Number(f.sqft) <= 30000)) e.sqft = "Enter a size between 200 and 30,000 sq ft, or leave it blank.";
      if (f.arvMode === "known") {
        const v = parseMoney(f.arv);
        if (v === null) e.arv = "Enter an estimated after-repair value, or choose “I'm not sure.”";
        else if (Number.isNaN(v) || v <= 0) e.arv = "Enter a dollar amount, like 350000.";
      }
    }
    if (s === 3 && f.repairMode !== "unsure") {
      const v = parseMoney(f.repairs);
      if (v === null) e.repairs = "Enter a rough repair budget, use the guide, or choose “I'm not sure.”";
      else if (Number.isNaN(v) || v < 0) e.repairs = "Enter a dollar amount, like 25000.";
    }
    if (Object.keys(e).length) return fail(e);
    setErrors({});
    return true;
  };

  const next = (s: Step) => {
    if (!validate(s)) return;
    track("calculator_step_complete", { step: String(s) });
    if (s === 3) return estimate();
    go((s + 1) as Step);
  };

  const estimate = async () => {
    setLoading(true);
    setApiError("");
    try {
      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          state: f.state, zip: f.zip, propertyType: f.propertyType, condition: f.condition,
          sqft: f.sqft ? Number(f.sqft) : null,
          arv: f.arvMode === "known" ? parseMoney(f.arv) : null,
          repairs: f.repairMode === "unsure" ? null : parseMoney(f.repairs),
        }),
      });
      if (res.status === 429) throw new Error("You have run several estimates in a short time. Please wait a minute and try again.");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "We could not calculate an estimate right now.");
      setResult(data);
      writeHandoff({
        address: f.address, city: f.city, state: f.state, zip: f.zip, propertyType: f.propertyType, condition: f.condition,
        occupancy: f.occupancy, sqft: f.sqft, timeline: f.timeline,
        arv: f.arvMode === "known" ? f.arv : "", repairs: f.repairMode === "unsure" ? "" : f.repairs,
        estimateId: data.estimateId,
        estimateSummary: data.status === "estimate" ? `${usd(data.low)} to ${usd(data.high)}` : "Personalized review needed",
        source: "calculator",
      });
      track(data.status === "estimate" ? "estimate_generated" : "estimate_manual_review", { mode: data.mode ?? data.status, state: f.state });
      go(4);
    } catch (err) {
      setApiError((err as Error).message || "We could not calculate an estimate right now.");
    } finally {
      setLoading(false);
    }
  };

  const fieldIds = { state: "c-state", zip: "c-zip", propertyType: "c-type", condition: "c-cond", sqft: "c-sqft", arv: "c-arv", repairs: "c-repairs" };

  return (
    <div id="calculator" className={`scroll-mt-28 rounded-[22px] border border-line bg-surface text-fg shadow-[0_40px_80px_-50px_rgba(8,9,11,.55)] ${compact ? "" : "lg:grid lg:grid-cols-[260px_1fr]"}`}>
      {/* Progress */}
      <div className={`brushed-dark tone-dark rounded-t-[22px] p-5 ${compact ? "" : "lg:rounded-l-[22px] lg:rounded-tr-none lg:p-7"}`}>
        <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-fg-muted">Preliminary cash-offer estimate</p>
        <ol className={`mt-4 flex gap-2 ${compact ? "" : "lg:flex-col lg:gap-3"}`} aria-label="Calculator progress">
          {STEP_NAMES.map((n, i) => {
            const idx = (i + 1) as Step;
            const state = idx < step ? "done" : idx === step ? "current" : "todo";
            return (
              <li key={n} className="flex flex-1 items-center gap-2.5" aria-current={state === "current" ? "step" : undefined}>
                <span className={`flex h-8 w-8 flex-none items-center justify-center rounded-full text-[0.85rem] font-bold ${state === "todo" ? "border border-white/25 text-fg-muted" : "metal-bg text-[#08090b]"}`}>
                  {state === "done" ? "✓" : idx}
                </span>
                <span className={`hidden text-[0.92rem] ${compact ? "" : "lg:inline"} ${state === "current" ? "font-semibold text-silver-hi" : "text-fg-muted"}`}>{n}<span className="sr-only"> ({state === "done" ? "completed" : state === "current" ? "current step" : "not started"})</span></span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="p-5 sm:p-8">
        <div ref={live} aria-live="polite" className="sr-only">{step === 4 && result ? (result.status === "estimate" ? `Preliminary estimated offer range ${usd(result.low)} to ${usd(result.high)}` : "This property needs a personalized review") : ""}</div>
        <ErrorSummary ref={summaryRef} errors={errors} fieldIds={fieldIds} />

        {step === 1 && (
          <section aria-labelledby="c-h1">
            <h3 id="c-h1" ref={headingRef} tabIndex={-1} className="text-[1.45rem] font-bold outline-none">Where is the property?</h3>
            <p className="mt-1 text-fg-muted">The state is required. A street address helps us review the property later, but the estimate never relies on an address alone.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <TextField className="sm:col-span-2" label="Street address" optional autoComplete="street-address" value={f.address} onChange={(e) => set("address")(e.target.value)} />
              <TextField label="City" optional autoComplete="address-level2" value={f.city} onChange={(e) => set("city")(e.target.value)} />
              <SelectField id="c-state" label="State" required options={stateList.map((s) => ({ value: s.abbr, label: s.name }))} value={f.state} error={errors.state} onChange={(e) => set("state")(e.target.value)} />
              <TextField id="c-zip" label="ZIP code" optional inputMode="numeric" maxLength={5} autoComplete="postal-code" value={f.zip} error={errors.zip} onChange={(e) => set("zip")(e.target.value.replace(/\D/g, ""))} />
            </div>
            <Nav onNext={() => next(1)} />
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="c-h2">
            <h3 id="c-h2" ref={headingRef} tabIndex={-1} className="text-[1.45rem] font-bold outline-none">Tell us about the property</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <SelectField id="c-type" label="Property type" required options={PROPERTY_TYPES} value={f.propertyType} error={errors.propertyType} onChange={(e) => set("propertyType")(e.target.value)} />
              <TextField id="c-sqft" label="Approximate size (sq ft)" optional inputMode="numeric" value={f.sqft} error={errors.sqft} onChange={(e) => set("sqft")(e.target.value.replace(/\D/g, ""))} />
              {f.propertyType !== "land" && (
                <>
                  <TextField label="Bedrooms" optional inputMode="numeric" maxLength={2} value={f.bedrooms} onChange={(e) => set("bedrooms")(e.target.value.replace(/\D/g, ""))} />
                  <TextField label="Bathrooms" optional inputMode="decimal" maxLength={4} value={f.bathrooms} onChange={(e) => set("bathrooms")(e.target.value.replace(/[^\d.]/g, ""))} />
                </>
              )}
              <SelectField id="c-cond" className="sm:col-span-2" label="Overall condition" required options={CONDITIONS} value={f.condition} error={errors.condition} onChange={(e) => set("condition")(e.target.value)} />
              <SelectField label="Who lives there now?" optional options={OCCUPANCY} value={f.occupancy} onChange={(e) => set("occupancy")(e.target.value)} />
              <SelectField label="Preferred selling timeline" optional options={TIMELINES} value={f.timeline} onChange={(e) => set("timeline")(e.target.value)} />
            </div>
            <div className="mt-6 rounded-xl bg-surface-3 p-5">
              <RadioGroup legend="Estimated after-repair value (ARV)" name="arvMode" value={f.arvMode} onChange={(v) => set("arvMode")(v)} columns={2}
                hint="ARV is what the property would likely sell for once the needed repairs are finished, not its value today. Recent nearby sales of similar, updated homes are the best guide."
                options={[{ value: "known", label: "I have an estimate" }, { value: "unsure", label: "I'm not sure" }]} />
              {f.arvMode === "known" ? (
                <TextField id="c-arv" className="mt-4" label="After-repair value" required inputMode="decimal" placeholder="350000" value={f.arv} error={errors.arv} onChange={(e) => set("arv")(e.target.value)}
                  hint="Your best estimate is fine. We confirm value during a personal review." />
              ) : (
                <p className="mt-3 text-[0.95rem] text-fg-muted">No problem. Without a value we cannot calculate a range, but we can still review the property personally. Continue to finish the details.</p>
              )}
            </div>
            <Nav onBack={() => go(1)} onNext={() => next(2)} />
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="c-h3">
            <h3 id="c-h3" ref={headingRef} tabIndex={-1} className="text-[1.45rem] font-bold outline-none">What repairs would it need?</h3>
            <p className="mt-1 text-fg-muted">A rough planning number is enough. It is your assumption, and you can change it after you see the result.</p>
            <div className="mt-5">
              <RadioGroup legend="Repair budget" name="repairMode" value={f.repairMode} onChange={(v) => set("repairMode")(v)} columns={3}
                options={[{ value: "known", label: "I'll enter a total" }, { value: "guided", label: "Help me add it up" }, { value: "unsure", label: "I'm not sure" }]} />
            </div>
            {f.repairMode === "known" && (
              <TextField id="c-repairs" className="mt-5 max-w-sm" label="Estimated repair cost" required inputMode="decimal" placeholder="25000" value={f.repairs} error={errors.repairs} onChange={(e) => set("repairs")(e.target.value)} />
            )}
            {f.repairMode === "guided" && (
              <div className="mt-5">
                <RepairGuide onUse={(t) => { setF((p) => ({ ...p, repairs: String(Math.round(t)), repairMode: "known" })); setErrors({}); }} useLabel="Use this total" />
                {errors.repairs && <p id="c-repairs" className="field-error">{errors.repairs}</p>}
              </div>
            )}
            {f.repairMode === "unsure" && (
              <p className="mt-5 rounded-xl bg-surface-3 p-4 text-[0.95rem]">That's common. Without a repair budget the calculator will route you to a personal review instead of guessing a number.</p>
            )}
            {apiError && (
              <div role="alert" className="mt-5 rounded-xl border border-err bg-err-soft p-4">
                <p className="font-semibold">{apiError}</p>
                <p className="mt-1 text-[0.95rem]">Your answers are saved on this page. You can try again, or request a personal review instead.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" className="btn btn-primary !min-h-11" onClick={estimate}>Try again</button>
                  <button type="button" className="btn btn-secondary !min-h-11" onClick={() => { setResult({ status: "manual_review", estimateId: "", mode: "error", reasons: [], message: "We'll review this property personally." }); go(5); }}>Request a personal review</button>
                </div>
              </div>
            )}
            <Nav onBack={() => go(2)} onNext={() => next(3)} nextLabel={loading ? "Calculating…" : "See my estimate"} disabled={loading} />
          </section>
        )}

        {step === 4 && result && (
          <section aria-labelledby="c-h4">
            <h3 id="c-h4" ref={headingRef} tabIndex={-1} className="sr-only outline-none">Your result</h3>
            {result.status === "estimate" ? (
              <div>
                {result.mode === "preview" && (
                  <p className="mb-4 rounded-lg border border-warn bg-warn-soft px-4 py-2.5 text-[0.9rem] font-semibold text-warn">
                    Preview test calculation using documented test assumptions. This is not a Primed Real Estate offer or estimate.
                  </p>
                )}
                <div className="brushed-dark tone-dark rounded-2xl p-6 sm:p-8">
                  <p className="text-[0.82rem] font-semibold uppercase tracking-[0.18em] text-fg-muted">Preliminary estimated offer range</p>
                  <p className="metal-text mt-2 font-display text-[2.1rem] font-extrabold leading-tight sm:text-[2.8rem]">{usd(result.low)} – {usd(result.high)}</p>
                  <p className="mt-4 text-[0.95rem] text-fg-2">This is an estimate, not a purchase offer. Any written offer depends on property review, title, market conditions, transaction eligibility, and agreed terms.</p>
                </div>
                <h4 className="mt-6 font-semibold">What this range assumes</h4>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.98rem] text-fg-2">
                  {result.assumptions.map((a) => (<li key={a}>{a}</li>))}
                </ul>
                <p className="mt-3 text-[0.88rem] text-fg-muted">Model {result.modelVersion}. The range is a planning tool, not an appraisal or a statistical confidence interval.</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-line bg-surface-3 p-6 sm:p-8">
                <p className="text-[0.82rem] font-semibold uppercase tracking-[0.18em] text-fg-muted">Next step</p>
                <p className="mt-2 font-display text-[1.6rem] font-bold">This property needs a personalized review</p>
                <p className="mt-2">{result.message}</p>
                {result.status === "manual_review" && result.reasons.length > 0 && (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-[0.95rem] text-fg-2">{result.reasons.map((r) => (<li key={r}>{r}</li>))}</ul>
                )}
              </div>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" className="btn btn-primary" onClick={() => { track("cta_click", { cta_id: "calculator_request_reviewed_offer" }); go(5); }}>
                {result.status === "estimate" ? "Request a Reviewed Offer" : "Request a Property Review"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => go(2)}>Adjust my inputs</button>
            </div>
            <p className="mt-3 text-[0.9rem] text-fg-muted">Requesting a review is free and does not commit you to anything. We look at the details and, if the property fits, follow up about any written terms.</p>
          </section>
        )}

        {step === 5 && (
          <section aria-labelledby="c-h5">
            <h3 id="c-h5" ref={headingRef} tabIndex={-1} className="text-[1.45rem] font-bold outline-none">Request a reviewed offer</h3>
            <p className="mt-1 text-fg-muted">We'll review the property details you entered{result?.status === "estimate" ? " along with your preliminary range" : ""}. Tell us how to reach you.</p>
            <ReviewRequest calc={f} estimateId={result?.estimateId || ""} onBack={() => go(4)} hasResult={!!result} />
          </section>
        )}
      </div>
    </div>
  );
}

function Nav({ onBack, onNext, nextLabel = "Continue", disabled }: { onBack?: () => void; onNext: () => void; nextLabel?: string; disabled?: boolean }) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
      {onBack ? <button type="button" className="btn btn-secondary" onClick={onBack}>Back</button> : <span />}
      <button type="button" className="btn btn-primary" onClick={onNext} disabled={disabled}>{nextLabel}</button>
    </div>
  );
}

/** Final step: contact details. Marketing permission is optional and never required. */
function ReviewRequest({ calc, estimateId, onBack, hasResult }: { calc: Record<string, string>; estimateId: string; onBack: () => void; hasResult: boolean }) {
  const [c, setC] = useState({ name: "", email: "", phone: "", preferredContact: "email", notes: "", marketingEmail: false, marketingSms: false, company: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [statusToken, setStatusToken] = useState<string | null>(null);
  const [serverMsg, setServerMsg] = useState("");
  const key = useRef(newIdempotencyKey());
  const summaryRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const set = (k: keyof typeof c) => (v: string | boolean) => setC((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "saving") return;
    const errs: Record<string, string> = {};
    if (!c.name.trim()) errs.name = "Please tell us your name.";
    if (c.preferredContact === "email" && !/^\S+@\S+\.\S+$/.test(c.email)) errs.email = "Add a valid email address so we can reply by email.";
    if (c.preferredContact !== "email" && c.phone.replace(/\D/g, "").length < 10) errs.phone = "Add a 10-digit phone number so we can call or text.";
    if (Object.keys(errs).length) { setErrors(errs); requestAnimationFrame(() => summaryRef.current?.focus()); return; }
    setErrors({});
    setStatus("saving");
    try {
      const res = await fetch("/api/leads/seller", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: key.current, inquiryType: "reviewed_offer", name: c.name, email: c.email, phone: c.phone,
          preferredContact: c.preferredContact, address: calc.address, city: calc.city, state: calc.state, zip: calc.zip,
          propertyType: calc.propertyType || undefined, condition: calc.condition || undefined, occupancy: calc.occupancy || undefined,
          bedrooms: calc.bedrooms, bathrooms: calc.bathrooms, sqft: calc.sqft || undefined,
          ownerArv: calc.arvMode === "known" ? calc.arv : "", ownerRepairs: calc.repairMode === "unsure" ? "" : calc.repairs,
          timeline: calc.timeline || undefined, notes: c.notes, estimateId, sourcePage: window.location.pathname,
          utm: readAttribution(), consent: { marketingEmail: c.marketingEmail, marketingSms: c.marketingSms }, company: c.company,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 422 && data.errors) { setErrors(data.errors); setStatus("idle"); requestAnimationFrame(() => summaryRef.current?.focus()); return; }
      if (!res.ok || !data.ok) throw new Error(data.message || "Your request was not saved.");
      setStatusToken(typeof data.statusToken === "string" ? data.statusToken : null);
      setStatus("saved");
      track("reviewed_offer_requested", { state: calc.state }, key.current);
      requestAnimationFrame(() => doneRef.current?.focus());
    } catch (err) {
      setServerMsg((err as Error).message);
      setStatus("error");
    }
  };

  if (status === "saved")
    return (
      <div ref={doneRef} tabIndex={-1} role="status" className="mt-6 rounded-2xl border border-ok bg-ok-soft p-6 outline-none">
        <p className="font-display text-[1.35rem] font-bold">Your request was received</p>
        <p className="mt-2">We saved your property details{hasResult ? " and your preliminary range" : ""}. Here is what happens next:</p>
        <ol className="mt-3 list-decimal space-y-1 pl-5">
          <li>We review the property, the location and whether the transaction fits.</li>
          <li>We contact you by your preferred method with questions or to arrange a look at the property.</li>
          <li>If it is a fit, we explain any proposed written terms before you decide anything.</li>
        </ol>
        {statusToken && <StatusLink token={statusToken} />}
      </div>
    );

  return (
    <form onSubmit={submit} noValidate className="mt-6" data-hide-actionbar>
      <ErrorSummary ref={summaryRef} errors={errors} fieldIds={{ name: "rr-name", email: "rr-email", phone: "rr-phone" }} />
      <Honeypot value={c.company} onChange={(v) => set("company")(v)} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField id="rr-name" className="sm:col-span-2" label="Your name" required autoComplete="name" value={c.name} error={errors.name} onChange={(e) => set("name")(e.target.value)} />
        <div className="sm:col-span-2">
          <RadioGroup legend="Preferred contact method" name="rr-method" required columns={3} value={c.preferredContact} onChange={(v) => set("preferredContact")(v)} options={CONTACT_METHODS} />
        </div>
        <TextField id="rr-email" label="Email" type="email" autoComplete="email" required={c.preferredContact === "email"} optional={c.preferredContact !== "email"} value={c.email} error={errors.email} onChange={(e) => set("email")(e.target.value)} />
        <TextField id="rr-phone" label="Phone" type="tel" autoComplete="tel" required={c.preferredContact !== "email"} optional={c.preferredContact === "email"} value={c.phone} error={errors.phone} onChange={(e) => set("phone")(e.target.value)} />
        <TextArea className="sm:col-span-2" label="Anything else we should know?" optional rows={3} value={c.notes} onChange={(e) => set("notes")(e.target.value)} hint="Timing, access, liens you know about, or questions you have." />
      </div>
      <MarketingChoices email={c.marketingEmail} sms={c.marketingSms} onEmail={(v) => set("marketingEmail")(v)} onSms={(v) => set("marketingSms")(v)} />
      {status === "error" && (
        <div role="alert" className="mt-4 rounded-xl border border-err bg-err-soft p-4">
          <p className="font-semibold">Your request was not saved.</p>
          <p className="text-[0.95rem]">{serverMsg} Your entries are still here; please try again.</p>
        </div>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button type="button" className="btn btn-secondary" onClick={onBack}>Back</button>
        <button type="submit" className="btn btn-primary" disabled={status === "saving"}>{status === "saving" ? "Sending…" : "Request a Reviewed Offer"}</button>
      </div>
      <p className="mt-3 text-[0.85rem] text-fg-muted">We use these details to respond to your request, as described in our <a className="inline-link" href="/privacy">privacy policy</a>.</p>
    </form>
  );
}

export function MarketingChoices({ email, sms, onEmail, onSms }: { email: boolean; sms: boolean; onEmail: (v: boolean) => void; onSms: (v: boolean) => void }) {
  const cfg = usePublicConfig();
  // Choices only appear when the owner has an actual email or SMS marketing program configured.
  if (!cfg.marketingEmailProgram && !cfg.marketingSmsProgram) return null;
  return (
    <fieldset className="mt-5 rounded-xl border border-line p-4">
      <legend className="px-1 text-[0.95rem] font-semibold">Optional updates</legend>
      <p className="text-[0.88rem] text-fg-muted">Not required to get a response. You can opt out any time.</p>
      {cfg.marketingEmailProgram && (
        <label className="mt-2 flex min-h-11 items-start gap-2.5"><input type="checkbox" className="mt-1 h-4 w-4 accent-black" checked={email} onChange={(e) => onEmail(e.target.checked)} /><span className="text-[0.95rem]">Email me occasional selling guides and updates from Primed Real Estate.</span></label>
      )}
      {cfg.marketingSmsProgram && (
        <label className="flex min-h-11 items-start gap-2.5"><input type="checkbox" className="mt-1 h-4 w-4 accent-black" checked={sms} onChange={(e) => onSms(e.target.checked)} /><span className="text-[0.95rem]">Text me marketing updates from Primed Real Estate. {cfg.smsProgramTerms}</span></label>
      )}
    </fieldset>
  );
}
