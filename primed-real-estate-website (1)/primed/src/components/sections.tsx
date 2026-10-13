import Link from "next/link";
import type { ReactNode } from "react";
import type { Section } from "@/content/types";
import { inline, Paragraphs } from "./RichText";
import { TrackedLink } from "./ClientChrome";
import dynamic from "next/dynamic";

const AddressStart = dynamic(() => import("./AddressStart").then((m) => m.AddressStart));

type Tone = "light" | "pale" | "dark";

export function Shell({ tone = "light", id, children, className = "", narrow = false, image }: { tone?: Tone; id?: string; children: ReactNode; className?: string; narrow?: boolean; image?: string }) {
  const bg = tone === "dark" ? "tone-dark" : tone === "pale" ? "tone-pale" : "tone-light";
  return (
    <section id={id} className={`${bg} ${image ? "relative overflow-hidden" : ""} ${className}`}>
      <PhotoBg src={image} />
      <div data-reveal className={`relative mx-auto px-4 py-16 sm:px-6 md:py-24 ${narrow ? "max-w-[880px]" : "max-w-[1240px]"}`}>{children}</div>
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 flex items-center gap-3 text-[0.76rem] font-semibold uppercase tracking-[0.24em] text-fg-2">
      <span aria-hidden className="h-px w-8 bg-gradient-to-r from-transparent to-[#cfd3d9]" />
      {children}
    </p>
  );
}

