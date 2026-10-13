import type { PageContent } from "../types";

export const foreclosure: PageContent = {
  slug: "foreclosure",
  path: "/sell-before-foreclosure",
  published: true,
  noindex: false,
  breadcrumb: "Before foreclosure",
  parent: { label: "Sell your property", href: "/sell-your-house-for-cash" },
  seo: {
    title: "Selling a House Before Foreclosure: Options | Primed",
    description:
      "A calm guide to selling before a foreclosure deadline: what shapes your options, why lender contact matters, free housing counseling and how we review urgent requests.",
  },
  sections: [
    {
      type: "hero",
      eyebrow: "Before a foreclosure deadline",
      heading: "Facing a foreclosure deadline",
      intro:
        "If you've received a default or sale notice, you have more people to talk to than you might think. A sale can be one option among several. Here's how to think it through, and how we handle time-sensitive requests.",
      primary: { label: "Request a Time-Sensitive Review", href: "#request", id: "fc_hero_review" },
      secondary: { label: "Free housing counseling", href: "#help", id: "fc_hero_help" },
    },
    {
      type: "prose",
      tone: "light",
      heading: "What shapes your options",
      paragraphs: [
        "Whether a sale is possible, and whether it makes sense, depends on a handful of facts: where the loan is in the foreclosure process, how much time remains before any scheduled sale, how much equity you have after the loan and other liens, whether the title is clear, and the rules where the property is located.",
        "With enough equity and time, a sale can pay off the loan at closing. With little or no equity, a sale may require the lender to agree to accept less than is owed, which is a decision only the lender can make. With very little time, a sale may not be able to close before the scheduled date.",
        "**An inquiry or a signed purchase agreement does not stop a foreclosure.** Only the lender, the trustee or a court can postpone or stop a sale. Keep communicating with your loan servicer, and keep every notice you receive.",
      ],
      aside: {
        title: "Do these now, whatever you decide",
        items: [
          "Call your loan servicer and ask about all available options",
          "Contact a HUD-participating housing counselor (free)",
          "Read every notice and write down every date",
          "Consider speaking with an attorney, especially if a sale date is set",
          "Be cautious of anyone who asks for upfront fees or for you to sign over your deed",
        ],
      },
    },
    {
      type: "cards",
      id: "help",
      tone: "pale",
      heading: "Free help you can contact today",
      intro: "These services are independent of Primed. We have no relationship with them.",
      columns: 3,
      cards: [
        { title: "HUD housing counseling", body: "HUD lists housing counseling agencies that can talk through foreclosure options at no cost. Call 800-569-4287 or search online.", href: "https://www.hud.gov/stat/sfh/housing-counseling", linkLabel: "HUD housing counseling" },
        { title: "CFPB counselor search", body: "The Consumer Financial Protection Bureau also offers a tool to find a housing counselor near you.", href: "https://www.consumerfinance.gov/find-a-housing-counselor/", linkLabel: "Find a housing counselor" },
        { title: "Washington homeowners", body: "Washington's Foreclosure Fairness Program offers free counseling, legal aid and mediation for eligible homeowners. Counseling line: 1-877-894-HOME (4663).", href: "https://www.commerce.wa.gov/homeownership/foreclosure-fairness/", linkLabel: "Foreclosure Fairness Program" },
      ],
    },
    {
      type: "comparison",
      tone: "light",
      heading: "Options people commonly explore",
      intro: "Which of these are available depends on your lender, your loan and your circumstances. A housing counselor can explain them for your situation.",
      caption: "Common options when facing foreclosure",
      rowHeader: "Option",
      columns: ["What it means", "Who decides", "Things to know"],
      rows: [
        { label: "Catch up or repayment plan", values: ["Bring the loan current over time", "Your lender", "May keep the home if affordable"] },
        { label: "Loan modification", values: ["Change the loan's terms", "Your lender", "Requires an application and review"] },
        { label: "Sell the property", values: ["Pay off the loan from sale proceeds", "You, with any buyer", "Needs enough equity and enough time to close"] },
        { label: "Short sale", values: ["Lender accepts less than owed", "Your lender", "Lender approval can take time; tax effects possible"] },
        { label: "Deed in lieu", values: ["Give the property to the lender", "Your lender", "Lender must agree; ask about any remaining balance"] },
      ],
      note: "General information, not legal or financial advice.",
    },
    {
      type: "prose",
      tone: "pale",
      heading: "How we handle a time-sensitive request",
      paragraphs: [
        "If you share a deadline in the form below, your request is flagged for priority review by a person. We'll look at whether a sale could realistically close in the time available, and we'll tell you honestly if it can't.",
        "We won't pressure you, count down a clock at you or promise that a sale will stop a foreclosure. We'll encourage you to keep working with your lender and a counselor at the same time, because those conversations can open options we can't.",
      ],
    },
    {
      type: "component",
      name: "sellerForm",
      id: "request",
      tone: "light",
      heading: "Request a time-sensitive review",
      intro: "The deadline field is optional. Please don't include loan numbers or Social Security numbers.",
      props: { inquiryType: "time_sensitive", submitLabel: "Request a Time-Sensitive Review", showDeadline: true, formId: "foreclosure" },
    },
    {
      type: "faq",
      tone: "pale",
      heading: "Foreclosure questions",
      groups: [
        {
          items: [
            { q: "Will selling to you stop the foreclosure?", a: "Not by itself. Only your lender, the trustee or a court can postpone or stop a sale. A completed sale that pays off the loan before the foreclosure sale ends the foreclosure because the debt is paid, but that depends on timing and equity." },
            { q: "How quickly will you respond?", a: "Urgent requests are flagged for priority human review. We don't promise a specific response time, so please also contact your lender and a housing counselor right away." },
            { q: "What if I owe more than the house is worth?", a: "Then a sale would likely need your lender's approval as a short sale. A housing counselor can explain how that works with your lender." },
            { q: "Someone offered to take over my deed and payments. Is that safe?", a: "Be very cautious. Arrangements where you sign over your deed while your name stays on the loan carry serious risks. Talk with a housing counselor or attorney before signing anything." },
          ],
        },
      ],
    },
  ],
};
