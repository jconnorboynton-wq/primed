import type { PageContent } from "../types";

export const about: PageContent = {
  slug: "about",
  path: "/about",
  published: true,
  noindex: false,
  breadcrumb: "About",
  seo: {
    title: "About Primed Real Estate | Washington-Based Wholesaling",
    description:
      "Primed Real Estate is a Washington-based wholesaling team working with property owners nationwide, built around clear explanations and understandable transactions.",
  },
  sections: [
    {
      type: "hero",
      eyebrow: "About Primed Real Estate",
      heading: "Built around understandable transactions",
      intro:
        "Primed Real Estate is a real estate wholesaling team based in Washington State, reviewing properties for owners across the United States. Our aim is simple: make an as-is sale easier to understand, from the first question to the closing table.",
      primary: { label: "Contact Primed", href: "/contact", id: "about_hero_contact" },
      secondary: { label: "How it works", href: "/how-it-works", id: "about_hero_hiw" },
    },
    {
      type: "prose",
      tone: "light",
      heading: "What we do",
      paragraphs: [
        "We work with owners who want to explore selling a property as it is: homes that need repairs, inherited houses, rentals and properties owned from a distance. When a property fits, we may contract to buy it. Depending on the transaction, we may close on it ourselves or assign our contract rights to another buyer for compensation, and we disclose that in writing before anyone signs.",
        "We also build relationships with real estate investors who submit detailed buying criteria, so that properties under contract can be matched with buyers who actually want them.",
        "We're not a real estate brokerage, appraiser or lender, and we don't represent sellers or buyers as agents.",
      ],
    },
    {
      type: "cards",
      tone: "pale",
      heading: "The experience we intend to deliver",
      columns: 3,
      cards: [
        { title: "Clear explanations", body: "Every estimate shows its assumptions. Every written offer explains price, deposit, costs, review periods and our role." },
        { title: "Realistic expectations", body: "We'd rather tell you a property isn't a fit, or a date isn't realistic, than promise something we can't deliver." },
        { title: "Respect for your timing", body: "Some owners need to move quickly; others need time for family or estate steps. Your timeline shapes the conversation." },
        { title: "No pressure", body: "No countdown clocks, no surprise fees for a review and no obligation until you sign an agreement you understand." },
        { title: "Washington roots, national reach", body: "Based in Washington State. We review inquiries nationwide and confirm eligibility state by state." },
        { title: "Privacy-minded", body: "We collect only what we need to review a property and respond, and we never put your details in a link." },
      ],
    },
    {
      type: "component",
      name: "team",
      heading: "The people behind Primed",
    },
    {
      type: "cta",
      tone: "dark",
      heading: "Talk with us about a property",
      body: "Whether you're ready to sell or just exploring, we'll review the details and explain your options.",
      primary: { label: "Contact Primed", href: "/contact", id: "about_final_contact" },
      secondary: { label: "Read our disclosures", href: "/disclosures", id: "about_disclosures" },
    },
  ],
};
