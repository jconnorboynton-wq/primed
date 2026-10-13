import Link from "next/link";

export default function NotFound() {
  return (
    <section className="brushed-dark tone-dark">
      <title>Page not found | Primed Real Estate</title>
      <meta name="robots" content="noindex" />
      <div className="mx-auto max-w-[880px] px-4 py-24 text-center sm:px-6">
        <p className="text-[0.8rem] font-semibold uppercase tracking-[0.2em] text-fg-muted">Page not found</p>
        <h1 className="metal-text mt-3 text-[2.4rem] font-extrabold sm:text-[3rem]">We couldn't find that page</h1>
        <p className="mx-auto mt-4 max-w-xl text-fg-2">The link may be old or mistyped. These are good places to start:</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary">Go to the home page</Link>
          <Link href="/cash-offer-calculator" className="btn btn-secondary">Cash offer calculator</Link>
          <Link href="/contact" className="btn btn-secondary">Request a property review</Link>
        </div>
      </div>
    </section>
  );
}
