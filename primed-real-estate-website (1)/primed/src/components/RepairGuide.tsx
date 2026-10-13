"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { parseMoney, usd } from "./ui";
import { writeHandoff } from "@/lib/handoff";
import { track } from "@/lib/analytics";

/**
 * Seller-driven repair planner. The seller types their own rough numbers (from quotes, past bills or
 * educated guesses). We never invent repair costs from condition labels.
 */
const AREAS = [
  { key: "roof", label: "Roof", hint: "Leaks, missing shingles, age" },
  { key: "foundation", label: "Foundation or structure", hint: "Cracks, settling, framing" },
  { key: "systems", label: "Plumbing, electrical, HVAC", hint: "Panels, water heater, furnace, leaks" },
  { key: "kitchen", label: "Kitchen", hint: "Cabinets, counters, appliances" },
  { key: "baths", label: "Bathrooms", hint: "Fixtures, tile, water damage" },
  { key: "flooring", label: "Flooring and paint", hint: "Interior surfaces" },
  { key: "exterior", label: "Exterior, siding, windows", hint: "Siding, decks, windows, doors" },
  { key: "cleanout", label: "Clean-out and debris", hint: "Belongings, junk removal" },
  { key: "other", label: "Other known issues", hint: "Mold, pests, permits, landscaping" },
];

export function RepairGuide({ onUse, useLabel = "Use this total" }: { onUse: (total: number) => void; useLabel?: string }) {
  const [vals, setVals] = useState<Record<string, string>>({});
  const parsed = useMemo(() => Object.fromEntries(AREAS.map((a) => [a.key, parseMoney(vals[a.key] ?? "")])), [vals]);
  const invalid = Object.entries(parsed).filter(([, v]) => v !== null && Number.isNaN(v)).map(([k]) => k);
  const total = Object.values(parsed).reduce<number>((s, v) => (typeof v === "number" && !Number.isNaN(v) ? s + v : s), 0);

  return (
    <div className="rounded-2xl border border-line bg-surface-2 p-5 text-fg">
      <p className="text-[0.95rem] text-fg-muted">
        Enter rough amounts for the items you know about. Leave the rest blank. These are your planning numbers, not professional quotes,
        and any written offer would depend on an in-person review.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {AREAS.map((a) => (
          <div key={a.key}>
            <label htmlFor={`rg-${a.key}`} className="field-label !mb-1 text-[0.92rem]">{a.label}</label>
            <div className="relative">
              <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted">$</span>
              <input id={`rg-${a.key}`} inputMode="decimal" className="field !pl-7" value={vals[a.key] ?? ""} placeholder="0"
                aria-describedby={`rg-${a.key}-h`} aria-invalid={invalid.includes(a.key) || undefined}
                onChange={(e) => setVals((v) => ({ ...v, [a.key]: e.target.value }))} />
            </div>
            <p id={`rg-${a.key}-h`} className="field-hint !mt-1">{invalid.includes(a.key) ? <span className="text-err">Enter a number, like 8500.</span> : a.hint}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <p aria-live="polite" className="text-[1.05rem]"><span className="text-fg-muted">Your planning total:</span> <strong>{usd(total)}</strong></p>
        <div className="">
          <button type="button" className="btn btn-primary" disabled={invalid.length > 0} onClick={() => onUse(total)}>{useLabel}</button>
        </div>
      </div>
    </div>
  );
}

export function RepairGuideStandalone() {
  const router = useRouter();
  return (
    <RepairGuide
      useLabel="Use this total in the calculator"
      onUse={(total) => {
        writeHandoff({ repairs: String(Math.round(total)), source: "repair_guide" });
        track("cta_click", { cta_id: "repair_guide_to_calculator" });
        router.push("/cash-offer-calculator#calculator");
      }}
    />
  );
}
