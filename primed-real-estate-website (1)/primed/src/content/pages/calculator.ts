import type { PageContent } from "../types";

export const calculatorPage: PageContent = {
  slug: "calculator",
  path: "/cash-offer-calculator",
  published: true,
  noindex: false,
  breadcrumb: "Cash offer calculator",
  seo: {
    title: "Cash Offer Calculator: Preliminary Estimate | Primed",
    description:
      "Estimate a preliminary cash-offer range from your property's location, condition, after-repair value and repair budget, then request a reviewed offer.",
  },
  sections: [
    {
      type: "hero",
      eyebrow: "Cash offer calculator",
      heading: "Estimate a preliminary cash-offer range",
      intro:
        "Use your own best estimates. The calculator shows how value, repairs and buyer costs shape a cash price, then lets you request a reviewed offer based on the real property.",
      primary: { label: "Start the Calculator", href: "#calculator", id: "calc_hero_start" },
      secondary: { label: "How estimates work", href: "#inputs", id: "calc_hero_inputs" },
      note: "Takes about three minutes. No contact details needed to see a result.",
    },
    {
      type: "component",
      name: "calculator",
      tone: "pale",
      heading: "Your preliminary estimate",
      after: "This is an estimate, not a purchase offer. Any written offer depends on property review, title, market conditions, transaction eligibility, and agreed terms.",
    },
    {
      type: "cards",
      id: "inputs",
      tone: "light",
      heading: "What each input means",
      intro: "Better inputs give a more useful range. If you're unsure about any of them, choose “I'm not sure” and we'll review the property personally instead.",
      columns: 2,
      cards: [
        { title: "Location", body: "The state determines whether online estimates are available there and how we review the transaction. The address helps us look at the property later; we never price a home from an address alone." },
        { title: "Property type and size", body: "Some property types are reviewed individually. Size helps us sanity-check values and repair figures." },
        { title: "Condition", body: "A quick description of where the property stands today, from mostly cosmetic updates to major structural work." },
        { title: "After-repair value (ARV)", body: "What the home would likely sell for once the needed repairs are done, not its value today. Recent sales of similar, updated homes nearby are the best guide." },
        { title: "Repair budget", body: "Your rough estimate of the cost to bring the home to that after-repair condition. The built-in guide helps you add it up by area." },
        { title: "Timeline and occupancy", body: "Not used in the math, but they help us plan the review and talk about a closing date that works for you." },
      ],
    },
    {
      type: "prose",
      tone: "pale",
      heading: "How the range is calculated",
      paragraphs: [
        "A cash buyer generally starts from the after-repair value, then accounts for repairs, the costs of holding and reselling the property, the risk they take on and the compensation involved in the transaction. Our calculator follows the same logic using assumptions we set and review, run on our server so the result is consistent every time.",
        "The range runs from more conservative assumptions (a slightly lower value and a larger repair budget) to more optimistic ones. It reflects uncertainty in the inputs. It is not an appraisal and not a statistical confidence interval.",
        "When inputs are missing, unusual or outside what the tool handles, it doesn't invent a number. You'll see **“This property needs a personalized review”** and can send the details for a person to look at.",
      ],
    },
    {
      type: "cards",
      tone: "light",
      heading: "Hypothetical examples",
      intro: "These illustrate how inputs move a result. They are invented examples, not past transactions or quotes.",
      columns: 3,
      cards: [
        { title: "Hypothetical A: cosmetic updates", body: "A three-bedroom house with dated finishes and a modest repair budget. A smaller repair figure and a well-supported after-repair value usually produce a tighter range." },
        { title: "Hypothetical B: major systems", body: "The same house needing a roof, furnace and electrical work. A larger, less certain repair budget lowers the range and widens it." },
        { title: "Hypothetical C: unknown value", body: "The owner isn't sure what the home would sell for after repairs. The calculator routes this to a personal review rather than guessing." },
      ],
    },
    {
      type: "faq",
      tone: "pale",
      heading: "Why an estimate may change",
      groups: [
        {
          items: [
            { q: "Why might a written offer differ from the range?", a: "A review can reveal a different after-repair value, additional repairs, title issues or occupancy details that change the numbers. Market conditions also move. The written offer reflects what's verified." },
            { q: "Why don't you look up my home's value automatically?", a: "Online valuations can be stale or miss condition entirely, and using them requires authorized data access. We'd rather use your informed estimate now and confirm value during a review." },
            { q: "Why did I get “needs a personalized review”?", a: "Common reasons: no after-repair value or repair budget, a property type we review individually, a repair budget large relative to value, or a state where online estimates aren't enabled yet. None of these means we can't help." },
            { q: "Is my information saved?", a: "Calculator inputs are saved with the estimate so a reviewer can see what you entered if you request a review. Contact details are only collected if you choose to request one." },
            { q: "Does using the calculator obligate me?", a: "No. Estimates and review requests are free and don't commit you to anything." },
          ],
        },
      ],
    },
    {
      type: "cta",
      tone: "dark",
      heading: "Prefer to skip the numbers?",
      body: "Send the property details and a person will review them with you.",
      primary: { label: "Request a Property Review", href: "/contact#request", id: "calc_bottom_review" },
      secondary: { label: "Repairs planning guide", href: "/sell-house-needing-repairs#repair-guide", id: "calc_bottom_repairs" },
    },
  ],
};
