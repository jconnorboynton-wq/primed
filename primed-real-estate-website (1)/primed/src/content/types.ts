import { z } from "zod";

/**
 * Page content model. Every core page is data: owner edits in /admin/content are validated
 * against this schema and stored as overrides. Text fields accept a small, safe markup:
 *   **bold**  and  [link text](/internal-path or https://external)
 */

const cta = z.object({ label: z.string().min(1).max(60), href: z.string().min(1).max(200), id: z.string().max(60).optional() });
const tone = z.enum(["light", "pale", "dark"]).optional();

export const sectionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("hero"),
    eyebrow: z.string().max(80).optional(),
    heading: z.string().min(1).max(140),
    intro: z.string().max(600),
    primary: cta.optional(),
    secondary: cta.optional(),
    note: z.string().max(300).optional(),
    widget: z.enum(["addressStart", "none"]).optional(),
    /** Background image for this page's hero, e.g. /images/bg-roofline.webp or an uploaded /media/ file. */
    image: z.string().max(200).regex(/^\/(images|media)\/[\w.-]+$/, "Use a path like /images/name.webp or /media/name.webp").optional(),
  }),
  z.object({
    type: z.literal("prose"),
    id: z.string().max(60).optional(),
    tone,
    eyebrow: z.string().max(80).optional(),
    heading: z.string().max(140).optional(),
    paragraphs: z.array(z.string().max(1500)).min(1),
    aside: z.object({ title: z.string().max(100), items: z.array(z.string().max(300)) }).optional(),
  }),
  z.object({
    type: z.literal("list"),
    id: z.string().max(60).optional(),
    tone,
    heading: z.string().max(140),
    intro: z.string().max(800).optional(),
    style: z.enum(["check", "bullet", "numbered", "question"]),
    items: z.array(z.string().max(600)).min(1),
    columns: z.union([z.literal(1), z.literal(2)]).optional(),
    outro: z.string().max(800).optional(),
  }),
  z.object({
    type: z.literal("cards"),
    id: z.string().max(60).optional(),
    tone,
    eyebrow: z.string().max(80).optional(),
    heading: z.string().max(140),
    intro: z.string().max(800).optional(),
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    cards: z.array(z.object({ title: z.string().max(100), body: z.string().max(600), href: z.string().max(200).optional(), linkLabel: z.string().max(60).optional() })).min(1),
  }),
  z.object({
    type: z.literal("steps"),
    id: z.string().max(60).optional(),
    tone,
    eyebrow: z.string().max(80).optional(),
    heading: z.string().max(140),
    intro: z.string().max(800).optional(),
    steps: z.array(z.object({ title: z.string().max(100), body: z.string().max(700), who: z.string().max(80).optional() })).min(2),
    outro: z.string().max(600).optional(),
  }),
  z.object({
    type: z.literal("comparison"),
    id: z.string().max(60).optional(),
    tone,
    heading: z.string().max(140),
    intro: z.string().max(800).optional(),
    caption: z.string().max(200),
    rowHeader: z.string().max(40).optional(),
    columns: z.array(z.string().max(60)).min(2).max(4),
    rows: z.array(z.object({ label: z.string().max(100), values: z.array(z.string().max(400)) })).min(1),
    note: z.string().max(600).optional(),
  }),
  z.object({
    type: z.literal("faq"),
    id: z.string().max(60).optional(),
    tone,
    heading: z.string().max(140),
    groups: z.array(z.object({ title: z.string().max(80).optional(), items: z.array(z.object({ q: z.string().max(200), a: z.string().max(1500) })).min(1) })).min(1),
  }),
  z.object({
    type: z.literal("cta"),
    tone,
    heading: z.string().max(140),
    body: z.string().max(600),
    primary: cta,
    secondary: cta.optional(),
    note: z.string().max(300).optional(),
  }),
  z.object({
    type: z.literal("toc"),
    tone,
    heading: z.string().max(140),
    links: z.array(z.object({ label: z.string().max(120), href: z.string().max(120), summary: z.string().max(300).optional() })).min(1),
  }),
  z.object({
    type: z.literal("component"),
    id: z.string().max(60).optional(),
    tone,
    eyebrow: z.string().max(80).optional(),
    heading: z.string().max(140).optional(),
    intro: z.string().max(800).optional(),
    name: z.enum(["calculator", "map", "sellerForm", "investorForm", "netProceeds", "repairGuide", "timelinePlanner", "team", "investorEmpty", "contactDetails", "situationFinder", "offerCompare"]),
    props: z.record(z.union([z.string(), z.boolean(), z.number()])).optional(),
    after: z.string().max(800).optional(),
  }),
]);

export const pageSchema = z.object({
  slug: z.string(),
  path: z.string(),
  published: z.boolean().default(true),
  noindex: z.boolean().default(false),
  seo: z.object({
    title: z.string().min(10).max(70),
    description: z.string().min(50).max(170),
  }),
  breadcrumb: z.string().max(60),
  parent: z.object({ label: z.string(), href: z.string() }).optional(),
  sections: z.array(sectionSchema).min(1),
});

export type Section = z.infer<typeof sectionSchema>;
export type PageContent = z.input<typeof pageSchema>;
