import type { PageContent } from "../types";

export const contact: PageContent = {
  slug: "contact",
  path: "/contact",
  published: true,
  noindex: false,
  breadcrumb: "Contact",
  seo: {
    title: "Contact Primed Real Estate | Request a Property Review",
    description:
      "Request a property review from Primed Real Estate or reach us as an investor. Share the property basics and your preferred contact method; there is no obligation.",
  },
  sections: [
    {
      type: "hero",
      eyebrow: "Contact and request an offer",
      heading: "Request a property review",
      intro:
        "Share the property basics and how you'd like us to reach you. A person reviews every request, and nothing you send commits you to anything.",
      primary: { label: "Submit My Property", href: "#request", id: "contact_hero_submit" },
      secondary: { label: "I'm an investor", href: "/investors#buy-box", id: "contact_hero_investor" },
    },
    {
      type: "component",
      name: "sellerForm",
      id: "request",
      tone: "pale",
      heading: "Your property",
      intro: "Details from the calculator or service-area map are carried over automatically in this browser tab.",
      props: { inquiryType: "property_review", submitLabel: "Submit My Property", formId: "contact" },
    },
    {
      type: "steps",
      tone: "light",
      heading: "What happens after you submit",
      steps: [
        { title: "Saved and reviewed", body: "Your request is saved securely and reviewed by a person, not an automated offer system." },
        { title: "We follow up", body: "We contact you by your preferred method with questions or to arrange a look at the property." },
        { title: "Options explained", body: "If the property fits, we explain any proposed written terms. If it doesn't, we tell you that too." },
      ],
    },
    {
      type: "component",
      name: "contactDetails",
      tone: "pale",
      heading: "Other ways to reach us",
    },
    {
      type: "faq",
      tone: "light",
      heading: "Before you send",
      groups: [
        {
          items: [
            { q: "What information do I need?", a: "The property's state and a way to reach you. Everything else is optional but helps us review faster." },
            { q: "Should I send documents?", a: "Not through this form. Please don't send ID documents, bank statements, account numbers or tenant records. If a review moves forward, we'll discuss what's appropriate to share and how." },
            { q: "Will you call me right away?", a: "We review requests individually and contact you by the method you choose. We don't promise a specific response time." },
            { q: "Can I just ask a question?", a: "Yes. Use the notes field for your question; a property address isn't required." },
          ],
        },
      ],
    },
  ],
};
