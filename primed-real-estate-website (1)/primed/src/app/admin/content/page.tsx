import Link from "next/link";
import { guard } from "@/components/admin/guard";
import { allPages, hasOverride } from "@/content/loader";

export default async function ContentList() {
  await guard();
  const pages = allPages();
  return (
    <div>
      <h1 className="text-[2rem] font-bold">Page content</h1>
      <p className="mt-2 max-w-3xl text-fg-muted">Every core page's copy, SEO title, description, publish status and indexing are editable. Changes are validated before saving, and you can always reset a page to its original version.</p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {pages.map((p) => (
          <li key={p.slug}>
            <Link href={`/admin/content/${p.slug}`} className="card card-link block p-4">
              <span className="block font-semibold">{p.breadcrumb}</span>
              <span className="block text-[0.9rem] text-fg-muted">{p.path} · {p.published === false ? "draft (hidden)" : "published"}{p.noindex ? " · noindex" : ""}{hasOverride(p.slug) ? " · edited" : ""}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
