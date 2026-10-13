import type { PageContent } from "../types";

export const howItWorks: PageContent = {
  slug: "how-it-works",
  path: "/how-it-works",
  published: true,
  noindex: false,
  breadcrumb: "How it works",
  parent: { label: "Sell your property", href: "/sell-your-house-for-cash" },
  seo: {
    title: "How an As-Is Cash Home Sale Works | Primed Real Estate",
    description:
      "The step-by-step process for an as-is sale with a wholesaler: inquiry, estimate, review, written offer, assignment, title and closing, and what to ask at each stage.",
  },
  sections: [
    {
      type: "hero",
      eyebrow: "How it works",
      heading: "From first question to closing, step by step",
      intro:
        "Here's exactly how an inquiry with Primed moves forward, who is responsible at each stage and where you can pause, ask questions or walk away.",
      primary: { label: "Start My Property Review", href: "/contact#request", id: "hiw_hero_review" },
      secondary: { label: "Estimate My Cash Offer", href: "/cash-offer-calculator", id: "hiw_hero_estimate" },
    },
    {
      type: "comparison",
      tone: "light",
      heading: "Inquiry, estimate and written offer are different things",
      intro: "Much confusion in cash sales comes from mixing these up.",
      caption: "Differences between an inquiry, an estimate and a written purchase offer",
      columns: ["Inquiry", "Preliminary estimate", "Written purchase offer"],
      rows: [
        { label: "What it is", values: ["Your request for us to look at a property", "A range calculated from your inputs", "Proposed terms in a written agreement"] },
        { label: "Binding?", values: ["No", "No", "Only once signed by both parties, subject to its terms"] },
        { label: "Based on", values: ["What you tell us", "Your value and repair assumptions", "A property review, title basics and market check"] },
        { label: "What happens next", values: ["We review and contact you", "You can request a reviewed offer", "You decide whether to sign, negotiate or decline"] },
      ],
    },
    {
      type: "steps",
      tone: "pale",
      heading: "The six stages",
      steps: [
        { title: "Submit property details", body: "Share the location, condition and a way to reach you through the calculator or form. A state and contact method are enough to begin.", who: "You" },
        { title: "Discuss your goals", body: "We talk about timing, occupancy, repairs, liens, co-owners and what a good outcome looks like for you.", who: "You and Primed" },
        { title: "Review property and eligibility", body: "We schedule a walkthrough, check comparable sales and confirm the transaction can be done in your state and situation.", who: "Primed" },
        { title: "Receive any proposed written terms", body: "If the property fits, we send terms in writing, including price, deposit, review periods, closing timeline, costs and whether the contract may be assigned.", who: "Primed" },
        { title: "Buyer and title review", body: "After signing, the buyer completes any agreed review, and a title or escrow company checks ownership, liens and payoffs and prepares documents.", who: "Buyer and title company" },
        { title: "Closing, if everyone agrees", body: "If all conditions are met and all parties sign, the sale closes and funds are disbursed by the title or escrow company.", who: "Everyone" },
      ],
      outro: "We'll give you a realistic timeline after reviewing title and the property. We don't promise a closing date before then.",
    },
    {
      type: "prose",
      tone: "light",
      heading: "Assignment, explained",
      paragraphs: [
        "A purchase agreement gives the buyer certain rights: to buy the property at the agreed price on the agreed terms. When an agreement allows it, those rights can be **assigned**, meaning transferred to another buyer, who then steps into the buyer's position and closes with you.",
        "As a wholesaler, Primed may assign its contract to an investor buyer and be paid an assignment fee by that buyer. Your price, your deposit protections and your closing terms remain as written in your agreement. What changes is who completes the purchase.",
        "Assignment isn't right for every seller, and rules about how wholesalers must operate and disclose their role vary by state. Before you sign, we'll tell you whether we intend to close ourselves or may assign, and what that means for you. Ask us anything that's unclear, and consider having an attorney review the agreement.",
      ],
      aside: {
        title: "In your agreement, look for",
        items: [
          "Whether the contract may be assigned, and any notice you'll receive",
          "The earnest money amount, who holds it, and when it becomes non-refundable",
          "Inspection or review periods and the buyer's cancellation rights",
          "Who pays each closing cost",
          "The closing date and what happens if it slips",
        ],
      },
    },
    {
      type: "list",
      tone: "pale",
      heading: "Questions to ask before you sign",
      intro: "Any trustworthy buyer will welcome these questions. We'd be glad to answer them.",
      style: "question",
      columns: 2,
      items: [
        "What's the timeline from signing to closing, and what could delay it?",
        "How much is the deposit, who holds it and when is it at risk for the buyer?",
        "Can the buyer cancel, for what reasons and until when?",
        "Will this contract be assigned? If so, how will I know who's closing?",
        "What fees or costs come out of my proceeds?",
        "Which title or escrow company will handle closing?",
        "What condition do I need to leave the property in, and what about belongings?",
        "What happens if the buyer doesn't close?",
      ],
      outro: "There's no universal cancellation right in real estate contracts. Your rights come from the agreement and applicable law, so read those sections carefully.",
    },
    {
      type: "comparison",
      tone: "light",
      heading: "Who does what",
      caption: "Responsibilities of the seller, Primed and the title or escrow company",
      columns: ["You", "Primed", "Title or escrow company"],
      rows: [
        { label: "Before signing", values: ["Share accurate information; ask questions", "Review the property; explain terms and our role", "Not yet involved"] },
        { label: "After signing", values: ["Provide access; gather payoff and HOA details", "Complete review; coordinate with the buyer and title", "Order title report; request payoffs; prepare documents"] },
        { label: "At closing", values: ["Sign documents; deliver the property as agreed", "Ensure the buyer side is ready to close", "Collect funds; pay liens; disburse proceeds; record the deed"] },
      ],
    },
    {
      type: "cta",
      tone: "dark",
      heading: "Start with a no-obligation review",
      body: "Tell us about the property. We'll explain what we see, what's possible and what we'd need to make a written offer.",
      primary: { label: "Start My Property Review", href: "/contact#request", id: "hiw_final_review" },
      secondary: { label: "Read our disclosures", href: "/disclosures", id: "hiw_disclosures" },
    },
    {
      type: "faq",
      tone: "light",
      heading: "Process questions",
      groups: [
        {
          items: [
            { q: "Do I need a real estate agent?", a: "You can sell without one, but you're welcome to have an agent or attorney advise you. Primed isn't a brokerage and doesn't represent you." },
            { q: "How is earnest money handled?", a: "Typically it's deposited with the title or escrow company named in the agreement. The agreement states the amount and when it becomes non-refundable to the buyer." },
            { q: "Can I stay in the house until closing?", a: "Usually, yes. Possession timing, including any time after closing, is set in the agreement." },
            { q: "What if the title search finds a problem?", a: "Many issues can be resolved, though some take time, like probate steps or releasing old liens. We'll explain what we find and what it means for timing." },
          ],
        },
      ],
    },
  ],
};
