"use client";

import Link from "next/link";
import { useState } from "react";

/** Shown after a seller request is saved: a private link to follow the request's progress. */
export function StatusLink({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const href = `/status/${token}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(new URL(href, window.location.origin).toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="mt-5 rounded-xl border border-line-strong bg-black p-4">
      <p className="font-semibold">Follow your request</p>
      <p className="mt-1 text-[0.95rem] text-fg-2">
        This private link shows where your request stands (received, in review, offer, closing). It shows only the city and state, never your
        contact details. Bookmark it or copy it somewhere safe.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href={href} className="btn btn-primary !min-h-11">View request status</Link>
        <button type="button" onClick={copy} className="btn btn-secondary !min-h-11">{copied ? "Link copied" : "Copy link"}</button>
      </div>
      <p className="sr-only" role="status" aria-live="polite">{copied ? "Status link copied" : ""}</p>
    </div>
  );
}
