import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { siteUrl, isProductionSite } from "@/content/site";

export function generateMetadata(): Metadata {
  const url = siteUrl();
  return {
    title: "Website Terms | Primed Real Estate",
    description: "Terms for using the Primed Real Estate website, its calculators and comparison tools, including the limits of online estimates.",
    alternates: url ? { canonical: `${url}/terms` } : undefined,
    robots: isProductionSite() ? undefined : { index: false },
  };
}

export default function Terms() {
  return (
    <LegalPage crumb="Website terms" title="Website terms" updated="October 12, 2026" intro="By using this website you agree to these terms. Please read them with our privacy policy and transaction disclosures.">
      <h2>What this website is</h2>
      <p>This website provides general information about selling real estate, tools that calculate scenarios from the information you enter, and ways to contact Primed Real Estate. It is not legal, tax, financial or real estate brokerage advice.</p>
      <h2>Estimates and tools</h2>
      <p>Results from the cash offer calculator and the net proceeds comparison are estimates based on your inputs and our assumptions. They are not appraisals, broker opinions of value, purchase offers or promises to buy. Any purchase offer will be made only in writing after a review of the property, title, market conditions and transaction eligibility, and is binding only if signed by all parties according to its terms.</p>
      <h2>Inquiries</h2>
      <p>Submitting an inquiry does not create a contract, an agency relationship or any obligation for you or for us. We may decline to review or make an offer on any property.</p>
      <h2>Your information</h2>
      <p>You agree to provide accurate information and to submit only information you have the right to share. Our <Link href="/privacy">privacy policy</Link> explains how we handle it.</p>
      <h2>Acceptable use</h2>
      <ul>
        <li>Don't attempt to access owner-only areas, interfere with the site's security or overload it with automated requests.</li>
        <li>Don't submit false, misleading or someone else's information.</li>
        <li>Don't copy the site's content or tools for commercial use without permission.</li>
      </ul>
      <h2>Third-party links</h2>
      <p>We link to government and nonprofit resources for your convenience. We don't control them and aren't responsible for their content.</p>
      <h2>Disclaimers and limits</h2>
      <p>The website is provided “as is.” To the extent the law allows, Primed Real Estate is not liable for decisions made in reliance on general information or tool results on this website.</p>
      <h2>Changes</h2>
      <p>We may update these terms and will change the date above when we do.</p>
    </LegalPage>
  );
}
