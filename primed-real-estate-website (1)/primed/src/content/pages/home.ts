import type { PageContent } from "../types";

export const home: PageContent = {
  slug: "home",
  path: "/",
  published: true,
  noindex: false,
  breadcrumb: "Home",
  seo: {
    title: "Primed Real Estate | As-Is Property Sale Options Nationwide",
    description:
      "Primed Real Estate is a Washington-based wholesaling team reviewing property inquiries nationwide. Estimate a cash offer range or request a property review.",
  },
  sections: [
    {
      type: "hero",
      eyebrow: "Washington-based · Reviewing properties nationwide",
      heading: "A clearer path to selling your property.",
      intro:
        "We're a real estate wholesaling team rooted in Washington State, working with owners across the United States who want to explore an as-is sale, choose their timing and understand every step before they sign anything.",
      primary: { label: "Estimate My Cash Offer", href: "/cash-offer-calculator", id: "home_hero_estimate" },
      secondary: { label: "Request a Property Review", href: "/contact#request", id: "home_hero_review" },
      widget: "addressStart",
    },
    {
      type: "cards",
      tone: "light",
      eyebrow: "Why owners talk to us",
      heading: "Selling on terms you understand",
      columns: 3,
      cards: [
        {
          title: "Explore an as-is sale",
          body: "Skip the repair list and showings if they don't fit your situation. We look at the property as it stands today, condition included.",
        },
        {
          title: "Choose a preferred timeline",
          body: "Tell us whether you need to move soon or would rather wait. Your preferred date shapes the conversation; it's set only in a signed agreement.",
        },
        {
          title: "Understand the next steps",
          body: "We explain who the buyer may be, how a contract could be assigned, what costs apply and what you'd sign, in plain language, before you decide.",
        },
      ],
    },
    {
      type: "component",
      name: "situationFinder",
      tone: "pale",
      id: "which-path",
      eyebrow: "Which path fits?",
      heading: "Five questions. An honest answer.",
      intro: "Not every property should be sold as-is. Answer five quick questions and we'll point you to the route that fits what you told us, even when that's a traditional listing.",
    },
    {
      type: "steps",
      tone: "light",
      eyebrow: "How it works",
      heading: "Four steps from first question to closing",
      intro: "No step commits you to the next. You can stop at any point before signing a purchase agreement.",
      steps: [
        { title: "Share the property", body: "Use the calculator or the request form. A state and a way to reach you are enough to start." },
        { title: "Talk through your goals", body: "We ask about condition, timing, occupancy and anything that affects title, like liens or co-owners." },
        { title: "Review and written terms", body: "If the property and transaction fit, we explain any proposed terms in writing, including whether the contract may be assigned." },
        { title: "Title, review and closing", body: "A title or escrow company handles the closing if everyone agrees and the agreement's conditions are met." },
      ],
      outro: "Read the full walkthrough on [how it works](/how-it-works).",
    },
    {
      type: "component",
      name: "calculator",
      tone: "light",
      id: "estimate",
      eyebrow: "Preliminary cash-offer estimator",
      heading: "See a preliminary range in a few minutes",
      intro:
        "Enter the property's location, condition, your estimate of its after-repair value and a rough repair budget. When the inputs support it, you'll see a preliminary range. When they don't, we'll tell you so and offer a personal review instead of guessing.",
      after: "An estimate is not a purchase offer. Any written offer depends on a property review, title, market conditions, transaction eligibility and agreed terms.",
    },
    {
      type: "cards",
      tone: "pale",
      eyebrow: "Selling situations",
      heading: "Find guidance for your situation",
      intro: "Every property and family is different. These pages cover the practical questions that come up most.",
      columns: 3,
      cards: [
        { title: "Inherited property", body: "Co-owners, belongings, distance and confirming who has authority to sell.", href: "/sell-inherited-property", linkLabel: "Selling an inherited property" },
        { title: "A house needing repairs", body: "How condition affects price, and the tradeoffs of fixing first versus selling as-is.", href: "/sell-house-needing-repairs", linkLabel: "Selling a house that needs work" },
        { title: "Before a foreclosure deadline", body: "A calm look at options, and why staying in contact with your lender matters.", href: "/sell-before-foreclosure", linkLabel: "Time-sensitive situations" },
        { title: "A rental property", body: "Occupied or vacant, leases, deposits and what tenants' rights mean for a sale.", href: "/sell-rental-property", linkLabel: "Selling a rental" },
        { title: "Relocating or out of state", body: "Remote ownership, access, coordinating signatures and choosing your date.", href: "/sell-house-relocation", linkLabel: "Selling when you move" },
        { title: "Not sure yet?", body: "Compare listing with a possible as-is purchase using your own numbers.", href: "/resources#net-proceeds", linkLabel: "Compare net proceeds" },
      ],
    },
    {
      type: "component",
      name: "map",
      tone: "light",
      eyebrow: "Service areas",
      heading: "Rooted in Washington. Reviewing properties nationwide.",
      intro:
        "Washington is our home base. We accept inquiries from owners in every state and Washington, DC, then review each property, market and transaction for eligibility before discussing any offer.",
      after: "Accepting an inquiry from a state doesn't mean we can complete a transaction there. See [service areas](/service-areas) for how we review each location.",
    },
    {
      type: "prose",
      tone: "dark",
      eyebrow: "Our role",
      heading: "What a wholesaler does, and who the buyer may be",
      paragraphs: [
        "Primed Real Estate is a wholesaling company, not a real estate brokerage. We don't list homes or represent you as an agent. When a property fits, we may sign a purchase agreement with you as the buyer.",
        "Depending on the transaction, we may close on the property ourselves, or we may **assign** our rights under that agreement to another buyer, often a real estate investor, and be paid for that assignment. In some cases another disclosed structure may apply. We tell you which approaches are possible in writing before you sign.",
        "Because a different buyer may complete the purchase, it's reasonable to ask who will close, how earnest money is handled and what happens if the buyer doesn't perform. We'll answer those questions directly. Read our [transaction disclosures](/disclosures) for more.",
      ],
      aside: {
        title: "Questions worth asking any cash buyer",
        items: [
          "Will you close yourselves, or may the contract be assigned?",
          "How much earnest money is deposited, and with whom?",
          "Which costs would I pay at closing?",
          "What are the inspection or review periods, and what happens if you cancel?",
          "Which title or escrow company would handle the closing?",
        ],
      },
    },
    {
      type: "comparison",
      tone: "light",
      heading: "Comparing selling approaches",
      intro: "There's no universally better choice. A traditional listing often reaches more buyers; an as-is sale can reduce preparation and uncertainty. Your priorities decide.",
      caption: "Comparison of a traditional listing, a for-sale-by-owner sale and a possible as-is cash purchase",
      columns: ["Traditional listing", "Selling it yourself", "Possible as-is purchase"],
      rows: [
        { label: "Preparation", values: ["Often repairs, cleaning and staging", "Up to you", "Property reviewed in its current condition"] },
        { label: "Showings", values: ["Public showings and open houses", "You arrange them", "Usually one or a few walkthroughs"] },
        { label: "Price exposure", values: ["Broad market exposure may bring the strongest price", "Depends on your marketing reach", "Price reflects repairs, risk and the buyer's costs; often below a retail sale"] },
        { label: "Fees and costs", values: ["Broker compensation if agreed, plus seller closing costs", "Seller closing costs; possible buyer-agent compensation", "Seller costs set by the written agreement"] },
        { label: "Timing", values: ["Depends on market time and buyer financing", "Depends on finding a buyer", "Can be planned around a preferred date, set only in a signed agreement"] },
      ],
      note: "General comparison only. Actual costs and timing depend on your property, market and agreement. Run your own numbers with the [net proceeds comparison](/resources#net-proceeds).",
    },
    {
      type: "cta",
      tone: "pale",
      heading: "Buying investment property?",
      body: "If you're an active investor, share your markets and buying criteria. When a property under contract fits, we'll reach out directly.",
      primary: { label: "Submit My Buy Box", href: "/investors", id: "home_investor" },
    },
    {
      type: "faq",
      tone: "light",
      heading: "Common questions",
      groups: [
        {
          items: [
            { q: "Is the calculator's number an offer?", a: "No. It's a preliminary range based on your inputs. A written offer, if one is made, comes only after we review the property, title and transaction details." },
            { q: "Do I have to make repairs or clean out the house?", a: "Not for us to review it. We look at properties as they are. If a written agreement is reached, it will state what condition the property is delivered in." },
            { q: "Will you buy my house yourselves?", a: "Sometimes we may close as the buyer; in other cases we may assign the contract to another buyer for compensation. We explain which applies before you sign. See [our role](/disclosures)." },
            { q: "Does it cost anything to request a review?", a: "No. Requesting a review or using the calculator is free and doesn't obligate you to anything." },
            { q: "Where do you work?", a: "We're based in Washington State and accept inquiries from every state. Each property and location is reviewed for eligibility before any offer is discussed. See [service areas](/service-areas)." },
          ],
        },
      ],
    },
    {
      type: "cta",
      tone: "dark",
      heading: "Ready to talk about your property?",
      body: "Send the basics and we'll review the property, the location and your goals, then follow up by the contact method you choose.",
      primary: { label: "Request a Property Review", href: "/contact#request", id: "home_final_review" },
      secondary: { label: "Estimate My Cash Offer", href: "/cash-offer-calculator", id: "home_final_estimate" },
    },
  ],
};
