"use client";

import { useEffect, useRef, useState } from "react";
import STATES from "@/data/states.json";
import { PROPERTY_TYPES, CONDITIONS, OCCUPANCY, TIMELINES, CONTACT_METHODS } from "@/lib/schemas";
import { readHandoff, readAttribution, newIdempotencyKey, HANDOFF_EVENT } from "@/lib/handoff";
import { StatusLink } from "./StatusLink";
import { track } from "@/lib/analytics";
import { TextField, SelectField, RadioGroup, TextArea, ErrorSummary, Honeypot } from "./ui";
import { MarketingChoices } from "./Calculator";
import { usePublicConfig } from "./PublicConfig";

type InquiryType = "property_review" | "reviewed_offer" | "time_sensitive" | "location_check" | "general";
const stateList = STATES as { abbr: string; name: string }[];

/**
 * Seller inquiry form. Short by default; property details expand progressively.
 * Preserves details carried from the calculator, map or timeline planner (same tab only).
 */
export function SellerForm({
  inquiryType = "property_review",
  submitLabel = "Request My Property Review",
  defaultState,
  showDeadline = false,
  showPreferredDate = false,
  showOccupancyNote = false,
  formId = "seller",
}: {
  inquiryType?: InquiryType;
  submitLabel?: string;
  defaultState?: string;
  showDeadline?: boolean;
  showPreferredDate?: boolean;
  showOccupancyNote?: boolean;
  formId?: string;
}) {
  const cfg = usePublicConfig();
  const [v, setV] = useState({
    name: "", email: "", phone: "", preferredContact: "email",
    address: "", city: "", state: defaultState ?? "", zip: "",
    propertyType: "", condition: "", occupancy: "", timeline: "", preferredDate: "", deadline: "", circumstances: "",
    sqft: "", ownerArv: "", ownerRepairs: "", notes: "",
    marketingEmail: false, marketingSms: false, company: "",
  });
  const [estimateId, setEstimateId] = useState("");
  const [estimateSummary, setEstimateSummary] = useState("");
  const [carried, setCarried] = useState(false);
  const [more, setMore] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [statusToken, setStatusToken] = useState<string | null>(null);
  const [serverMsg, setServerMsg] = useState("");
  const [started, setStarted] = useState(false);
  const key = useRef("");
  const summaryRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    key.current = newIdempotencyKey();
    const apply = () => {
      const h = readHandoff();
      const has = Boolean(h.state || h.address || h.estimateId || h.preferredDate);
      setV((p) => ({
        ...p,
        address: h.address || p.address, city: h.city || p.city, state: h.state || p.state, zip: h.zip || p.zip,
        propertyType: h.propertyType || p.propertyType, condition: h.condition || p.condition, occupancy: h.occupancy || p.occupancy,
        sqft: h.sqft || p.sqft, ownerArv: h.arv || p.ownerArv, ownerRepairs: h.repairs || p.ownerRepairs,
        timeline: h.timeline || p.timeline, preferredDate: h.preferredDate || p.preferredDate, circumstances: h.circumstances || p.circumstances,
      }));
      if (h.estimateId) { setEstimateId(h.estimateId); setEstimateSummary(h.estimateSummary || ""); }
      try {
        const draft = sessionStorage.getItem("primed.noteDraft");
        if (draft) { setV((p) => (p.notes ? p : { ...p, notes: draft })); sessionStorage.removeItem("primed.noteDraft"); }
      } catch {}
      if (has) { setCarried(true); if (h.propertyType || h.condition || h.preferredDate) setMore(true); }
    };
    apply();
    // A state abbreviation in the URL (e.g. from the service-area map) is non-personal and safe to read.
    try {
      const qs = new URLSearchParams(window.location.search).get("state")?.toUpperCase();
      if (qs && stateList.some((s) => s.abbr === qs)) setV((p) => (p.state ? p : { ...p, state: qs }));
    } catch {}
    window.addEventListener(HANDOFF_EVENT, apply);
    return () => window.removeEventListener(HANDOFF_EVENT, apply);
  }, []);

  const set = (k: keyof typeof v) => (val: string | boolean) => {
    if (!started) { setStarted(true); track("seller_form_start", { form: formId }); }
    setV((p) => ({ ...p, [k]: val }));
    if (errors[k]) setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  const ids = (k: string) => `${formId}-${k}`;
  const fieldIds = Object.fromEntries(["name", "email", "phone", "state", "zip", "deadline", "preferredDate"].map((k) => [k, ids(k)]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "saving") return;
    const errs: Record<string, string> = {};
    if (!v.name.trim()) errs.name = "Please tell us your name.";
    if (!v.state) errs.state = "Choose the property's state.";
    if (v.zip && !/^\d{5}$/.test(v.zip)) errs.zip = "Enter a 5-digit ZIP code or leave it blank.";
    if (v.preferredContact === "email" && !/^\S+@\S+\.\S+$/.test(v.email)) errs.email = "Add a valid email address so we can reply by email.";
    if (v.preferredContact !== "email" && v.phone.replace(/\D/g, "").length < 10) errs.phone = "Add a 10-digit phone number so we can call or text.";
    if (Object.keys(errs).length) { setErrors(errs); requestAnimationFrame(() => summaryRef.current?.focus()); return; }
    setErrors({});
    setStatus("saving");
    const type: InquiryType = inquiryType === "time_sensitive" || v.deadline ? "time_sensitive" : estimateId ? "reviewed_offer" : inquiryType;
    try {
      const res = await fetch("/api/leads/seller", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: key.current, inquiryType: type, name: v.name, email: v.email, phone: v.phone, preferredContact: v.preferredContact,
          address: v.address, city: v.city, state: v.state, zip: v.zip, propertyType: v.propertyType || undefined, condition: v.condition || undefined,
          occupancy: v.occupancy || undefined, timeline: v.timeline || undefined, preferredDate: v.preferredDate, deadline: v.deadline,
          circumstances: v.circumstances, sqft: v.sqft || undefined, ownerArv: v.ownerArv, ownerRepairs: v.ownerRepairs, notes: v.notes,
          estimateId, sourcePage: window.location.pathname, utm: readAttribution(),
          consent: { marketingEmail: v.marketingEmail, marketingSms: v.marketingSms }, company: v.company,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 422 && data.errors) { setErrors(data.errors); setStatus("idle"); requestAnimationFrame(() => summaryRef.current?.focus()); return; }
      if (!res.ok || !data.ok) throw new Error(data.message || "Your request was not saved.");
      setStatusToken(typeof data.statusToken === "string" ? data.statusToken : null);
      setStatus("saved");
      track(inquiryType === "location_check" ? "eligibility_inquiry_submitted" : "seller_inquiry_submitted", { inquiry_type: type, state: v.state, form: formId }, key.current);
      requestAnimationFrame(() => doneRef.current?.focus());
    } catch (err) {
      setServerMsg((err as Error).message);
      setStatus("error");
    }
  };

  if (status === "saved")
    return (
      <div ref={doneRef} tabIndex={-1} role="status" className="rounded-2xl border border-ok bg-ok-soft p-6 text-fg outline-none sm:p-8">
        <p className="font-display text-[1.4rem] font-bold">Thank you. Your request was received.</p>
        <p className="mt-2">We saved your details. Here is what happens next:</p>
        <ol className="mt-3 list-decimal space-y-1 pl-5">
          <li>We review the property, its location and whether a transaction may fit.</li>
          <li>We contact you by your preferred method with questions or to arrange a look at the property.</li>
          <li>If it is a fit, we explain any proposed written terms. You decide whether to move forward.</li>
        </ol>
        {statusToken && <StatusLink token={statusToken} />}
        {v.deadline && <p className="mt-3 text-[0.95rem]">Because you shared a deadline, your request is flagged for priority review. Please also stay in contact with your lender or a housing counselor; an inquiry does not pause any legal deadline.</p>}
      </div>
    );

  const disclosure = v.state ? cfg.stateDisclosures[v.state] : "";

  return (
    <form onSubmit={submit} noValidate className="rounded-2xl border border-line bg-surface p-5 text-fg shadow-[0_30px_60px_-45px_rgba(8,9,11,.5)] sm:p-8" aria-label="Property review request">
      <ErrorSummary ref={summaryRef} errors={errors} fieldIds={fieldIds} />
      <Honeypot value={v.company} onChange={(x) => set("company")(x)} />
      {carried && (
        <p className="mb-5 rounded-xl bg-surface-3 px-4 py-3 text-[0.95rem]">
          We carried over the details you already entered{estimateSummary ? ` (preliminary range: ${estimateSummary})` : ""}. Check them below and add anything we missed.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField id={ids("name")} className="sm:col-span-2" label="Your name" required autoComplete="name" value={v.name} error={errors.name} onChange={(e) => set("name")(e.target.value)} />
        <div className="sm:col-span-2">
          <RadioGroup legend="How should we contact you?" name={ids("method")} required columns={3} value={v.preferredContact} onChange={(x) => set("preferredContact")(x)} options={CONTACT_METHODS} />
        </div>
        <TextField id={ids("email")} label="Email" type="email" autoComplete="email" required={v.preferredContact === "email"} optional={v.preferredContact !== "email"} value={v.email} error={errors.email} onChange={(e) => set("email")(e.target.value)} />
        <TextField id={ids("phone")} label="Phone" type="tel" autoComplete="tel" required={v.preferredContact !== "email"} optional={v.preferredContact === "email"} value={v.phone} error={errors.phone} onChange={(e) => set("phone")(e.target.value)} />
        <TextField className="sm:col-span-2" label="Property street address" optional autoComplete="street-address" value={v.address} onChange={(e) => set("address")(e.target.value)} />
        <TextField label="City" optional autoComplete="address-level2" value={v.city} onChange={(e) => set("city")(e.target.value)} />
        <div className="grid grid-cols-[1.4fr_1fr] gap-3">
          <SelectField id={ids("state")} label="State" required options={stateList.map((s) => ({ value: s.abbr, label: s.name }))} value={v.state} error={errors.state} onChange={(e) => set("state")(e.target.value)} />
          <TextField id={ids("zip")} label="ZIP" optional inputMode="numeric" maxLength={5} autoComplete="postal-code" value={v.zip} error={errors.zip} onChange={(e) => set("zip")(e.target.value.replace(/\D/g, ""))} />
        </div>
        {showDeadline && (
          <TextField id={ids("deadline")} className="sm:col-span-2" type="date" label="Any deadline we should know about?" optional value={v.deadline} onChange={(e) => set("deadline")(e.target.value)}
            hint="For example, a scheduled sale date on a notice you received. Sharing it flags your request for priority review; it does not change any legal deadline." />
        )}
        {showPreferredDate && (
          <TextField id={ids("preferredDate")} className="sm:col-span-2" type="date" label="Preferred closing or move date" optional value={v.preferredDate} onChange={(e) => set("preferredDate")(e.target.value)}
            hint="A preference helps us plan. It is not a commitment from either side." />
        )}
      </div>

      <div className="mt-5">
        <button type="button" className="btn btn-ghost !px-0 !whitespace-normal text-left text-[0.98rem] font-semibold" aria-expanded={more} aria-controls={ids("more")} onClick={() => setMore((m) => !m)}>
          {more ? "Hide property details" : "Add property details (optional, helps us review faster)"}
        </button>
      </div>
      {more && (
        <div id={ids("more")} className="mt-3 grid gap-4 sm:grid-cols-2">
          <SelectField label="Property type" optional options={PROPERTY_TYPES} value={v.propertyType} onChange={(e) => set("propertyType")(e.target.value)} />
          <SelectField label="Condition" optional options={CONDITIONS} value={v.condition} onChange={(e) => set("condition")(e.target.value)} />
          <SelectField label="Occupancy" optional options={OCCUPANCY} value={v.occupancy} onChange={(e) => set("occupancy")(e.target.value)}
            hint={showOccupancyNote ? "Please don't include tenant names or lease documents here. We discuss records later if needed." : undefined} />
          <SelectField label="Preferred timeline" optional options={TIMELINES} value={v.timeline} onChange={(e) => set("timeline")(e.target.value)} />
          <TextField label="Approximate size (sq ft)" optional inputMode="numeric" value={v.sqft} onChange={(e) => set("sqft")(e.target.value.replace(/\D/g, ""))} />
          <TextField label="Your estimated after-repair value" optional inputMode="decimal" value={v.ownerArv} onChange={(e) => set("ownerArv")(e.target.value)} />
        </div>
      )}
      <TextArea className="mt-4" label="What would you like us to know?" optional rows={4} value={v.notes} onChange={(e) => set("notes")(e.target.value)}
        hint="Goals, timing, repairs, co-owners, access. Please don't include account numbers, Social Security numbers or ID documents." />
      <MarketingChoices email={v.marketingEmail} sms={v.marketingSms} onEmail={(x) => set("marketingEmail")(x)} onSms={(x) => set("marketingSms")(x)} />
      {disclosure && <p className="mt-4 rounded-xl border border-line bg-surface-2 p-4 text-[0.9rem]">{disclosure}</p>}
      {status === "error" && (
        <div role="alert" className="mt-4 rounded-xl border border-err bg-err-soft p-4">
          <p className="font-semibold">Your request was not saved.</p>
          <p className="text-[0.95rem]">{serverMsg} Your entries are still here; please try again in a moment.</p>
        </div>
      )}
      <div className="mt-6">
        <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={status === "saving"}>{status === "saving" ? "Sending…" : submitLabel}</button>
      </div>
      <p className="mt-3 text-[0.85rem] text-fg-muted">
        A request is not a contract and does not obligate you. We use your details to respond, as described in our <a className="inline-link" href="/privacy">privacy policy</a>.
      </p>
    </form>
  );
}
