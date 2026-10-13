import Link from "next/link";
import { Fragment, type ReactNode } from "react";

/**
 * Renders the content model's safe inline markup: **bold** and [text](href).
 * Everything else is plain text (React escapes it). No HTML is ever injected.
 */
const TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g;

export function inline(text: string, keyPrefix = "t"): ReactNode[] {
  const parts = text.split(TOKEN).filter((p) => p !== "");
  return parts.map((p, i) => {
    const key = `${keyPrefix}-${i}`;
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={key}>{p.slice(2, -2)}</strong>;
    const m = p.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (m) {
      const [, label, href] = m;
      if (/^https?:\/\//.test(href))
        return (
          <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="inline-link">
            {label}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        );
      if (href.startsWith("/") || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:"))
        return (
          <Link key={key} href={href} className="inline-link">
            {label}
          </Link>
        );
      return <Fragment key={key}>{label}</Fragment>;
    }
    return <Fragment key={key}>{p}</Fragment>;
  });
}

export function Paragraphs({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <div className={`prose-primed ${className}`}>
      {items.map((t, i) => (
        <p key={i}>{inline(t, `p${i}`)}</p>
      ))}
    </div>
  );
}
