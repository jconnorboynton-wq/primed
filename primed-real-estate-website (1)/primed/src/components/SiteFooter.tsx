import { ContactLink } from "./ClientChrome";
import Link from "next/link";
import { Logo } from "./Logo";
import { SELL_MENU } from "@/content/site";
import type { BusinessSettings } from "@/lib/settings";

export function SiteFooter({ s }: { s: BusinessSettings }) {
  const year = new Date().getFullYear();
  const socials = s.socials.filter((x) => /^https:\/\//.test(x.url) && x.label);
  return (
    <footer className="tone-dark hairline-top relative overflow-hidden bg-[linear-gradient(180deg,#050506,#0d0e11)]">
      <div aria-hidden className="photo-bg opacity-40" style={{ backgroundImage: "url(/images/bg-brushed.webp)", backgroundPosition: "center bottom" }} />
      <div className="relative mx-auto grid max-w-[1240px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Logo src={s.logoPath} alt={s.logoAlt} height={110} />
          <p className="mt-4 max-w-sm text-[0.95rem] text-fg">
            Based in Washington State. Reviewing property inquiries from owners across the United States.
          </p>
          {(s.phone || s.email || s.contactHours) && (
            <ul className="mt-4 space-y-1 text-[0.95rem]">
              {s.phone && <li><ContactLink method="phone" className="inline-link" href={`tel:${s.phone.replace(/[^\d+]/g, "")}`}>{s.phone}</ContactLink></li>}
              {s.email && <li><ContactLink method="email" className="inline-link" href={`mailto:${s.email}`}>{s.email}</ContactLink></li>}
              {s.contactHours && <li className="muted">{s.contactHours}</li>}
            </ul>
          )}
          {socials.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-3 text-sm">
              {socials.map((x) => (
                <li key={x.url}><a className="inline-link" href={x.url} rel="noopener noreferrer" target="_blank">{x.label}</a></li>
              ))}
            </ul>
          )}
        </div>
        <nav aria-label="Selling options">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-fg-muted">Sell your property</h2>
          <ul className="space-y-2 text-[0.95rem]">
            {SELL_MENU.map((l) => (<li key={l.href}><Link className="hover:underline" href={l.href}>{l.label}</Link></li>))}
          </ul>
        </nav>
        <nav aria-label="Tools and areas">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-fg-muted">Tools &amp; areas</h2>
          <ul className="space-y-2 text-[0.95rem]">
            <li><Link className="hover:underline" href="/cash-offer-calculator">Cash offer calculator</Link></li>
            <li><Link className="hover:underline" href="/resources#net-proceeds">Net proceeds comparison</Link></li>
            <li><Link className="hover:underline" href="/service-areas">Nationwide service areas</Link></li>
            <li><Link className="hover:underline" href="/service-areas/washington">Washington State</Link></li>
            <li><Link className="hover:underline" href="/resources">Seller resources</Link></li>
          </ul>
        </nav>
        <nav aria-label="Company">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-fg-muted">Company</h2>
          <ul className="space-y-2 text-[0.95rem]">
            <li><Link className="hover:underline" href="/about">About Primed</Link></li>
            <li><Link className="hover:underline" href="/investors">For investors</Link></li>
            <li><Link className="hover:underline" href="/contact">Contact &amp; request an offer</Link></li>
            <li><Link className="hover:underline" href="/disclosures">Transaction disclosures</Link></li>
            <li><Link className="hover:underline" href="/privacy">Privacy policy</Link></li>
            <li><Link className="hover:underline" href="/terms">Website terms</Link></li>
          </ul>
        </nav>
      </div>
      <div className="silver-rule relative mx-auto max-w-[1240px] opacity-40" />
      <div className="relative mx-auto max-w-[1240px] px-4 py-6 text-[0.85rem] text-fg-muted sm:px-6">
        <p className="max-w-4xl">{s.roleStatement}</p>
        <p className="mt-3">© {year} Primed Real Estate. Online estimates are not purchase offers.</p>
      </div>
    </footer>
  );
}
