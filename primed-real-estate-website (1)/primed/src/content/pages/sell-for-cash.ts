import type { PageContent } from "../types";

export const sellForCash: PageContent = {
  slug: "sell-for-cash",
  path: "/sell-your-house-for-cash",
  published: true,
  noindex: false,
  breadcrumb: "Sell your house for cash",
  seo: {
    title: "Sell Your House for Cash, As-Is | Primed Real Estate",
    description:
      "How an as-is cash sale works: which properties we review, how condition, title and timing affect a price, what assignment means, and how it compares with listing.",
  },
  sections: [
    {
      type: "hero",
      eyebrow: "Sell your house for cash",
      heading: "Selling as-is for cash, explained plainly",
      intro:
        "A cash sale can mean fewer repairs, fewer showings and a timeline you help choose. It can also mean a lower price than a fully prepared retail sale. Here's how it works with Primed, so you can decide with clear eyes.",
      primary: { label: "Request My Property Review", href: "#request", id: "cash_hero_review" },
      secondary: { label: "Estimate My Cash Offer", href: "/cash-offer-calculator", id: "cash_hero_estimate" },
    },
    {
      type: "prose",
      tone: "light",
      heading: "What a cash purchase involves",
      paragraphs: [
        "In a cash purchase, the buyer pays without a mortgage loan, so the sale doesn't depend on a lender's appraisal or loan approval. That removes one common reason sales fall apart. It doesn't remove everything: title still has to be clear, the purchase agreement's conditions still have to be met, and the buyer still has to perform.",
        "With Primed, a cash purchase usually starts with your inquiry and a conversation about the property. If it fits, we may propose written terms. We may close as the buyer, or we may **assign** our contract to another cash buyer and be paid for the assignment. Either way, the written agreement spells out the price, the deposit, the timeline, any review period and who pays which costs.",
        "**As-is** means you sell the property in its current condition without promising repairs. It doesn't change your legal duties to disclose known issues where your state requires it, and it doesn't mean the buyer skips due diligence. Expect a walkthrough or inspection before closing.",
      ],
      aside: {
        title: "Properties we review",
        items: [
          "Single-family houses, townhouses and condos",
          "Duplexes to fourplexes",
          "Manufactured homes on owned land",
          "Homes needing light to major repairs",
          "Occupied, vacant, inherited or rental properties",
          "Larger buildings, land and unusual properties: reviewed case by case",
        ],
      },
    },
    {
      type: "steps",
      tone: "pale",
      heading: "From inquiry to a written offer",
      intro: "Each stage is a chance to ask questions or stop. Nothing is binding until a purchase agreement is signed by both sides.",
      steps: [
        { title: "Inquiry", body: "You share the location and basic details through the calculator or the form below.", who: "You" },
        { title: "Conversation", body: "We ask about condition, occupancy, timing, liens, co-owners and what matters most to you.", who: "You and Primed" },
        { title: "Property review", body: "We look at the property in person or through a scheduled walkthrough, check the market and look at title basics.", who: "Primed" },
        { title: "Written terms", body: "If it fits, we send proposed terms in writing: price, deposit, review period, closing timeline, costs and whether the contract may be assigned.", who: "Primed" },
        { title: "Your decision", body: "You can ask questions, negotiate, take time to get advice or decline.", who: "You" },
        { title: "Title and closing", body: "A title or escrow company prepares closing. The sale closes if all conditions are satisfied and all parties sign.", who: "Everyone" },
      ],
    },
    {
      type: "list",
      tone: "light",
      heading: "What affects a cash price",
      intro: "A cash buyer usually prices a property from what it could sell for after repairs, then subtracts the costs and risks of getting there.",
      style: "check",
      columns: 2,
      items: [
        "**Value after repairs:** recent sales of similar updated homes nearby.",
        "**Condition and repairs:** the scope, and how certain the estimate is.",
        "**Buyer costs:** holding, financing, insurance and resale closing costs.",
        "**Market conditions:** how quickly similar homes are selling, and at what prices.",
        "**Title issues:** liens, judgments, probate steps or co-owner signatures can add time and cost.",
        "**Timeline:** a very short or very long closing window can change the numbers.",
        "**Occupancy:** tenants, leases and access affect what a buyer can do and when.",
        "**Assignment:** if the contract is assigned, the end buyer's price includes compensation to Primed.",
      ],
      outro: "Try the [cash offer calculator](/cash-offer-calculator) to see how your own assumptions shape a preliminary range.",
    },
    {
      type: "comparison",
      tone: "pale",
      heading: "Cash sale or listing: a balanced comparison",
      intro: "This compares typical patterns, not guaranteed outcomes. Your numbers depend on your property and market.",
      caption: "Comparison of a traditional listing and a possible as-is cash sale",
      columns: ["Listing with a broker", "As-is cash sale"],
      rows: [
        { label: "Likely price", values: ["Often higher, especially for well-kept homes in active markets", "Often lower, because the buyer takes on repairs, holding costs and risk"] },
        { label: "Repairs and preparation", values: ["Commonly expected before or after inspection", "Property reviewed as it stands"] },
        { label: "Showings", values: ["Many, over weeks or months", "Usually one or a few walkthroughs"] },
        { label: "Financing risk", values: ["Buyer loans and appraisals can delay or end a sale", "No loan contingency, though other conditions still apply"] },
        { label: "Costs to you", values: ["Broker compensation if agreed, closing costs, concessions, carrying costs", "Closing costs as stated in the agreement; carrying costs until closing"] },
        { label: "Who you work with", values: ["A licensed broker who represents you", "A buyer (Primed or an assignee) who does not represent you"] },
      ],
      note: "Assumption: both scenarios close. Run both with your own figures in the [net proceeds comparison](/resources#net-proceeds). A listing broker can give you a market analysis for comparison.",
    },
    {
      type: "prose",
      tone: "light",
      heading: "Title, costs and assignment in plain language",
      paragraphs: [
        "**Title:** before closing, a title or escrow company checks that the property can be transferred. Mortgages, liens, unpaid taxes and the signatures of everyone on title need to be handled. Problems here are the most common source of delay in any sale.",
        "**Costs:** who pays for escrow, title insurance, transfer or excise taxes and recording depends on local custom and the written agreement. Some are required by law to be paid by a specific party. Ask for an estimated settlement statement before you sign.",
        "**Assignment:** if our agreement allows assignment, another buyer may take over our position and close with you, paying us a fee. Your price and terms stay as written in your agreement. You're entitled to understand who the closing buyer will be and how the deposit is protected.",
      ],
    },
    {
      type: "component",
      name: "sellerForm",
      id: "request",
      tone: "pale",
      heading: "Request your property review",
      intro: "Share the basics. We'll review the property and follow up by your preferred contact method. There's no cost or obligation.",
      props: { inquiryType: "property_review", submitLabel: "Request My Property Review", formId: "cash" },
    },
    {
      type: "faq",
      tone: "light",
      heading: "Cash sale questions",
      groups: [
        {
          items: [
            { q: "How fast can a cash sale close?", a: "It depends on title, the property and the agreement. Some close within a few weeks; others take longer because of probate, liens or tenants. We'll give you a realistic expectation after reviewing the details rather than promising a date in advance." },
            { q: "Will I pay a commission?", a: "Primed isn't a broker, so there's no listing commission to us. If we assign the contract, we're paid by the assignee. That compensation is part of the difference between your contract price and what the end buyer pays, so it's reflected in the price you're offered rather than charged to you separately. You may still pay seller closing costs, as stated in your agreement." },
            { q: "Can I back out?", a: "Before you sign a purchase agreement, yes, at any time. After signing, your rights depend on the agreement's terms and state law. Read the cancellation and contingency sections, and consider having an attorney review them." },
            { q: "Do you need to inspect the house?", a: "Usually yes, through a walkthrough or inspection, so the price reflects actual condition. We schedule it around you." },
            { q: "What if I owe more than the house is worth?", a: "A cash sale can't close unless the liens are paid or the lienholder agrees to accept less. That's a conversation with your lender; we can help you understand the numbers, but we can't negotiate on your behalf." },
          ],
        },
      ],
    },
  ],
};
