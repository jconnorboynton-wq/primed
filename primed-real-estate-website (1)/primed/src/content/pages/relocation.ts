import type { PageContent } from "../types";

export const relocation: PageContent = {
  slug: "relocation",
  path: "/sell-house-relocation",
  published: true,
  noindex: false,
  breadcrumb: "Relocating",
  parent: { label: "Sell your property", href: "/sell-your-house-for-cash" },
  seo: {
    title: "Selling a House When Relocating or Out of State | Primed",
    description:
      "Selling when you move or own property elsewhere: remote coordination, access, closing logistics and choosing a preferred date, with a simple timeline planner.",
  },
  sections: [
    {
      type: "hero",
      eyebrow: "Relocation and time-sensitive sales",
      heading: "Selling when you're moving, or already gone",
      intro:
        "A new job, a family move or a home you own in another state can make selling feel like one more thing to manage from afar. Here's how to plan the timing and logistics, with a simple planner to capture your preferred date.",
      primary: { label: "Tell Us My Timeline", href: "#planner", id: "rel_hero_timeline" },
      secondary: { label: "Estimate My Cash Offer", href: "/cash-offer-calculator", id: "rel_hero_estimate" },
    },
    {
      type: "cards",
      tone: "light",
      heading: "What remote ownership changes",
      columns: 2,
      cards: [
        { title: "Access", body: "Someone needs to let a reviewer in. That can be you on a planned visit, a neighbor, a property manager or a lockbox you authorize." },
        { title: "Condition from a distance", body: "It's hard to manage repairs or showings remotely. An as-is sale avoids coordinating contractors, though a listing may still bring a higher price." },
        { title: "Signing documents", body: "Title and escrow companies handle sellers in other states regularly. Whether you sign by mail, with a mobile notary or electronically depends on the company and the documents." },
        { title: "Belongings and utilities", body: "Decide what stays, schedule movers and plan when to stop or transfer utilities and insurance." },
      ],
    },
    {
      type: "component",
      name: "timelinePlanner",
      id: "planner",
      tone: "pale",
      heading: "Plan your preferred timeline",
      intro: "Capture the date you're aiming for and a few details. We'll add them to your request below. Nothing here is a commitment from either side.",
    },
    {
      type: "comparison",
      tone: "light",
      heading: "The appeal and the tradeoffs",
      caption: "Benefits and tradeoffs of a simpler as-is sale when relocating",
      rowHeader: "Topic",
      columns: ["Why it can help", "What to weigh"],
      rows: [
        { label: "Preparation", values: ["Little or no repair or staging to manage from afar", "Price usually reflects the work the buyer takes on"] },
        { label: "Timing", values: ["A closing date can be planned around your move", "Title issues or required steps can still cause delays"] },
        { label: "Coordination", values: ["Fewer visits and showings to arrange", "You still need access for at least one walkthrough"] },
        { label: "Remote closing", values: ["Many escrow companies work with remote sellers", "Remote notarization isn't available for every document or every place"] },
      ],
    },
    {
      type: "component",
      name: "sellerForm",
      id: "request",
      tone: "pale",
      heading: "Tell us about the property and your timeline",
      intro: "Your preferred date from the planner is filled in automatically. You can change it here.",
      props: { inquiryType: "property_review", submitLabel: "Tell Us My Timeline", showPreferredDate: true, formId: "relocation" },
    },
    {
      type: "faq",
      tone: "light",
      heading: "Relocation questions",
      groups: [
        {
          items: [
            { q: "Can you close by my move date?", a: "Sometimes. It depends on title, the property and the agreement. After reviewing them, we'll tell you whether your date looks realistic rather than promising one in advance." },
            { q: "Do I have to fly back to sign?", a: "Often not, but it depends on the escrow company and your documents. Ask them early about mail-away signing or notary options where you live." },
            { q: "Can I sell while I'm still living there?", a: "Yes. Possession timing, including staying for a short time after closing, can be negotiated in the agreement." },
            { q: "The property is in a different state from where I live. Does that matter?", a: "The property's location determines which state's rules apply to the sale. See [service areas](/service-areas) for how we review locations." },
          ],
        },
      ],
    },
  ],
};
