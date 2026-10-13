import Link from "next/link";
import type { PageContent, Section } from "@/content/types";
import { Hero, Prose, ListBlock, Cards, Steps, Comparison, FaqBlock, CtaBand, Toc, Shell, SectionHeading } from "./sections";
import { inline } from "./RichText";
import { JsonLd } from "./JsonLd";
import { siteUrl } from "@/content/site";
import dynamic from "next/dynamic";
import { USMapSection } from "./USMapSection";
import { TeamSection } from "./TeamSection";
import { Logo } from "./Logo";
import { getSettings } from "@/lib/settings";

// Interactive tools are split into separate chunks so each page only loads the ones it uses.
// They still render on the server first (no layout shift, content visible without waiting).
const Calculator = dynamic(() => import("./Calculator").then((m) => m.Calculator));
const SellerForm = dynamic(() => import("./SellerForm").then((m) => m.SellerForm));
const InvestorForm = dynamic(() => import("./InvestorForm").then((m) => m.InvestorForm));
const NetProceeds = dynamic(() => import("./NetProceeds").then((m) => m.NetProceeds));
const RepairGuideStandalone = dynamic(() => import("./RepairGuide").then((m) => m.RepairGuideStandalone));
const TimelinePlanner = dynamic(() => import("./TimelinePlanner").then((m) => m.TimelinePlanner));
const SituationFinder = dynamic(() => import("./SituationFinder").then((m) => m.SituationFinder));
const OfferCompare = dynamic(() => import("./OfferCompare").then((m) => m.OfferCompare));
import { ContactDetails } from "./ContactDetails";

/** Default hero background per page. Override per page with `image` in the hero's content (admin → Page content). */
const HERO_IMAGES: Record<string, string> = {
  "/": "bg-roofline", "/how-it-works": "bg-roofline", "/sell-house-needing-repairs": "bg-roofline",
  "/about": "bg-skyline", "/investors": "bg-skyline", "/sell-rental-property": "bg-skyline",
  "/service-areas": "bg-topo", "/service-areas/washington": "bg-topo", "/sell-house-relocation": "bg-topo",
  "/resources": "bg-silk", "/cash-offer-calculator": "bg-silk", "/contact": "bg-silk",
  "/sell-your-house-for-cash": "bg-brushed", "/sell-inherited-property": "bg-brushed", "/sell-before-foreclosure": "bg-brushed",
};
export const heroImageFor = (path: string) => `/images/${HERO_IMAGES[path] ?? "bg-brushed"}.webp`;

function Breadcrumbs({ page }: { page: PageContent }) {
  if (page.path === "/") return null;
  const items = [{ label: "Home", href: "/" }, ...(page.parent ? [page.parent] : []), { label: page.breadcrumb, href: page.path }];
  const url = siteUrl();
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-8 text-[0.88rem]">
        <ol className="flex flex-wrap items-center gap-1.5 text-fg-muted">
          {items.map((it, i) => (
            <li key={it.href} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden>/</span>}
              {i === items.length - 1 ? <span aria-current="page" className="text-fg">{it.label}</span> : <Link href={it.href} className="hover:underline">{it.label}</Link>}
            </li>
          ))}
        </ol>
      </nav>
      {url && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.label, item: `${url}${it.href === "/" ? "" : it.href}` })),
          }}
        />
      )}
    </>
  );
}

