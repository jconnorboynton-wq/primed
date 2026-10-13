import type { PageContent } from "../types";

export const rental: PageContent = {
  slug: "rental",
  path: "/sell-rental-property",
  published: true,
  noindex: false,
  breadcrumb: "Rental property",
  parent: { label: "Sell your property", href: "/sell-your-house-for-cash" },
  seo: {
    title: "Sell a Rental Property, Occupied or Vacant | Primed",
    description:
      "Options for landlords selling a rental: occupied versus vacant, leases, deposits, access and tenants' rights, with an owner preparation checklist and FAQs.",
  },
  sections: [
    {
      type: "hero",
      eyebrow: "Rental property",
      heading: "Selling a rental property",
      intro:
        "Whether you're ready to stop managing tenants, rebalance your investments or sell a unit that needs work, a rental sale raises its own questions. Here's how we review occupied and vacant rentals.",
      primary: { label: "Review My Rental Property", href: "#request", id: "rent_hero_review" },
      secondary: { label: "Estimate My Cash Offer", href: "/cash-offer-calculator", id: "rent_hero_estimate" },
    },
    {
      type: "comparison",
      tone: "light",
      heading: "Occupied or vacant: what changes",
      caption: "How selling an occupied rental differs from selling a vacant one",
      columns: ["Occupied", "Vacant"],
      rows: [
        { label: "Access for walkthroughs", values: ["Coordinated with proper notice to the tenant under the lease and local law", "Easier to schedule"] },
        { label: "Lease", values: ["Usually continues; a buyer typically takes the property subject to it", "No lease to transfer"] },
        { label: "Deposits", values: ["Security deposits and prepaid rent are accounted for at closing as the agreement and law require", "Not applicable"] },
        { label: "Buyer interest", values: ["Appeals to buyers who want income; fewer owner-occupant buyers", "Broader buyer pool; possible renovation buyers"] },
        { label: "Carrying costs", values: ["Rent may offset costs during the sale", "You carry all costs until closing"] },
      ],
    },
    {
      type: "prose",
      tone: "pale",
      heading: "Tenants' rights stay part of the picture",
      paragraphs: [
        "A sale doesn't erase a lease or a tenant's rights. Existing agreements, notice requirements and state and local landlord-tenant laws continue to apply, and some places limit the reasons and timing for ending a tenancy, including when an owner sells. In Washington, see the [Residential Landlord-Tenant Act](https://app.leg.wa.gov/rcw/default.aspx?cite=59.18).",
        "We don't provide eviction services, and we don't promise that a property will be delivered vacant. If a buyer wants vacant possession, that has to be achieved lawfully and reflected in the agreement. If your tenants will stay, we'll talk about how the lease and deposit transfer at closing.",
        "Please don't send tenant names, contact details or lease documents through our website. If a review moves forward, we'll discuss what records are appropriate to share, and how.",
      ],
    },
    {
      type: "list",
      tone: "light",
      heading: "Owner preparation checklist",
      style: "check",
      columns: 2,
      items: [
        "Current rent, lease end date and whether the lease is month-to-month",
        "Security deposit and any prepaid rent held",
        "Recent operating costs: taxes, insurance, utilities you pay, HOA",
        "Known repairs and any open maintenance requests",
        "Your notice obligations for showing the unit",
        "Any local rental registration or inspection requirements",
        "Mortgage payoff estimate",
        "Whether you'd prefer to sell occupied or after a lawful move-out",
      ],
    },
    {
      type: "component",
      name: "sellerForm",
      id: "request",
      tone: "pale",
      heading: "Review my rental property",
      intro: "Choose the occupancy that fits. Don't include tenant names or lease documents.",
      props: { inquiryType: "property_review", submitLabel: "Review My Rental Property", showOccupancyNote: true, formId: "rental" },
    },
    {
      type: "faq",
      tone: "light",
      heading: "Rental property questions",
      groups: [
        {
          items: [
            { q: "Can I sell while the tenant is still there?", a: "Usually yes. Many rentals sell occupied, with the lease continuing under the new owner. Walkthroughs need proper notice under the lease and local law." },
            { q: "Will you remove my tenants?", a: "No. We don't provide eviction services. Any change in occupancy must follow the lease and the law, and is addressed in the purchase agreement." },
            { q: "What happens to the security deposit?", a: "It's typically transferred or credited to the buyer at closing so the new owner can return it when the tenancy ends, as required by law. Your escrow company handles the accounting." },
            { q: "I have several rentals. Can you review them together?", a: "Yes. Mention each property in your notes and we'll review them individually." },
          ],
        },
      ],
    },
  ],
};
