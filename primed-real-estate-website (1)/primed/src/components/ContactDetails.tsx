import { ContactLink } from "./ClientChrome";
import { getSettings } from "@/lib/settings";

/** Shows only contact methods the owner has actually configured. */
export function ContactDetails() {
  const s = getSettings();
  const items = [
    s.phone && { label: "Phone", node: <ContactLink method="phone" className="inline-link" href={`tel:${s.phone.replace(/[^\d+]/g, "")}`}>{s.phone}</ContactLink> },
    s.email && { label: "Email", node: <ContactLink method="email" className="inline-link" href={`mailto:${s.email}`}>{s.email}</ContactLink> },
    s.contactHours && { label: "Hours", node: <span>{s.contactHours}</span> },
    s.mailingAddress && { label: "Mailing address", node: <span className="whitespace-pre-line">{s.mailingAddress}</span> },
  ].filter(Boolean) as { label: string; node: React.ReactNode }[];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="card p-6 text-fg">
        <h3 className="font-display text-[1.15rem] font-bold">Selling a property?</h3>
        <p className="mt-2 text-fg-muted">Use the property form on this page. It reaches us directly and keeps your details together for review.</p>
        <a href="#request" className="mt-3 inline-block font-semibold underline underline-offset-4">Go to the property form</a>
      </div>
      <div className="card p-6 text-fg">
        <h3 className="font-display text-[1.15rem] font-bold">Buying as an investor?</h3>
        <p className="mt-2 text-fg-muted">Investors use a separate intake so seller and buyer conversations stay separate.</p>
        <a href="/investors#buy-box" className="mt-3 inline-block font-semibold underline underline-offset-4">Submit your buying criteria</a>
      </div>
      {items.length > 0 && (
        <div className="card p-6 text-fg sm:col-span-2">
          <h3 className="font-display text-[1.15rem] font-bold">Other ways to reach us</h3>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            {items.map((i) => (<div key={i.label}><dt className="text-[0.88rem] font-semibold text-fg-muted">{i.label}</dt><dd>{i.node}</dd></div>))}
          </dl>
        </div>
      )}
    </div>
  );
}