function ComponentSection({ s }: { s: Extract<Section, { type: "component" }> }) {
  const p = s.props ?? {};
  const str = (k: string) => (typeof p[k] === "string" ? (p[k] as string) : undefined);
  let el: React.ReactNode = null;
  switch (s.name) {
    case "calculator":
      el = <Calculator compact={p.compact === true} />;
      break;
    case "map":
      return <USMapSection heading={s.heading} intro={s.intro} eyebrow={s.eyebrow} tone={s.tone ?? "pale"} id={s.id} after={s.after} />;
    case "sellerForm":
      el = (
        <SellerForm
          inquiryType={(str("inquiryType") as never) ?? "property_review"}
          submitLabel={str("submitLabel") ?? "Request My Property Review"}
          defaultState={str("state")}
          showDeadline={p.showDeadline === true}
          showPreferredDate={p.showPreferredDate === true}
          showOccupancyNote={p.showOccupancyNote === true}
          formId={str("formId") ?? s.id ?? "seller"}
        />
      );
      break;
    case "investorForm":
      el = <InvestorForm />;
      break;
    case "netProceeds":
      el = <NetProceeds />;
      break;
    case "repairGuide":
      el = <RepairGuideStandalone />;
      break;
    case "timelinePlanner":
      el = <TimelinePlanner />;
      break;
    case "team":
      return <TeamSection heading={s.heading} />;
    case "situationFinder":
      el = <SituationFinder />;
      break;
    case "offerCompare":
      el = <OfferCompare />;
      break;
    case "contactDetails":
      el = <ContactDetails />;
      break;
    case "investorEmpty":
      el = (
        <div className="card p-8 text-fg">
          <h3 className="text-[1.25rem] font-bold">No opportunities are posted publicly right now</h3>
          <p className="mt-2 text-fg-muted">
            We do not publish a public inventory list. When a property under contract fits the criteria you submit, we contact you directly with
            the details we are permitted to share, so you can do your own due diligence.
          </p>
        </div>
      );
      break;
  }
  return (
    <Shell tone={s.tone ?? "light"} id={s.id}>
      <SectionHeading eyebrow={s.eyebrow} heading={s.heading} intro={s.intro} />
      {el}
      {s.after && <p className="mt-6 max-w-3xl text-[0.95rem] muted">{inline(s.after)}</p>}
    </Shell>
  );
}

/**
 * Every section sits on pure black with its own subtle silver design behind it, so no two
 * neighbouring sections look the same. Designs live in globals.css (.sec-bg-*).
 */
const SECTION_DESIGNS = ["arcs", "topo", "pinstripe", "beams", "brushed", "grid", "skyline", "silk"] as const;
const DESIGN_FOR_COMPONENT: Record<string, string> = { map: "topo", situationFinder: "beams", calculator: "arcs", offerCompare: "pinstripe", netProceeds: "grid" };

export function PageRenderer({ page }: { page: PageContent }) {
  const settings = getSettings();
  // The home hero shows the full logo large, directly on the black page.
  const heroLogo =
    page.path === "/" ? (
      <div className="logo-stage mb-8" style={{ ["--logo-mask" as string]: `url(${settings.logoPath})` }}>
        <Logo src={settings.logoPath} alt={settings.logoAlt} height={150} href={null} priority />
      </div>
    ) : undefined;
  let n = 0;
  let prev = "";
  return (
    <>
      {page.sections.map((s, i) => {
        if (s.type === "hero") return <Hero key={i} s={s} logo={heroLogo} image={heroImageFor(page.path)} breadcrumbs={<Breadcrumbs page={page} />} />;
        let design: string = (s.type === "component" && DESIGN_FOR_COMPONENT[s.name]) || SECTION_DESIGNS[n++ % SECTION_DESIGNS.length];
        if (design === prev) design = SECTION_DESIGNS[n++ % SECTION_DESIGNS.length];
        prev = design;
        return (
          <div key={i} className="sec-wrap">
            <div aria-hidden className={`sec-bg sec-bg-${design}`} />
            {renderSection(s)}
          </div>
        );
      })}
    </>
  );
}

function renderSection(s: Section) {
  switch (s.type) {
    case "prose":
      return <Prose s={s} />;
    case "list":
      return <ListBlock s={s} />;
    case "cards":
      return <Cards s={s} />;
    case "steps":
      return <Steps s={s} />;
    case "comparison":
      return <Comparison s={s} />;
    case "faq":
      return <FaqBlock s={s} />;
    case "cta":
      return <CtaBand s={s} />;
    case "toc":
      return <Toc s={s} />;
    case "component":
      return <ComponentSection s={s} />;
    default:
      return null;
  }
}