export function SectionHeading({ eyebrow, heading, intro, level = 2, center = false }: { eyebrow?: string; heading?: string; intro?: string; level?: 2 | 3; center?: boolean }) {
  if (!heading && !intro) return null;
  const H = level === 2 ? "h2" : "h3";
  return (
    <div className={`mb-10 max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      {heading && <H className="text-[1.9rem] font-bold sm:text-[2.6rem]">{heading}</H>}
      {intro && <p className="mt-4 text-[1.08rem] muted">{inline(intro)}</p>}
    </div>
  );
}

function Cta({ c, kind }: { c: { label: string; href: string; id?: string }; kind: "primary" | "secondary" }) {
  return (
    <TrackedLink href={c.href} ctaId={c.id || c.label.toLowerCase().replace(/\W+/g, "_")} className={`btn btn-${kind}`}>
      {c.label}
    </TrackedLink>
  );
}

const CheckIcon = () => (
  <svg aria-hidden viewBox="0 0 20 20" className="mt-1 h-4 w-4 flex-none"><circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeOpacity=".45" /><path d="M6 10.5l2.5 2.5L14 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
);

/** Full-bleed background image with a dark fade so text stays readable. */
export function PhotoBg({ src, kind = "band", position = "center" }: { src?: string; kind?: "hero" | "band"; position?: string }) {
  if (!src) return null;
  return (
    <>
      <div aria-hidden className="photo-bg" style={{ backgroundImage: `url(${src})`, backgroundPosition: position }} />
      <div aria-hidden className={kind === "hero" ? "photo-fade-hero" : "photo-fade-band"} />
    </>
  );
}

export function Hero({ s, breadcrumbs, logo, image }: { s: Extract<Section, { type: "hero" }>; breadcrumbs?: ReactNode; logo?: ReactNode; image?: string }) {
  const withWidget = s.widget === "addressStart";
  return (
    <section className="hero-glow tone-dark relative -mt-[76px] overflow-hidden pt-[76px]">
      <PhotoBg src={s.image ?? image} kind="hero" position="70% center" />
      <div aria-hidden className="grid-fade pointer-events-none absolute inset-0 opacity-50" />
      <div className="relative mx-auto max-w-[1240px] px-4 pb-16 pt-8 sm:px-6 md:pb-28 md:pt-14">
        {breadcrumbs}
        <div className={`grid items-center gap-12 ${withWidget ? "lg:grid-cols-[1.1fr_1fr]" : ""}`}>
          <div className="max-w-3xl">
            {logo}
            {s.eyebrow && (
              <p className="pill mb-6"><span aria-hidden className="pill-dot" />{s.eyebrow}</p>
            )}
            <h1 className="metal-text text-[2.5rem] font-extrabold leading-[1.03] sm:text-[3.5rem] lg:text-[4.1rem]">{s.heading}</h1>
            <p className="mt-6 max-w-2xl text-[1.12rem] text-fg-2 sm:text-[1.22rem]">{inline(s.intro)}</p>
            {(s.primary || s.secondary) && !withWidget && (
              <div className="mt-9 flex flex-wrap gap-3">
                {s.primary && <Cta c={s.primary} kind="primary" />}
                {s.secondary && <Cta c={s.secondary} kind="secondary" />}
              </div>
            )}
            {s.note && <p className="mt-5 max-w-2xl text-[0.92rem] muted">{inline(s.note)}</p>}
          </div>
          {withWidget && <AddressStart primaryLabel={s.primary?.label ?? "Estimate My Cash Offer"} secondary={s.secondary} />}
        </div>
      </div>
      <div aria-hidden className="silver-rule absolute inset-x-0 bottom-0 opacity-25" />
    </section>
  );
}

export function FaqBlock({ s }: { s: Extract<Section, { type: "faq" }> }) {
  return (
    <Shell tone={s.tone ?? "light"} id={s.id} narrow>
      <SectionHeading heading={s.heading} />
      <div className="space-y-10">
        {s.groups.map((g, gi) => (
          <div key={gi}>
            {g.title && <h3 className="mb-3 text-[1.15rem] font-semibold">{g.title}</h3>}
            <div className="divide-y divide-current/15 border-y border-current/15">
              {g.items.map((item, i) => (
                <details key={i} className="group py-1">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-[1.04rem] font-semibold [&::-webkit-details-marker]:hidden">
                    <span>{item.q}</span>
                    <span aria-hidden className="flex h-7 w-7 flex-none items-center justify-center rounded-full border border-current/30 text-lg leading-none transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <div className="pb-5 pr-10"><Paragraphs items={item.a.split("\n\n")} className="muted" /></div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Shell>
  );
}

export function Comparison({ s }: { s: Extract<Section, { type: "comparison" }> }) {
  return (
    <Shell tone={s.tone ?? "light"} id={s.id}>
      <SectionHeading heading={s.heading} intro={s.intro} />
      {/* Desktop/tablet: table. Mobile: stacked cards with the same information. */}
      <div className="table-scroll hidden md:block" tabIndex={0} role="region" aria-label={s.caption}>
        <table className="card w-full min-w-[640px] border-separate border-spacing-0 overflow-hidden text-left text-[0.98rem]">
          <caption className="sr-only">{s.caption}</caption>
          <thead>
            <tr>
              <th scope="col" className="w-[22%] border-b border-line px-6 py-5 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-fg-muted">{s.rowHeader ?? "Consideration"}</th>
              {s.columns.map((c, j) => (<th key={c} scope="col" className={`border-b border-line px-6 py-5 font-display text-[1.02rem] font-bold ${j === s.columns.length - 1 ? "bg-black" : ""}`}>{c}</th>))}
            </tr>
          </thead>
          <tbody>
            {s.rows.map((r, i) => (
              <tr key={i} className="transition-colors hover:bg-black">
                <th scope="row" className={`px-6 py-5 align-top font-semibold ${i ? "border-t border-line" : ""}`}>{r.label}</th>
                {r.values.map((v, j) => (<td key={j} className={`px-6 py-5 align-top text-fg-2 ${i ? "border-t border-line" : ""} ${j === r.values.length - 1 ? "bg-black" : ""}`}>{inline(v)}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-4 md:hidden">
        {s.rows.map((r, i) => (
          <div key={i} className="card p-5 text-fg">
            <h3 className="mb-3 text-[1.08rem] font-bold">{r.label}</h3>
            <dl className="space-y-3">
              {s.columns.map((c, ci) => (
                <div key={c}><dt className="text-sm font-semibold text-fg-muted">{c}</dt><dd>{inline(r.values[ci] ?? "")}</dd></div>
              ))}
            </dl>
          </div>
        ))}
      </div>
      {s.note && <p className="mt-5 max-w-3xl text-[0.92rem] muted">{inline(s.note)}</p>}
    </Shell>
  );
}

export function Steps({ s }: { s: Extract<Section, { type: "steps" }> }) {
  const dark = (s.tone ?? "light") === "dark";
  return (
    <Shell tone={s.tone ?? "light"} id={s.id}>
      <SectionHeading eyebrow={s.eyebrow} heading={s.heading} intro={s.intro} />
      <ol className={`grid gap-5 ${s.steps.length === 4 ? "md:grid-cols-2 lg:grid-cols-4" : s.steps.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-3"}`}>
        {s.steps.map((st, i) => (
          <li key={i} className={`${dark ? "card-dark" : "card"} relative p-6 pt-5`}>
            <span aria-hidden className="step-badge metal-bg mb-5">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="text-[1.15rem] font-bold"><span className="sr-only">Step {i + 1}: </span>{st.title}</h3>
            <p className="mt-2 muted">{inline(st.body)}</p>
            {st.who && <p className="mt-3 text-[0.85rem] font-semibold uppercase tracking-[0.1em] muted">{st.who}</p>}
          </li>
        ))}
      </ol>
      {s.outro && <p className="mt-8 max-w-3xl muted">{inline(s.outro)}</p>}
    </Shell>
  );
}

export function Cards({ s }: { s: Extract<Section, { type: "cards" }> }) {
  const dark = (s.tone ?? "light") === "dark";
  const cols = s.columns ?? 3;
  return (
    <Shell tone={s.tone ?? "light"} id={s.id}>
      <SectionHeading eyebrow={s.eyebrow} heading={s.heading} intro={s.intro} />
      <ul className={`grid gap-5 sm:grid-cols-2 ${cols === 3 ? "lg:grid-cols-3" : cols === 4 ? "lg:grid-cols-4" : ""}`}>
        {s.cards.map((c, i) => {
          const body = (
            <>
              <h3 className="text-[1.18rem] font-bold">{c.title}</h3>
              <p className="mt-2 muted">{inline(c.body)}</p>
              {c.href && <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[0.95rem] font-semibold text-fg">{c.linkLabel ?? "Learn more"}<span aria-hidden className="card-arrow">→</span></span>}
            </>
          );
          return (
            <li key={i} className="flex">
              {c.href && /^https?:\/\//.test(c.href) ? (
                <a href={c.href} target="_blank" rel="noopener noreferrer" className={`${dark ? "card-dark" : "card"} card-link flex w-full flex-col p-6`}>{body}<span className="sr-only"> (opens in a new tab)</span></a>
              ) : c.href ? (
                <Link href={c.href} className={`${dark ? "card-dark" : "card"} card-link flex w-full flex-col p-6`}>{body}</Link>
              ) : (
                <div className={`${dark ? "card-dark" : "card"} w-full p-6`}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </Shell>
  );
}

export function ListBlock({ s }: { s: Extract<Section, { type: "list" }> }) {
  const dark = (s.tone ?? "light") === "dark";
  const Tag = s.style === "numbered" ? "ol" : "ul";
  return (
    <Shell tone={s.tone ?? "light"} id={s.id}>
      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <SectionHeading heading={s.heading} intro={s.intro} />
        <div>
          <Tag className={`grid gap-3 ${s.columns === 2 ? "sm:grid-cols-2" : ""}`}>
            {s.items.map((it, i) => (
              <li key={i} className="flex gap-3 rounded-2xl border border-line bg-black p-4 text-[1rem] text-fg-2">
                {s.style === "check" && <CheckIcon />}
                {s.style === "numbered" && <span className="font-display font-bold">{i + 1}.</span>}
                {s.style === "question" && <span aria-hidden className="font-display font-bold">?</span>}
                {s.style === "bullet" && <span aria-hidden className="mt-2.5 h-1.5 w-1.5 flex-none rounded-full bg-current opacity-60" />}
                <span>{inline(it)}</span>
              </li>
            ))}
          </Tag>
          {s.outro && <p className="mt-6 muted">{inline(s.outro)}</p>}
        </div>
      </div>
    </Shell>
  );
}

export function Prose({ s }: { s: Extract<Section, { type: "prose" }> }) {
  const dark = (s.tone ?? "light") === "dark";
  return (
    <Shell tone={s.tone ?? "light"} id={s.id}>
      <div className={`grid gap-10 ${s.aside ? "lg:grid-cols-[1.5fr_1fr]" : ""}`}>
        <div className="max-w-3xl">
          {s.eyebrow && <Eyebrow>{s.eyebrow}</Eyebrow>}
          {s.heading && <h2 className="mb-6 text-[1.85rem] font-bold sm:text-[2.2rem]">{s.heading}</h2>}
          <Paragraphs items={s.paragraphs} className="text-[1.05rem]" />
        </div>
        {s.aside && (
          <aside className={`${dark ? "card-dark" : "card"} h-fit p-6`}>
            <h3 className="mb-3 text-[1.05rem] font-bold">{s.aside.title}</h3>
            <ul className="space-y-2.5">
              {s.aside.items.map((a, i) => (<li key={i} className="flex gap-2.5"><CheckIcon /><span>{inline(a)}</span></li>))}
            </ul>
          </aside>
        )}
      </div>
    </Shell>
  );
}

export function CtaBand({ s }: { s: Extract<Section, { type: "cta" }> }) {
  const tone = s.tone ?? "dark";
  return (
    <Shell tone={tone}>
      <div className="card relative overflow-hidden p-8 md:p-12">
        <div aria-hidden className="photo-bg opacity-70" style={{ backgroundImage: "url(/images/bg-silk.webp)", backgroundPosition: "60% 50%" }} />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.85),rgba(0,0,0,.45))]" />
        <div aria-hidden className="silver-rule absolute inset-x-10 top-0 opacity-50" />
        <div className="relative flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-[1.8rem] font-bold sm:text-[2.3rem]">{s.heading}</h2>
            <p className="mt-3 text-[1.05rem] muted">{inline(s.body)}</p>
            {s.note && <p className="mt-3 text-[0.9rem] muted">{inline(s.note)}</p>}
          </div>
          <div className="flex flex-wrap gap-3 md:flex-none">
            <Cta c={s.primary} kind="primary" />
            {s.secondary && <Cta c={s.secondary} kind="secondary" />}
          </div>
        </div>
      </div>
    </Shell>
  );
}

export function Toc({ s }: { s: Extract<Section, { type: "toc" }> }) {
  return (
    <Shell tone={s.tone ?? "pale"}>
      <SectionHeading heading={s.heading} />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {s.links.map((l) => (
          <li key={l.href} className="flex">
            <a href={l.href} className="card card-link flex w-full flex-col p-5">
              <span className="font-display text-[1.05rem] font-bold">{l.label}</span>
              {l.summary && <span className="mt-2 text-[0.95rem] text-fg-muted">{l.summary}</span>}
            </a>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
