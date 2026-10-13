"use client";

import { useState } from "react";

export function CopyButton({ value, label, absolute = false }: { value: string; label: string; absolute?: boolean }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-secondary !min-h-10 !px-4 !text-[0.88rem]"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(absolute ? new URL(value, window.location.origin).toString() : value);
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch {
          /* clipboard unavailable */
        }
      }}
    >
      {done ? "Copied" : label}
      <span className="sr-only" aria-live="polite">{done ? " copied" : ""}</span>
    </button>
  );
}
