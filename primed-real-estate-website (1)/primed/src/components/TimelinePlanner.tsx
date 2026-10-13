"use client";

import { useState } from "react";
import { writeHandoff } from "@/lib/handoff";
import { track } from "@/lib/analytics";
import { RadioGroup, TextField } from "./ui";

const CIRCUMSTANCES = [
  { value: "job_move", label: "Moving for work" },
  { value: "already_moved", label: "Already moved away" },
  { value: "family_move", label: "Moving closer to family" },
  { value: "downsizing", label: "Downsizing" },
  { value: "other", label: "Something else" },
];
const FLEX = [
  { value: "firm", label: "That date matters a lot" },
  { value: "some", label: "A few weeks either way is fine" },
  { value: "open", label: "Flexible" },
];

/** Captures the owner's preferred timing. It shows planning milestones, never a promised closing date. */
export function TimelinePlanner() {
  const [date, setDate] = useState("");
  const [circ, setCirc] = useState("");
  const [flex, setFlex] = useState("");
  const [onsite, setOnsite] = useState("");
  const [saved, setSaved] = useState(false);

  const days = date ? Math.round((new Date(date + "T12:00:00").getTime() - Date.now()) / 86400000) : null;

  const save = () => {
    writeHandoff({ preferredDate: date || undefined, circumstances: circ || undefined, timeline: date ? "specific" : "flexible", source: "timeline_planner" });
    track("cta_click", { cta_id: "timeline_planner_save" });
    setSaved(true);
    document.getElementById("request")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="grid gap-6 rounded-[22px] border border-line bg-surface p-5 text-fg sm:p-8 lg:grid-cols-[1.1fr_1fr]">
      <div className="grid gap-5">
        <TextField type="date" label="Preferred closing or move date" optional value={date} onChange={(e) => { setDate(e.target.value); setSaved(false); }} hint="Leave blank if you're flexible." />
        <RadioGroup legend="What's prompting the move?" name="tp-circ" columns={2} value={circ} onChange={(v) => { setCirc(v); setSaved(false); }} options={CIRCUMSTANCES} />
        <RadioGroup legend="How firm is your date?" name="tp-flex" value={flex} onChange={(v) => { setFlex(v); setSaved(false); }} options={FLEX} />
        <RadioGroup legend="Can someone be at the property for a walkthrough?" name="tp-onsite" columns={3} value={onsite} onChange={(v) => { setOnsite(v); setSaved(false); }}
          options={[{ value: "me", label: "Yes, me" }, { value: "someone", label: "A trusted contact" }, { value: "no", label: "Not easily" }]} />
      </div>
      <div className="rounded-2xl bg-surface-3 p-5">
        <h3 className="font-display text-[1.15rem] font-bold">Your planning notes</h3>
        {days === null ? (
          <p className="mt-2 text-[0.95rem]">Add a preferred date to see a simple planning outline.</p>
        ) : days < 0 ? (
          <p className="mt-2 text-[0.95rem]">That date has already passed. Choose a future date or leave it blank.</p>
        ) : (
          <>
            <p className="mt-2 text-[0.95rem]">About <strong>{days} days</strong> from today. Things to line up before then:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[0.95rem]">
              <li>Gather your mortgage statement, HOA contacts and any recent repair records.</li>
              <li>Decide who can provide access for a walkthrough{onsite === "no" ? " — we can talk through options if no one is local" : ""}.</li>
              <li>Ask any title or escrow company how they handle signing for owners who live elsewhere; options vary.</li>
              <li>Plan for belongings and utilities, and leave room for title review, which can take longer than expected.</li>
            </ul>
            {days < 21 && <p className="mt-3 text-[0.92rem] text-warn">A short window can limit options. We'll tell you honestly whether it's realistic after we review the property and title.</p>}
          </>
        )}
        <p className="mt-4 text-[0.85rem] text-fg-muted">These are your preferences, not a commitment. Any closing date is set only in a signed agreement.</p>
        <div className="mt-4"><button type="button" className="btn btn-primary w-full" onClick={save}>Add this to my request</button></div>
        {saved && <p role="status" className="mt-2 text-[0.92rem] font-semibold text-ok">Added. Your preferred date and circumstances are filled in on the form below.</p>}
      </div>
    </div>
  );
}
