import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { getSettings, getAllStateConfigs } from "@/lib/settings";
import STATES from "@/data/states.json";
import { siteUrl, isProductionSite } from "@/content/site";

export function generateMetadata(): Metadata {
  const url = siteUrl();
  return {
    title: "Transaction & Estimate Disclosures | Primed Real Estate",
    description: "Primed Real Estate's role as a wholesaler, how contract assignment and compensation work, and how online estimates differ from written offers.",
    alternates: url ? { canonical: `${url}/disclosures` } : undefined,
    robots: isProductionSite() ? undefined : { index: false },
  };
}

export default function Disclosures() {
  const s = getSettings();
  const states = getAllStateConfigs();
  const names = Object.fromEntries((STATES as { abbr: string; name: string }[]).map((x) => [x.abbr, x.name]));
  const withDisclosure = Object.values(states).filter((c) => c.disclosure);
  return (
    <LegalPage crumb="Disclosures" title="Transaction and estimate disclosures" updated="October 12, 2026" intro="Plain-language information about our role, how we may be compensated and what our online estimates are and aren't.">
      <h2>Our role</h2>
      <p>{s.roleStatement}</p>
      <h2>Wholesaling and assignment</h2>
      <p>When we sign a purchase agreement with a seller, we are the buyer under that agreement. Depending on the transaction and the agreement's terms, we may:</p>
      <ul>
        <li>close on the property ourselves;</li>
        <li>assign our rights under the agreement to another buyer, who then completes the purchase, and receive an assignment fee from that buyer; or</li>
        <li>use another structure that we disclose in writing before you sign.</li>
      </ul>
      <p>An assignment doesn't change the price or terms in your agreement. Our compensation from an assignment is part of the difference between your contract price and what the end buyer pays. If you have questions about who will close, how your deposit is protected or what happens if a buyer doesn't perform, ask us before you sign.</p>
      <h2>No agency relationship</h2>
      <p>We don't act as your real estate agent or broker and don't owe you the duties an agent would. You're welcome to have an attorney or a licensed broker advise you.</p>
      <h2>Estimates are not offers</h2>
      <p>This is an estimate, not a purchase offer. Any written offer depends on property review, title, market conditions, transaction eligibility, and agreed terms. Online ranges are calculated from the inputs you provide and our current assumptions, may change, and are not appraisals or statistical confidence intervals.</p>
      <h2>State requirements</h2>
      <p>Rules for real estate transactions, including requirements that apply to wholesalers, differ by state. We accept inquiries from every state and confirm whether we can complete a transaction in a property's state before proposing terms. See <Link href="/service-areas">service areas</Link>.</p>
      {withDisclosure.length > 0 && (
        <>
          <h2>State-specific disclosures</h2>
          {withDisclosure.map((c) => (
            <div key={c.abbr}>
              <h3 className="mt-4 font-semibold">{names[c.abbr]}</h3>
              <p>{c.disclosure}</p>
            </div>
          ))}
        </>
      )}
      <h2>Not advice</h2>
      <p>Information on this website is general. It isn't legal, tax, financial or brokerage advice for your situation.</p>
    </LegalPage>
  );
}
