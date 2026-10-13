"use client";

import { useActionState } from "react";
import type { ActionState } from "@/app/admin/actions";

/** Wraps a server action form and shows its result accessibly. */
export function ActionForm({
  action,
  children,
  submitLabel = "Save",
  className = "",
  encType,
}: {
  action: (s: ActionState, f: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  submitLabel?: string;
  className?: string;
  encType?: "multipart/form-data";
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className={className} encType={encType}>
      {children}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button className="btn btn-primary !min-h-11" disabled={pending}>{pending ? "Saving…" : submitLabel}</button>
        <div role="status" aria-live="polite" className="text-[0.95rem]">
          {state.message && <p className={state.ok ? "font-semibold text-ok" : "font-semibold text-err"}>{state.message}</p>}
          {state.problems && (
            <ul className="mt-1 list-disc pl-5 text-err">
              {state.problems.map((p) => (<li key={p}>{p}</li>))}
            </ul>
          )}
        </div>
      </div>
    </form>
  );
}
