import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getResource } from "@/lib/resources";
import { Paragraphs } from "@/components/RichText";
import { JsonLd } from "@/components/JsonLd";
import { siteUrl, isProductionSite, BRAND } from "@/content/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = getResource((await params).slug);
  if (!a) return { title: "Not found", robots: { index: false } };
  const url = siteUrl();
  return {
    title: `${a.title} | ${BRAND.name}`,
    description: a.description,
    alternates: url ? { canonical: `${url}/resources/${a.slug}` } : undefined,
    robots: isProductionSite() ? undefined : { index: false },
  };
}

/** Future article pages. Only published articles render; drafts and unknown slugs return 404. */
export default async function Article({ params }: Props) {
  const a = getResource((await params).slug);
  if (!a) notFound();
  const url = siteUrl();
  return (
    <>
      <section className="brushed-dark tone-dark">
        <div className="mx-auto max-w-[880px] px-4 pb-14 pt-8 sm:px-6">
          <nav aria-label="Breadcrumb" className="mb-8 text-[0.88rem] text-fg-muted">
            <ol className="flex flex-wrap gap-1.5"><li><Link href="/" className="hover:underline">Home</Link></li><li aria-hidden>/</li><li><Link href="/resources" className="hover:underline">Resources</Link></li><li aria-hidden>/</li><li aria-current="page" className="text-fg">{a.title}</li></ol>
          </nav>
          <h1 className="metal-text text-[2.2rem] font-extrabold sm:text-[2.8rem]">{a.title}</h1>
          <p className="mt-4 text-[1.1rem] text-fg-2">{a.summary}</p>
          {(a.author || a.reviewedBy) && <p className="mt-3 text-[0.92rem] text-fg-muted">{a.author && <>By {a.author}</>}{a.author && a.reviewedBy && " · "}{a.reviewedBy && <>Reviewed by {a.reviewedBy}</>}</p>}
        </div>
      </section>
      <article className="tone-light">
        <div className="mx-auto max-w-[880px] px-4 py-14 sm:px-6">
          {a.body.map((b, i) => (
            <section key={i} className="mb-8">
              {b.heading && <h2 className="mb-3 text-[1.5rem] font-bold">{b.heading}</h2>}
              <Paragraphs items={b.paragraphs} />
            </section>
          ))}
        </div>
      </article>
      {url && (
        <JsonLd data={{
          "@context": "https://schema.org", "@type": "Article", headline: a.title, description: a.description,
          ...(a.author ? { author: { "@type": "Person", name: a.author } } : {}),
          ...(a.publishedAt ? { datePublished: a.publishedAt } : {}), dateModified: a.updatedAt,
          publisher: { "@id": `${url}/#organization` }, mainEntityOfPage: `${url}/resources/${a.slug}`,
        }} />
      )}
    </>
  );
}
