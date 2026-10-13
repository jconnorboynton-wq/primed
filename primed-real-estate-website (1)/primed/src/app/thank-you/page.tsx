import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Request Received | Primed Real Estate", robots: { index: false, follow: false } };

/** Generic, non-personalized confirmation page (never indexed; contains no submitted data). */
export default function ThankYou() {
  return (
    <LegalPage crumb="Request received" title="Thank you" updated="October 12, 2026" intro="If you just submitted a form, your confirmation was shown on the page you used. Here's what to expect next.">
      <ul>
        <li>A person reviews each property or investor request.</li>
        <li>We contact you by the method you selected.</li>
        <li>Nothing you submitted obligates you to anything.</li>
      </ul>
      <p><Link href="/resources">Browse seller resources</Link> while you wait, or <Link href="/">return home</Link>.</p>
    </LegalPage>
  );
}
