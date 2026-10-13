"use client";

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

type Base = { label: string; hint?: ReactNode; error?: string; required?: boolean; optional?: boolean };

function Label({ id, label, required, optional }: { id: string; label: string; required?: boolean; optional?: boolean }) {
  return (
    <label htmlFor={id} className="field-label">
      {label}
      {required && <span className="ml-1 text-err" aria-hidden>*</span>}
      {required && <span className="sr-only"> (required)</span>}
      {optional && <span className="ml-1.5 text-[0.85rem] font-normal text-fg-muted">(optional)</span>}
    </label>
  );
}

export const TextField = forwardRef<HTMLInputElement, Base & InputHTMLAttributes<HTMLInputElement>>(function TextField(
  { label, hint, error, required, optional, id, className = "", ...rest },
  ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  const hintId = hint ? `${fid}-hint` : undefined;
  const errId = error ? `${fid}-err` : undefined;
  return (
    <div className={className}>
      <Label id={fid} label={label} required={required} optional={optional} />
      <input ref={ref} id={fid} className="field" aria-invalid={error ? true : undefined} aria-required={required || undefined}
        aria-describedby={[hintId, errId].filter(Boolean).join(" ") || undefined} {...rest} />
      {hint && <p id={hintId} className="field-hint">{hint}</p>}
      {error && <p id={errId} className="field-error">{error}</p>}
    </div>
  );
});

export function SelectField({ label, hint, error, required, optional, id, options, placeholder = "Choose one", className = "", ...rest }:
  Base & SelectHTMLAttributes<HTMLSelectElement> & { options: readonly { value: string; label: string }[]; placeholder?: string }) {
  const auto = useId();
  const fid = id ?? auto;
  const hintId = hint ? `${fid}-hint` : undefined;
  const errId = error ? `${fid}-err` : undefined;
  return (
    <div className={className}>
      <Label id={fid} label={label} required={required} optional={optional} />
      <select id={fid} className="field" aria-invalid={error ? true : undefined} aria-required={required || undefined}
        aria-describedby={[hintId, errId].filter(Boolean).join(" ") || undefined} {...rest}>
        <option value="">{placeholder}</option>
        {options.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
      </select>
      {hint && <p id={hintId} className="field-hint">{hint}</p>}
      {error && <p id={errId} className="field-error">{error}</p>}
    </div>
  );
}

export function TextArea({ label, hint, error, required, optional, id, className = "", ...rest }: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const auto = useId();
  const fid = id ?? auto;
  const hintId = hint ? `${fid}-hint` : undefined;
  const errId = error ? `${fid}-err` : undefined;
  return (
    <div className={className}>
      <Label id={fid} label={label} required={required} optional={optional} />
      <textarea id={fid} className="field" aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errId].filter(Boolean).join(" ") || undefined} {...rest} />
      {hint && <p id={hintId} className="field-hint">{hint}</p>}
      {error && <p id={errId} className="field-error">{error}</p>}
    </div>
  );
}

export function RadioGroup({ legend, name, options, value, onChange, error, hint, required, columns = 1 }: {
  legend: string; name: string; options: readonly { value: string; label: string }[]; value: string; onChange: (v: string) => void;
  error?: string; hint?: string; required?: boolean; columns?: 1 | 2 | 3;
}) {
  const id = useId();
  return (
    <fieldset aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}>
      <legend className="field-label">
        {legend}
        {required && <span className="ml-1 text-err" aria-hidden>*</span>}
      </legend>
      {hint && <p id={`${id}-hint`} className="field-hint mb-2 !mt-0">{hint}</p>}
      <div className={`grid gap-2 ${columns === 2 ? "sm:grid-cols-2" : columns === 3 ? "sm:grid-cols-3" : ""}`}>
        {options.map((o) => (
          <label key={o.value} className="choice">
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      {error && <p id={`${id}-err`} className="field-error">{error}</p>}
    </fieldset>
  );
}

export function CheckboxGroup({ legend, options, values, onChange, error, columns = 2 }: {
  legend: string; options: readonly { value: string; label: string }[]; values: string[]; onChange: (v: string[]) => void; error?: string; columns?: 1 | 2 | 3;
}) {
  const id = useId();
  return (
    <fieldset aria-describedby={error ? `${id}-err` : undefined}>
      <legend className="field-label">{legend}</legend>
      <div className={`grid gap-2 ${columns === 2 ? "sm:grid-cols-2" : columns === 3 ? "sm:grid-cols-3" : ""}`}>
        {options.map((o) => (
          <label key={o.value} className="choice">
            <input type="checkbox" checked={values.includes(o.value)}
              onChange={(e) => onChange(e.target.checked ? [...values, o.value] : values.filter((v) => v !== o.value))} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      {error && <p id={`${id}-err`} className="field-error">{error}</p>}
    </fieldset>
  );
}

/** Lists all errors at the top of a form and links to each field. Receives focus after a failed submit. */
export const ErrorSummary = forwardRef<HTMLDivElement, { errors: Record<string, string>; fieldIds: Record<string, string> }>(function ErrorSummary({ errors, fieldIds }, ref) {
  const entries = Object.entries(errors);
  if (!entries.length) return null;
  return (
    <div ref={ref} tabIndex={-1} role="alert" className="mb-6 rounded-xl border-2 border-err bg-err-soft p-4 text-fg">
      <h3 className="font-semibold">Please fix {entries.length === 1 ? "this item" : `these ${entries.length} items`}:</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {entries.map(([k, msg]) => (
          <li key={k}>{fieldIds[k] ? <a className="inline-link" href={`#${fieldIds[k]}`}>{msg}</a> : msg}</li>
        ))}
      </ul>
    </div>
  );
});

export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>Company website (leave blank)<input tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} name="company" /></label>
    </div>
  );
}

export const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** Parses user-entered dollar text. Returns null for blank, NaN for invalid. */
export function parseMoney(v: string): number | null {
  const t = v.replace(/[$,\s]/g, "");
  if (!t) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return NaN;
  return Number(t);
}
