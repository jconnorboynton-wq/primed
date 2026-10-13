import type { PageContent } from "../types";

export const investors: PageContent = {
  slug: "investors",
  path: "/investors",
  published: true,
  noindex: false,
  breadcrumb: "Investors",
  seo: {
    title: "Off-Market Property Opportunities for Investors | Primed",
    description:
      "Share your buy box with Primed Real Estate: markets, property types, price range, strategy and rehab tolerance. We contact you when a contracted property may fit.",
  },
  sections: [
    {
      type: "hero",
      eyebrow: "For investors",
      heading: "Tell us what you buy",
      intro:
        "Primed works with property owners across the country. When a property we have under contract matches your criteria, we reach out directly. Start by sharing your buy box.",
      primary: { label: "Submit My Buy Box", href: "#buy-box", id: "inv_hero_submit" },
      secondary: { label: "How opportunities are shared", href: "#process", id: "inv_hero_process" },
    },
    {
      type: "steps",
      id: "process",
      tone: "light",
      heading: "How it works for buyers",
      steps: [
        { title: "Share your criteria", body: "Markets, property types, price range, strategy, rehab tolerance and timing. It takes a few minutes." },
        { title: "We match opportunities", body: "When a property under contract fits, we compare it against submitted criteria and contact buyers whose buy box matches." },
        { title: "Verify and review", body: "Before sharing full details we may verify funding through a secure, private process. You then do your own due diligence." },
        { title: "Assignment or other structure", body: "Opportunities may involve the assignment of our contractual interest, or another disclosed structure. Terms are set in writing." },
      ],
    },
    {
      type: "prose",
      tone: "pale",
      heading: "Your due diligence matters",
      paragraphs: [
        "We share the information we have, but we don't guarantee after-repair values, repair estimates, rents or returns, and we don't give investment advice. Verify value, condition, title, permits, zoning, occupancy and financing yourself, with your own professionals.",
        "Many opportunities involve an **assignment of contract**: you take over our position as buyer under our agreement with the seller and pay an assignment fee. Read the underlying purchase agreement and the assignment terms carefully, including deposit, review period and closing date.",
        "Proof of funds or financing is reviewed privately when an opportunity is being discussed. Please don't upload bank statements or account details through this website.",
      ],
      aside: {
        title: "What we won't do",
        items: [
          "Publish inflated values or projected returns",
          "Claim exclusive inventory or artificial scarcity",
          "Share a seller's personal information beyond what's needed for a transaction",
          "Ask for funding documents through a public form",
        ],
      },
    },
    {
      type: "component",
      name: "investorEmpty",
      tone: "light",
      heading: "Current opportunities",
    },
    {
      type: "component",
      name: "investorForm",
      id: "buy-box",
      tone: "pale",
      heading: "Submit your buy box",
      intro: "Required fields are marked. The more specific you are, the better we can match.",
    },
    {
      type: "faq",
      tone: "light",
      heading: "Investor questions",
      groups: [
        {
          items: [
            { q: "Is there a fee to join?", a: "No. Submitting criteria is free. When you take an assignment, the fee is stated in the written assignment agreement." },
            { q: "Which markets do you cover?", a: "We're based in Washington State and review seller inquiries nationwide. Opportunities appear where we have properties under contract and can complete the transaction." },
            { q: "How are opportunities shared?", a: "Directly with buyers whose criteria match, by their preferred communication method. We don't post a public list." },
            { q: "Can I update my criteria?", a: "Yes. Submit the form again with your updated buy box and mention that it replaces your earlier one." },
            { q: "Do you require proof of funds?", a: "We may ask to verify funding before sharing full property details. That happens privately and securely, never through a public upload." },
          ],
        },
      ],
    },
  ],
};
