import { notFound } from "next/navigation";
import { PageRenderer } from "@/components/PageRenderer";
import { getPage, pageMetadata } from "@/content/loader";
import Link from "next/link";
import { publishedResources } from "@/lib/resources";

export function generateMetadata() {
  return pageMetadata(getPage("resources"));
}

export default function Page() {
  const page = getPage("resources");
  if (page.published === false) notFound();
  const articles = publishedResources();
  return (
    <>
      <PageRenderer page={page} />
      {articles.length > 0 && (
        <section className="tone-light">
          <div className="mx-auto max-w-[1240px] px-4 pb-20 sm:px-6">
            <h2 className="mb-6 text-[1.85rem] font-bold">More articles</h2>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a) => (
                <li key={a.slug}><Link href={`/resources/${a.slug}`} className="card card-link block p-6"><span className="block font-display text-[1.15rem] font-bold">{a.title}</span><span className="mt-2 block text-fg-muted">{a.summary}</span></Link></li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
