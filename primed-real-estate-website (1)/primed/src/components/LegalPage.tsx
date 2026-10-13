import Link from "next/link";
import type { ReactNode } from "react";

export function LegalPage({ title, intro, updated, children, crumb }: { title: string; intro: string; updated: string; children: ReactNode; crumb: string }) {
  return (
    <>
      <section className="hero-glow tone-dark relative overflow-hidden">
        <div aria-hidden className="photo-bg" style={{ backgroundImage: "url(/images/bg-brushed.webp)" }} />
        <div aria-hidden className="photo-fade-hero" />
        <div className="relative mx-auto max-w-[880px] px-4 pb-14 pt-8 sm:px-6">
          <nav aria-label="Breadcrumb" className="mb-8 text-[0.88rem] text-fg-muted">
            <ol className="flex gap-1.5"><li><Link href="/" className="hover:underline">Home</Link></li><li aria-hidden>/</li><li aria-current="page" className="text-fg">{crumb}</li></ol>
          </nav>
          <h1 className="metal-text text-[2.2rem] font-extrabold sm:text-[2.8rem]">{title}</h1>
          <p className="mt-4 text-[1.1rem] text-fg-2">{intro}</p>
          <p className="mt-3 text-[0.9rem] text-fg-muted">Last updated {updated}</p>
        </div>
      </section>
      <section className="tone-light">
        <div className="legal mx-auto max-w-[880px] px-4 py-14 sm:px-6 [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-[1.45rem] [&_h2]:font-bold [&_li]:mb-1.5 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_a]:underline [&_a]:underline-offset-2">
          {children}
        </div>
      </section>
    </>
  );
}
