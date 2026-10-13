import type { PageContent } from "../types";

export const washington: PageContent = {
  slug: "washington",
  path: "/service-areas/washington",
  published: true,
  noindex: false,
  breadcrumb: "Washington",
  parent: { label: "Service areas", href: "/service-areas" },
  seo: {
    title: "Sell a House for Cash in Washington State | Primed",
    description:
      "Washington-specific guidance for an as-is sale: excise tax, seller disclosure (Form 17), title and closing, foreclosure resources, rentals and what to ask a wholesaler.",
  },
  sections: [
    {
      type: "hero",
      eyebrow: "Washington State · Our home base",
      heading: "Selling a Washington property as-is",
      intro:
        "Washington is where Primed is based. Whether your property is in a Puget Sound suburb, an Eastern Washington town or on rural acreage, here's what's specific to selling in this state and how we review properties here.",
      primary: { label: "Review My Washington Property", href: "#request", id: "wa_hero_review" },
      secondary: { label: "Estimate My Cash Offer", href: "/cash-offer-calculator", id: "wa_hero_estimate" },
    },
    {
      type: "prose",
      tone: "light",
      heading: "Urban, suburban and rural properties",
      paragraphs: [
        "Washington's housing is unusually varied. A condo in Seattle or Bellevue, a 1960s rambler in Tacoma or Everett, a house in Spokane or Yakima, acreage outside Olympia and a cabin near the mountains each raise different questions about value, access, permits, septic and wells, and who the likely buyers are.",
        "We review Washington properties of many kinds, including homes needing significant work, inherited houses and rentals. For rural properties, expect questions about water source, septic condition, road access and outbuildings. For condos and townhouses, we'll ask about the homeowners' association, special assessments and any rental restrictions.",
        "Naming these places is about geography, not a claim of local offices or past deals there. Every Washington inquiry gets the same individual review.",
      ],
      aside: {
        title: "Helpful to have on hand",
        items: [
          "A recent mortgage statement (for estimating payoffs)",
          "HOA contact details and recent assessments, if any",
          "Septic, well or permit records for rural properties",
          "Any leases and the current rent, if the home is rented",
          "Names of everyone on title",
        ],
      },
    },
    {
      type: "prose",
      tone: "pale",
      heading: "Washington selling considerations",
      paragraphs: [
        "**Real estate excise tax (REET).** Washington charges a graduated state excise tax on most property sales, plus any local REET. The Department of Revenue says the seller usually pays it, though the buyer becomes responsible if the seller doesn't. For sales on or after January 1, 2023, the state rate is 1.1% of the portion of the price up to $525,000, 1.28% up to $1,525,000, 2.75% up to $3,025,000 and 3% above that. The thresholds are scheduled to adjust on January 1, 2027. Confirm current figures with the [Department of Revenue](https://dor.wa.gov/taxes-rates/other-taxes/real-estate-excise-tax) and your escrow company.",
        "**Seller disclosure statement.** Washington's seller disclosure law, [chapter 64.06 RCW](https://app.leg.wa.gov/rcw/default.aspx?cite=64.06), generally requires sellers of residential property to give the buyer a disclosure statement (often called Form 17). Under [RCW 64.06.030](https://app.leg.wa.gov/rcw/default.aspx?cite=64.06.030) it is delivered within five business days of mutual acceptance unless otherwise agreed, and the buyer then has three business days to approve it or rescind. A buyer may waive receipt, except for the environmental section if any answer there would be “yes.” Some transfers are exempt, including certain transfers by a personal representative of an estate ([RCW 64.06.010](https://app.leg.wa.gov/rcw/default.aspx?cite=64.06.010)). Selling as-is doesn't by itself remove the duty.",
        "**Escrow and title.** Washington closings are commonly handled by escrow and title companies. They obtain payoff figures, collect excise tax, prepare the deed and disburse funds. Title insurance and escrow fees are allocated by the agreement and local custom, so look at the estimated settlement statement before you sign.",
        "**Our structure in Washington.** Real estate brokerage in Washington is licensed by the Department of Licensing under [chapter 18.85 RCW](https://dol.wa.gov/professional-licenses/real-estate-brokers/laws-and-rules-real-estate). Primed is not a brokerage and doesn't represent sellers or buyers. When we sign a purchase agreement, we act as a principal buyer who may close or assign the contract, and we explain that in writing before you sign.",
      ],
    },
    {
      type: "list",
      tone: "light",
      heading: "Questions to ask about a Washington sale",
      style: "question",
      columns: 2,
      items: [
        "Which escrow and title company will close, and who chooses it?",
        "Who pays the excise tax, escrow fee and title insurance under this agreement?",
        "Will I deliver a seller disclosure statement, or is the buyer waiving it?",
        "Is the buyer closing, or may the contract be assigned?",
        "How long is the buyer's review or inspection period?",
        "If the home is rented, how are the lease and deposit handled at closing?",
        "If I inherited the property, does the personal representative have authority to sell?",
        "What happens to my earnest money protections if the closing date moves?",
      ],
    },
    {
      type: "prose",
      tone: "pale",
      heading: "If you're facing foreclosure in Washington",
      paragraphs: [
        "Most Washington home foreclosures are nonjudicial, carried out by a trustee under the Deeds of Trust Act, [chapter 61.24 RCW](https://app.leg.wa.gov/rcw/default.aspx?cite=61.24). Deadlines are set by the notices you receive, so read every notice carefully.",
        "Washington's [Foreclosure Fairness Program](https://www.commerce.wa.gov/homeownership/foreclosure-fairness/) offers free housing counseling, civil legal aid and foreclosure mediation for eligible homeowners. Homeowners are referred to mediation by a housing counselor or attorney, and timing matters. The Department of Commerce lists a free counseling line at **1-877-894-HOME (4663)**.",
        "A sale inquiry doesn't stop a foreclosure. Keep talking with your lender and a counselor. Read our page on [selling before foreclosure](/sell-before-foreclosure) for how we approach time-sensitive situations.",
      ],
    },
    {
      type: "prose",
      tone: "light",
      heading: "Rentals and inherited homes in Washington",
      paragraphs: [
        "If the property is rented, Washington's [Residential Landlord-Tenant Act](https://app.leg.wa.gov/rcw/default.aspx?cite=59.18) continues to apply through a sale, including rules about when and how a tenancy can end. A sale doesn't automatically end a lease. See [selling a rental property](/sell-rental-property).",
        "For an inherited home, the person selling needs legal authority to sign, often a personal representative appointed through probate, or all heirs on title. An estate attorney can confirm what's needed. See [selling an inherited property](/sell-inherited-property).",
      ],
    },
    {
      type: "component",
      name: "sellerForm",
      id: "request",
      tone: "pale",
      heading: "Review my Washington property",
      intro: "Send the basics. We'll review the property and follow up by your preferred contact method.",
      props: { inquiryType: "property_review", submitLabel: "Review My Washington Property", state: "WA", formId: "wa" },
      after: "The information on this page is general and not legal or tax advice. Laws and rates change; confirm details with the agencies linked above or a Washington attorney.",
    },
    {
      type: "faq",
      tone: "light",
      heading: "Washington questions",
      groups: [
        {
          items: [
            { q: "Do I pay excise tax on a cash sale?", a: "Washington's REET applies to most sales regardless of how the buyer pays. The Department of Revenue says the seller usually pays it. Your escrow company calculates the exact amount." },
            { q: "Do I need to fill out Form 17 if I'm selling as-is?", a: "Often yes. As-is terms don't automatically exempt a residential sale from chapter 64.06 RCW, though some transfers are exempt and a buyer may waive receipt in part. Ask your escrow company or an attorney for your situation." },
            { q: "Can you close if I live out of state now?", a: "Often, yes. Washington escrow companies regularly work with sellers elsewhere. Signing options depend on the escrow company. See [selling when you relocate](/sell-house-relocation)." },
            { q: "Are online estimates available for Washington?", a: "Availability is shown on the [service-area map](/service-areas). Either way, you can request a personal review." },
          ],
        },
      ],
    },
  ],
};
