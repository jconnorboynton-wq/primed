import { notFound } from "next/navigation";
import Link from "next/link";
import { guard } from "@/components/admin/guard";
import { getPage, hasOverride, type PageSlug } from "@/content/loader";
import { PAGES } from "@/content/pages";
import { ActionForm } from "@/components/admin/ActionForm";
import { savePageContent, resetPageContent } from "../../actions";

export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  await guard();
  const { slug } = await params;
  if (!(slug in PAGES)) notFound();
  const page = getPage(slug as PageSlug);
  return (
    <div>
      <p><Link href="/admin/content" className="underline">← All pages</Link></p>
      <h1 className="mt-2 text-[2rem] font-bold">Edit: {page.breadcrumb}</h1>
      <div className="mt-3 max-w-3xl space-y-2 text-[0.95rem] text-fg-muted">
        <p>Edit the JSON below. Text supports <code>**bold**</code> and <code>[link text](/path)</code>. Set <code>"published": false</code> to hide the page, or <code>"noindex": true</code> to keep it out of search results. <code>seo.title</code> is 10–70 characters and <code>seo.description</code> 50–170.</p>
        <p>Section types: hero, prose, list, cards, steps, comparison, faq, cta, toc and component (calculator, map, sellerForm, investorForm, netProceeds, repairGuide, timelinePlanner, team, investorEmpty, contactDetails).</p>
      </div>
      <ActionForm action={savePageContent} submitLabel="Save and publish" className="mt-5">
        <input type="hidden" name="slug" value={slug} />
        <label htmlFor="json" className="field-label">Page content (JSON)</label>
        <textarea id="json" name="json" rows={32} spellCheck={false} className="field font-mono text-[0.85rem]" defaultValue={JSON.stringify(page, null, 2)} />
      </ActionForm>
      {hasOverride(slug) && (
        <form action={resetPageContent} className="mt-4">
          <input type="hidden" name="slug" value={slug} />
          <button className="btn btn-secondary !min-h-10">Reset to original content</button>
        </form>
      )}
      <p className="mt-6"><a href={page.path} target="_blank" rel="noopener" className="underline">View page</a></p>
    </div>
  );
}
