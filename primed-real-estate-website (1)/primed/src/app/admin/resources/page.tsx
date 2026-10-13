import { guard } from "@/components/admin/guard";
import { allResources } from "@/lib/resources";
import { ActionForm } from "@/components/admin/ActionForm";
import { saveArticle, removeArticle } from "../actions";

const TEMPLATE = {
  slug: "your-article-slug",
  title: "Article title (10 to 110 characters)",
  description: "Search description between 50 and 170 characters that accurately summarizes the article.",
  summary: "One or two sentences shown under the title.",
  body: [{ heading: "First section", paragraphs: ["Paragraph text. Supports **bold** and [links](/resources)."] }],
  author: "",
  reviewedBy: "",
  publishedAt: "",
};

export default async function ResourcesAdmin() {
  await guard();
  const rows = allResources();
  return (
    <div>
      <h1 className="text-[2rem] font-bold">Resource articles</h1>
      <p className="mt-2 max-w-3xl text-fg-muted">Future articles live at /resources/your-slug. Drafts are never public or linked. Only add author or reviewer names for real people with real credentials. Remove empty author fields before saving.</p>
      <ActionForm action={saveArticle} submitLabel="Save article" className="card mt-6 p-6">
        <label htmlFor="json" className="field-label">Article (JSON)</label>
        <textarea id="json" name="json" rows={18} spellCheck={false} className="field font-mono text-[0.85rem]" defaultValue={JSON.stringify(TEMPLATE, null, 2)} />
        <div className="mt-3"><label htmlFor="status" className="field-label">Status</label><select id="status" name="status" className="field !w-auto"><option value="draft">Draft</option><option value="published">Published</option></select></div>
      </ActionForm>
      <h2 className="mt-8 text-[1.3rem] font-bold">Articles</h2>
      {rows.length === 0 ? <p className="card mt-3 p-5 text-fg-muted">No articles yet. The resource center shows only its built-in guides until you publish one.</p> : (
        <ul className="mt-3 space-y-3">
          {rows.map((r) => (
            <li key={r.slug} className="card p-4">
              <p className="font-semibold">{JSON.parse(r.json).title} <span className="ml-2 rounded bg-surface-3 px-2 py-0.5 text-[0.8rem]">{r.status}</span></p>
              <p className="text-[0.9rem] text-fg-muted">/resources/{r.slug} · updated {new Date(r.updated_at).toLocaleString()}</p>
              <details className="mt-2"><summary className="cursor-pointer text-[0.95rem] font-semibold">Edit</summary>
                <ActionForm action={saveArticle} submitLabel="Save article" className="mt-3">
                  <textarea name="json" rows={14} aria-label="Article JSON" spellCheck={false} className="field font-mono text-[0.85rem]" defaultValue={JSON.stringify(JSON.parse(r.json), null, 2)} />
                  <div className="mt-3"><label className="field-label" htmlFor={`st-${r.slug}`}>Status</label><select id={`st-${r.slug}`} name="status" defaultValue={r.status} className="field !w-auto"><option value="draft">Draft</option><option value="published">Published</option></select></div>
                </ActionForm>
              </details>
              <form action={removeArticle} className="mt-2"><input type="hidden" name="slug" value={r.slug} /><button className="text-[0.9rem] text-err underline">Delete</button></form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
