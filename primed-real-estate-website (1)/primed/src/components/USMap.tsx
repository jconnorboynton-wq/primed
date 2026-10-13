"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import MAP from "@/data/us-map.json";
import { writeHandoff } from "@/lib/handoff";
import { track } from "@/lib/analytics";

export interface MapState {
  abbr: string;
  name: string;
  isHome: boolean;
  status: "approved" | "manual_review" | "not_available";
  estimatesEnabled: boolean;
  note: string;
  pageHref: string | null;
}

const SMALL = ["DC", "DE", "RI", "CT", "NJ", "MD", "MA", "NH", "VT"];
const map = MAP as { width: number; height: number; states: { abbr: string; name: string; d: string; cx: number; cy: number }[]; borders: string };

function statusText(s: MapState) {
  switch (s.status) {
    case "approved":
      return "Transactions in this state are supported, subject to a review of each property.";
    case "not_available":
      return "We are not currently completing transactions here. You can still send an inquiry, and we will tell you plainly whether we can help.";
    default:
      return "Inquiries are welcome. Transaction eligibility for this state is reviewed case by case before any offer is discussed.";
  }
}

export function USMap({ states }: { states: MapState[] }) {
  const byAbbr = useMemo(() => Object.fromEntries(states.map((s) => [s.abbr, s])), [states]);
  const order = useMemo(() => [...states].sort((a, b) => a.name.localeCompare(b.name)).map((s) => s.abbr), [states]);
  const [selected, setSelected] = useState<string | null>(null);
  const [focusAbbr, setFocusAbbr] = useState<string>("WA");
  const [query, setQuery] = useState("");
  const [zip, setZip] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const choose = (abbr: string, moveFocus = false) => {
    setSelected(abbr);
    setFocusAbbr(abbr);
    track("state_selected", { state: abbr });
    if (moveFocus) requestAnimationFrame(() => panelRef.current?.focus());
  };

  const onKey = (e: React.KeyboardEvent, abbr: string) => {
    const i = order.indexOf(abbr);
    let next: string | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = order[(i + 1) % order.length];
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = order[(i - 1 + order.length) % order.length];
    if (e.key === "Home") next = order[0];
    if (e.key === "End") next = order[order.length - 1];
    if (next) {
      e.preventDefault();
      setFocusAbbr(next);
      svgRef.current?.querySelector<SVGPathElement>(`[data-abbr="${next}"]`)?.focus();
    }
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(abbr, true); }
  };

  const filtered = query.trim() ? states.filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase()) || s.abbr.toLowerCase() === query.trim().toLowerCase()) : [];
  const sel = selected ? byAbbr[selected] : null;
  const dc = map.states.find((s) => s.abbr === "DC");

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="rounded-[22px] border border-line bg-gradient-to-b from-black to-black p-3 sm:p-5">
        <svg ref={svgRef} viewBox={`0 0 ${map.width} ${map.height}`} className="us-map h-auto w-full" role="group" aria-label="Map of the United States. Use arrow keys to move between states and Enter to select. A searchable list is also available.">
          <defs>
            <linearGradient id="homeFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#c9cdd3" />
              <stop offset="1" stopColor="#7d838c" />
            </linearGradient>
          </defs>
          {map.states.map((s) => {
            const st = byAbbr[s.abbr];
            const isHome = st?.isHome;
            return (
              <path
                key={s.abbr}
                data-abbr={s.abbr}
                d={s.d}
                className={`state ${isHome ? "is-home" : ""} ${selected === s.abbr ? "is-selected" : ""}`}
                role="button"
                tabIndex={focusAbbr === s.abbr ? 0 : -1}
                aria-label={`${s.name}${isHome ? ", our home base" : ""}${selected === s.abbr ? ", selected" : ""}`}
                aria-pressed={selected === s.abbr}
                onClick={() => choose(s.abbr)}
                onKeyDown={(e) => onKey(e, s.abbr)}
              />
            );
          })}
          <path d={map.borders} fill="none" stroke="#2a2d33" strokeWidth={0.5} pointerEvents="none" />
          {dc && (
            <g pointerEvents="none" aria-hidden>
              <circle cx={dc.cx} cy={dc.cy} r={4} fill="#08090b" stroke="#a4aab2" strokeWidth={1.2} />
            </g>
          )}
          {(() => {
            const wa = map.states.find((s) => s.abbr === "WA");
            return wa ? (
              <g pointerEvents="none" aria-hidden>
                <text x={wa.cx} y={wa.cy + 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="#050607" fontFamily="var(--font-montserrat)">WA</text>
              </g>
            ) : null;
          })()}
        </svg>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-[0.88rem] text-fg-2">
          <span className="flex items-center gap-2"><span aria-hidden className="inline-block h-3.5 w-3.5 rounded-sm metal-bg" />Washington: our home base</span>
          <span className="flex items-center gap-2"><span aria-hidden className="inline-block h-3.5 w-3.5 rounded-sm border border-white/30 bg-black" />All states: inquiries reviewed for eligibility</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 px-1">
          <span className="text-[0.85rem] font-semibold text-fg-2">Small states:</span>
          {SMALL.map((a) => (
            <button key={a} type="button" onClick={() => choose(a, true)} aria-pressed={selected === a}
              className={`min-h-9 rounded-md border px-2.5 text-[0.85rem] font-semibold ${selected === a ? "border-fg bg-fg text-ink" : "border-line-strong bg-surface text-fg hover:border-fg"}`}
              aria-label={byAbbr[a]?.name}>{a}</button>
          ))}
        </div>
        <p className="mt-2 px-1 text-[0.75rem] text-fg-muted">Boundaries: U.S. Census Bureau cartographic data via us-atlas (Alaska and Hawaii shown as insets; not to scale).</p>
      </div>

      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border border-line bg-surface p-5 text-fg">
          <label htmlFor="state-search" className="field-label">Find a state</label>
          <input id="state-search" className="field" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type a state name" autoComplete="off" aria-describedby="state-search-h" />
          <p id="state-search-h" className="field-hint">Or use the full list of states below the map.</p>
          {filtered.length > 0 && (
            <ul className="mt-2 max-h-56 overflow-auto rounded-lg border border-line" aria-label="Matching states">
              {filtered.slice(0, 12).map((s) => (
                <li key={s.abbr}><button type="button" className="flex min-h-11 w-full items-center px-3 text-left hover:bg-surface-3" onClick={() => { choose(s.abbr, true); setQuery(""); }}>{s.name}{s.isHome ? " (home base)" : ""}</button></li>
              ))}
            </ul>
          )}
          {query.trim() && filtered.length === 0 && <p className="mt-2 text-[0.92rem] text-fg-muted">No state matches “{query}”.</p>}
          <div className="mt-4 border-t border-line pt-4">
            <label htmlFor="zip-check" className="field-label">Property ZIP code</label>
            <input id="zip-check" className="field" inputMode="numeric" maxLength={5} value={zip} onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))} aria-describedby="zip-h" />
            <p id="zip-h" className="field-hint">We don't look up ZIP codes automatically. Choose the state on the map or in the list, and we will carry your ZIP into the inquiry.</p>
          </div>
        </div>

        <div ref={panelRef} tabIndex={-1} aria-live="polite" className="brushed-dark tone-dark rounded-2xl p-6 outline-none">
          {sel ? (
            <>
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-fg-muted">{sel.isHome ? "Our home base" : "Selected state"}</p>
              <h3 className="mt-1 text-[1.6rem] font-bold">{sel.name}</h3>
              <p className="mt-3 text-fg-2">{statusText(sel)}</p>
              <p className="mt-2 text-[0.92rem] text-fg-muted">{sel.estimatesEnabled ? "Online preliminary estimates are available for this state." : "Online estimates aren't enabled for this state yet; we review properties here personally."}</p>
              {sel.note && <p className="mt-2 text-[0.92rem] text-fg-2">{sel.note}</p>}
              <div className="mt-5 flex flex-col gap-2">
                <Link href={`/contact?state=${sel.abbr}#request`} className="btn btn-primary" onClick={() => { writeHandoff({ state: sel.abbr, zip: zip || undefined, source: "service_area_map" }); track("cta_click", { cta_id: "map_check_property", state: sel.abbr }); }}>
                  Check my {sel.name} property
                </Link>
                {sel.pageHref && <Link href={sel.pageHref} className="btn btn-secondary">Read about selling in {sel.name}</Link>}
                <Link href="/cash-offer-calculator" className="btn btn-ghost text-silver-hi" onClick={() => writeHandoff({ state: sel.abbr, zip: zip || undefined, source: "service_area_map" })}>Try the cash offer calculator</Link>
              </div>
            </>
          ) : (
            <>
              <p className="text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-fg-muted">Choose a state</p>
              <h3 className="mt-1 text-[1.4rem] font-bold">Where is your property?</h3>
              <p className="mt-3 text-fg-2">Select a state on the map, search above, or pick from the list to see how we handle inquiries there.</p>
            </>
          )}
        </div>
      </div>

      <details className="lg:col-span-2 rounded-2xl border border-line bg-surface p-5 text-fg">
        <summary className="cursor-pointer font-semibold">All states and Washington, DC (text list)</summary>
        <ul className="mt-4 grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-5">
          {[...states].sort((a, b) => a.name.localeCompare(b.name)).map((s) => (
            <li key={s.abbr}>
              <button type="button" className="min-h-10 w-full rounded-md px-2 text-left hover:bg-surface-3" onClick={() => choose(s.abbr, true)}>
                {s.name}{s.isHome ? " — home base" : ""}
              </button>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
