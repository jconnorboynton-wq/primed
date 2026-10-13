import type { PageContent } from "../types";

export const serviceAreas: PageContent = {
  slug: "service-areas",
  path: "/service-areas",
  published: true,
  noindex: false,
  breadcrumb: "Service areas",
  seo: {
    title: "Nationwide Service Areas | Primed Real Estate",
    description:
      "Primed Real Estate is based in Washington and reviews property inquiries from all 50 states and DC. Check your state and see how transaction eligibility is reviewed.",
  },
  sections: [
    {
      type: "hero",
      eyebrow: "Service areas",
      heading: "Washington roots. Nationwide inquiries.",
      intro:
        "Our home base is Washington State. We welcome inquiries from owners in every state and Washington, DC, and review each property, market and transaction for eligibility before discussing an offer.",
      primary: { label: "Check My Property Location", href: "#map", id: "areas_hero_map" },
      secondary: { label: "Selling in Washington", href: "/service-areas/washington", id: "areas_hero_wa" },
    },
    {
      type: "component",
      name: "map",
      id: "map",
      tone: "pale",
      heading: "Check your property's location",
      intro: "Select a state on the map, search for it or use the full list. The panel shows how we currently handle inquiries there.",
      after: "Inquiries are accepted from every state. Accepting an inquiry is separate from being able to complete a transaction in that state, which we confirm during review.",
    },
    {
      type: "prose",
      tone: "light",
      heading: "How we review locations",
      paragraphs: [
        "Real estate practice isn't identical from state to state. Contract forms, disclosure rules, closing customs and the rules that apply to wholesalers all vary, and some states have specific registration or disclosure requirements for wholesaling. For that reason we treat every state's eligibility as something to confirm, not assume.",
        "When you send an inquiry, we review three things: the **property** (type, condition and whether it fits what buyers we work with look for), the **market** (recent sales and demand nearby) and the **transaction** (whether we can complete it in that state under its rules). If any of these doesn't fit, we'll tell you plainly.",
        "We don't have offices in every state and don't claim to. Much of the process, from review to closing coordination, can often be handled with local title and escrow companies and scheduled walkthroughs.",
      ],
      aside: {
        title: "What the state panel shows",
        items: [
          "Whether the state is our home base",
          "Whether transactions there are supported, reviewed case by case, or not currently available",
          "Whether online estimates are enabled there",
          "A direct way to send an inquiry for that state",
        ],
      },
    },
    {
      type: "cards",
      tone: "pale",
      heading: "Helpful next steps",
      columns: 3,
      cards: [
        { title: "Washington State", body: "Our home state, with Washington-specific selling considerations.", href: "/service-areas/washington", linkLabel: "Read the Washington guide" },
        { title: "Selling from far away", body: "Owning property in another state? Remote coordination and timing.", href: "/sell-house-relocation", linkLabel: "Out-of-state selling" },
        { title: "Run an estimate", body: "See a preliminary range where online estimates are enabled.", href: "/cash-offer-calculator", linkLabel: "Open the calculator" },
      ],
    },
    {
      type: "faq",
      tone: "light",
      heading: "Service area questions",
      groups: [
        {
          items: [
            { q: "Do you buy houses in my state?", a: "We accept inquiries from every state. Whether we can complete a transaction depends on the property, the market and that state's requirements, which we confirm during review." },
            { q: "Why can't I get an online estimate for my state?", a: "Online estimates are enabled state by state once we've reviewed how we can operate there. You can still request a personal review." },
            { q: "Do you have local offices?", a: "Our base is in Washington State. We don't claim local offices elsewhere; we coordinate reviews and closings with local title and escrow professionals where a transaction is eligible." },
            { q: "My ZIP code didn't fill in my state. Why?", a: "We don't run automated ZIP lookups. Please choose the state yourself; we'll carry the ZIP into your inquiry." },
          ],
        },
      ],
    },
  ],
};
