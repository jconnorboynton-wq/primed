import type { PageContent } from "../types";

export const inherited: PageContent = {
  slug: "inherited",
  path: "/sell-inherited-property",
  published: true,
  noindex: false,
  breadcrumb: "Inherited property",
  parent: { label: "Sell your property", href: "/sell-your-house-for-cash" },
  seo: {
    title: "Selling an Inherited House: Practical Options | Primed",
    description:
      "Selling an inherited home: co-owners, belongings, distance, condition and confirming authority to sell, with a preparation checklist and an options comparison.",
  },
  sections: [
    {
      type: "hero",
      eyebrow: "Inherited property",
      heading: "Selling a home you've inherited",
      intro:
        "Inheriting a house often arrives alongside grief, family conversations and a long list of decisions. This page covers the practical side, at whatever pace is right for you.",
      primary: { label: "Discuss My Inherited Property", href: "#request", id: "inh_hero_discuss" },
      secondary: { label: "Estimate My Cash Offer", href: "/cash-offer-calculator", id: "inh_hero_estimate" },
    },
    {
      type: "prose",
      tone: "light",
      heading: "First, who can sell?",
      paragraphs: [
        "Before any sale, someone has to have legal authority to sign. Depending on how the property was held and your state's rules, that might be a personal representative or executor appointed by a court, a trustee of a trust that owned the home, a surviving joint owner, or all of the heirs together.",
        "Probate and estate rules vary by state and by situation. We can't tell you whether probate is needed or how long it will take, and we won't suggest it can always be avoided or hurried. An estate attorney, or the attorney already handling the estate, is the right person to confirm who can sign and when.",
        "What we can do is review the property, explain what a possible as-is sale would look like and coordinate timing around the estate's steps, so you're not trying to sell before you have the authority to.",
      ],
      aside: {
        title: "This page is general information",
        items: [
          "Not legal, tax or probate advice",
          "Confirm authority to sell with an estate attorney",
          "Ask a tax professional about any tax effects of selling",
        ],
      },
    },
    {
      type: "cards",
      tone: "pale",
      heading: "Common practical questions",
      columns: 2,
      cards: [
        { title: "Several family members inherited it", body: "Co-owners usually all need to agree and sign, or the person with authority must act for the estate. It helps to agree early on whether to sell, keep or rent the property." },
        { title: "The house is full of belongings", body: "Many families want time to go through keepsakes. An as-is sale can allow what's left to stay, if the agreement says so. Set a date for removing anything you want to keep." },
        { title: "You live far away", body: "Distance makes repairs and showings hard to manage. A walkthrough can be scheduled with a local contact, and many title companies work with sellers in other states." },
        { title: "It needs work", body: "Older inherited homes often have deferred maintenance. Selling as-is avoids managing contractors from afar; listing after repairs may bring a higher price. Both are reasonable." },
        { title: "There's still a mortgage", body: "Payments may need to continue while the estate is settled. The loan is paid off from the sale at closing. Contact the servicer early to request information." },
        { title: "The home is vacant", body: "Vacant homes can need extra insurance and regular checks. Ask the insurer whether a vacancy policy is required." },
      ],
    },
    {
      type: "list",
      tone: "light",
      heading: "Preparation checklist",
      intro: "You don't need all of this to request a review, but each item makes the process smoother.",
      style: "check",
      columns: 2,
      items: [
        "Confirm who has legal authority to sell (attorney or court documents)",
        "Gather the death certificate and any letters testamentary or trust documents your attorney advises",
        "Find the most recent mortgage, tax and insurance statements",
        "List everyone who may have an ownership interest",
        "Decide which belongings to keep, and a date to remove them",
        "Note known repairs, leaks or safety issues",
        "Check utilities and insurance coverage while vacant",
        "Collect keys, garage openers and alarm codes",
      ],
    },
    {
      type: "comparison",
      tone: "pale",
      heading: "Options for an inherited home",
      caption: "Comparison of keeping, renting, listing or selling an inherited home as-is",
      columns: ["Keep or rent it", "List it", "Possible as-is sale"],
      rows: [
        { label: "Effort", values: ["Ongoing maintenance, management, insurance", "Clean-out, possible repairs, showings", "Walkthrough; belongings can often stay"] },
        { label: "Price", values: ["No sale price; ongoing income or use", "Often the highest price, depending on condition", "Usually lower, reflecting repairs and buyer costs"] },
        { label: "Family agreement", values: ["Co-owners must agree on management and costs", "All signers must agree on price and terms", "All signers must agree on price and terms"] },
        { label: "Timing", values: ["Indefinite", "Depends on preparation and market", "Planned around the estate's timeline"] },
      ],
      note: "Your attorney and tax adviser can help you weigh tax and estate considerations that this comparison doesn't cover.",
    },
    {
      type: "component",
      name: "sellerForm",
      id: "request",
      tone: "light",
      heading: "Tell us about the inherited property",
      intro: "Share what you know so far. It's fine if the estate isn't settled yet; mention where things stand in the notes.",
      props: { inquiryType: "property_review", submitLabel: "Discuss My Inherited Property", formId: "inherited" },
    },
    {
      type: "faq",
      tone: "pale",
      heading: "Inherited property questions",
      groups: [
        {
          items: [
            { q: "Can I sell before probate is finished?", a: "It depends on your state, the court process and who has authority. In some cases a personal representative can sell during probate; in others more steps are required. Your estate attorney can tell you." },
            { q: "One heir doesn't want to sell. What now?", a: "Co-owner disagreements are a legal and family matter. We can share what a sale might look like so everyone has the same information, but we don't take sides or give legal advice." },
            { q: "Do we have to empty the house?", a: "Not necessarily. Many as-is agreements let remaining items stay. Remove anything you want to keep before closing, and confirm in writing what's included." },
            { q: "Can you talk with our attorney?", a: "Yes, with your permission. Coordinating with the estate's attorney often makes timing clearer for everyone." },
          ],
        },
      ],
    },
  ],
};
