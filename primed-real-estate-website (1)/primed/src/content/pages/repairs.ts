import type { PageContent } from "../types";

export const repairs: PageContent = {
  slug: "repairs",
  path: "/sell-house-needing-repairs",
  published: true,
  noindex: false,
  breadcrumb: "House needing repairs",
  parent: { label: "Sell your property", href: "/sell-your-house-for-cash" },
  seo: {
    title: "Sell a House That Needs Repairs, As-Is | Primed",
    description:
      "Selling a house with deferred maintenance or damage: how condition affects price, repair-first versus as-is tradeoffs, and a repair planner linked to our calculator.",
  },
  sections: [
    {
      type: "hero",
      eyebrow: "Houses needing repairs",
      heading: "Selling a house that needs work",
      intro:
        "Maybe it's an aging roof, a dated kitchen, a foundation crack or damage from a leak. You can repair first, list as-is or consider an as-is purchase. Here's how condition affects each option.",
      primary: { label: "Estimate My As-Is Offer", href: "/cash-offer-calculator", id: "rep_hero_estimate" },
      secondary: { label: "Plan My Repair Budget", href: "#repair-guide", id: "rep_hero_guide" },
    },
    {
      type: "cards",
      tone: "light",
      heading: "From cosmetic to major",
      intro: "Buyers look at repairs differently depending on scope and certainty.",
      columns: 4,
      cards: [
        { title: "Cosmetic and dated", body: "Paint, flooring, fixtures, older kitchens and baths. Often the easiest for buyers to estimate." },
        { title: "Deferred maintenance", body: "Worn roofs, aging water heaters, gutters, overdue servicing. Costs add up, but are usually well understood." },
        { title: "Major systems", body: "Electrical panels, plumbing, HVAC and sewer lines. Larger costs and more variation in quotes." },
        { title: "Damage and structure", body: "Water or fire damage, mold, foundation or framing issues. The most uncertainty; specialist review is common." },
      ],
    },
    {
      type: "prose",
      tone: "pale",
      heading: "How condition affects a potential price",
      paragraphs: [
        "A buyer purchasing as-is is taking on the repairs, the time it takes to complete them and the risk that they cost more than expected. They generally price from what the home could sell for after repairs, then subtract the repair budget, their holding and resale costs and an allowance for risk.",
        "That means two things for you. First, **uncertainty costs money**: an unknown issue may be priced conservatively. A contractor's quote or inspection report, if you have one, can narrow the gap. Second, **not every repair pays for itself**. Some updates add less value than they cost, especially when you factor in time and carrying costs.",
        "Our [calculator](/cash-offer-calculator) uses your repair figure directly. It doesn't invent repair costs from a condition label. The planner below helps you add up a rough number.",
      ],
    },
    {
      type: "component",
      name: "repairGuide",
      id: "repair-guide",
      tone: "light",
      heading: "Repair planning guide",
      intro: "Enter rough figures for the areas you know about. Your total carries straight into the cash offer calculator.",
      after: "These are your planning inputs, not professional repair quotes. A written offer would be based on a review of the property itself.",
    },
    {
      type: "comparison",
      tone: "pale",
      heading: "Repair first, list as-is, or consider a cash purchase",
      caption: "Tradeoffs between repairing before listing, listing as-is and a possible as-is cash purchase",
      columns: ["Repair, then list", "List as-is", "Possible as-is purchase"],
      rows: [
        { label: "Upfront cost", values: ["You fund repairs before selling", "None, though buyers may ask for credits", "None"] },
        { label: "Time", values: ["Repair time plus market time", "Market time; some buyers can't get financing on homes in poor condition", "Review, title and closing"] },
        { label: "Price potential", values: ["Can be highest if repairs add more than they cost", "Reflects condition; depends on buyer pool", "Usually lower, reflecting repair and buyer costs"] },
        { label: "Risk", values: ["Cost overruns; surprises once walls are open", "Inspection renegotiation; financing falls through", "The buyer's review may adjust terms if new issues appear"] },
        { label: "Best when", values: ["You have funds, time and reliable contractors", "Condition is moderate and the market is active", "You value simplicity or can't manage repairs"] },
      ],
    },
    {
      type: "component",
      name: "sellerForm",
      id: "request",
      tone: "light",
      heading: "Request a review of the property",
      intro: "Describe the repairs you know about in the notes. Photos can be shared later if a review moves forward.",
      props: { inquiryType: "property_review", submitLabel: "Request My Property Review", formId: "repairs" },
    },
    {
      type: "faq",
      tone: "pale",
      heading: "Repair and condition questions",
      groups: [
        {
          items: [
            { q: "Should I fix anything before selling as-is?", a: "Usually it's not required. Small safety items or clearing hazards for a walkthrough can help. Major repairs are rarely worth starting if you plan to sell as-is." },
            { q: "Do I still have to disclose problems?", a: "Often yes. Many states require sellers to disclose known material defects even in an as-is sale. Check your state's rules; in Washington, see our [Washington page](/service-areas/washington)." },
            { q: "What if you find more problems during review?", a: "The written agreement explains what happens if the buyer's review finds issues, for example renegotiation or cancellation within a review period. Read that section before signing." },
            { q: "Can you review a house with fire or water damage?", a: "Yes, we review damaged properties. Insurance claims, mitigation status and safety access will come up in the conversation." },
          ],
        },
      ],
    },
  ],
};
