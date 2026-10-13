"use client";

import { useActionState } from "react";
import { login, type ActionState } from "../actions";

export default function Login() {
  const [state, action, pending] = useActionState<ActionState, FormData>(login, {});
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-[1.8rem] font-bold">Owner sign in</h1>
      <p className="mt-2 text-fg-muted">This area is for the Primed Real Estate owner only.</p>
      <form action={action} className="card mt-6 p-6">
        <label htmlFor="pw" className="field-label">Password</label>
        <input id="pw" name="password" type="password" autoComplete="current-password" required className="field" aria-describedby={state.message ? "pw-err" : undefined} />
        {state.message && <p id="pw-err" role="alert" className="field-error">{state.message}</p>}
        <div className="mt-5"><button className="btn btn-primary w-full" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button></div>
      </form>
    </div>
  );
}
