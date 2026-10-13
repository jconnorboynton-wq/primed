import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { getSettings } from "@/lib/settings";
import { siteUrl, isProductionSite } from "@/content/site";

export function generateMetadata(): Metadata {
  const url = siteUrl();
  return {
    title: "Privacy Policy | Primed Real Estate",
    description: "How Primed Real Estate collects, uses, shares, keeps and deletes information submitted through this website.",
    alternates: url ? { canonical: `${url}/privacy` } : undefined,
    robots: isProductionSite() ? undefined : { index: false },
  };
}

export default function Privacy() {
  const s = getSettings();
  const provider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER || "none";
  const crm = Boolean(process.env.CRM_WEBHOOK_URL);
  return (
    <LegalPage crumb="Privacy" title="Privacy policy" updated="October 12, 2026" intro="This policy explains what information we collect through this website, how we use and share it, how long we keep it and the choices you have.">
      <h2>Information you give us</h2>
      <ul>
        <li><strong>Property inquiries:</strong> your name, email and/or phone, preferred contact method, the property's location and details, your timeline, notes, and any value or repair assumptions you enter.</li>
        <li><strong>Calculator use:</strong> the property inputs you enter and the resulting estimate. Contact details are collected only if you choose to request a review.</li>
        <li><strong>Investor criteria:</strong> your name, company, contact details, markets, property types, price range, strategy, rehab tolerance and timing.</li>
        <li><strong>Optional marketing choices:</strong> if offered, whether you agreed to receive marketing messages, with the date and the wording you saw.</li>
      </ul>
      <p>Please don't send ID documents, Social Security numbers, bank or loan account numbers, or tenant records through this website. Our forms don't ask for them.</p>
      <h2>Information collected automatically</h2>
      <p>Our servers receive standard technical information such as IP address (used to prevent spam and abuse) and the pages you visit. We record the page where you started and any campaign tags in the link you used (for example, utm_source) so we understand which outreach is useful. We do not put your name, address, email, phone or financial details in website addresses or analytics.</p>
      {provider === "none" ? (
        <p>This website does not currently use third-party analytics or advertising cookies.</p>
      ) : provider === "plausible" ? (
        <p>We use Plausible Analytics, a cookieless analytics service, to count page visits and actions like starting a form. It does not receive the contents of forms.</p>
      ) : (
        <p>With your permission, we use Google Analytics to understand how visitors use the site. It is loaded only if you choose “Allow analytics,” and it never receives form contents or contact details.</p>
      )}
      <h2>How we use information</h2>
      <ul>
        <li>To review properties and respond to your inquiry by your preferred method.</li>
        <li>To match properties under contract with investors whose criteria fit.</li>
        <li>To operate, secure and improve the website, and to prevent spam and fraud.</li>
        <li>To send marketing messages only if you separately opted in, where such programs exist.</li>
        <li>To meet legal, tax and recordkeeping obligations.</li>
      </ul>
      <h2>How we share information</h2>
      <p>We don't sell your personal information. We share it only as needed:</p>
      <ul>
        <li><strong>Service providers</strong> who host the website and store data for us{crm ? ", and the customer-relationship system we use to manage inquiries" : ""}.</li>
        <li><strong>Transaction participants</strong>, if a transaction moves forward: for example, a title or escrow company, and, where a contract may be assigned, a prospective buyer who needs property details to evaluate it. We share a seller's contact details with a prospective buyer only when needed for the transaction you've agreed to pursue.</li>
        <li><strong>Investor criteria</strong> are used internally for matching and are not published.</li>
        <li><strong>Legal reasons</strong>, if required by law or to protect rights and safety.</li>
      </ul>
      <h2>How long we keep it</h2>
      <p>We keep inquiry records while we're evaluating the property or relationship and for a reasonable period afterward for business and legal records. You can ask us to delete your information at any time, unless we need to keep it for a transaction in progress or a legal obligation.</p>
      <h2>Your choices</h2>
      <ul>
        <li>Ask to see, correct or delete your information.</li>
        <li>Opt out of marketing messages at any time using the instructions in the message.</li>
        <li>Decline analytics where we ask for permission.</li>
      </ul>
      <p>Depending on where you live, you may have additional rights under state privacy laws. To make a request, {s.email ? <>email <a href={`mailto:${s.email}`}>{s.email}</a></> : <>use our <a href="/contact">contact form</a> and say it's a privacy request</>}. We'll verify the request before acting on it.</p>
      <h2>Security</h2>
      <p>We use encrypted connections, restricted owner access and server-side validation. No method of storage or transmission is perfectly secure, so please share only what's needed.</p>
      <h2>Children</h2>
      <p>This website is not intended for anyone under 18, and we don't knowingly collect information from children.</p>
      <h2>Changes</h2>
      <p>We'll update the date at the top when this policy changes.</p>
    </LegalPage>
  );
}
