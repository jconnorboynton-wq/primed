"use client";

import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { captureAttribution } from "@/lib/handoff";
import { track } from "@/lib/analytics";

const HIDE_BAR_ON = ["/cash-offer-calculator", "/contact", "/investors"];

/** Compact mobile action bar. Hidden while a form field has focus so it never covers inputs or buttons. */
export function MobileActionBar({ label }: { label: string }) {
  const pathname = usePathname();
  const [formFocus, setFormFocus] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  useEffect(() => {
    const on = (e: FocusEvent) => setFormFocus(!!(e.target as HTMLElement)?.closest?.("form, [data-hide-actionbar]"));
    const onScroll = () => setScrolled(window.scrollY > 640);
    document.addEventListener("focusin", on);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    // Hide while any form, calculator or tool is on screen so the bar never covers inputs or buttons.
    const visible = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) en.isIntersecting ? visible.add(en.target) : visible.delete(en.target);
      setFormVisible(visible.size > 0);
    });
    const watch = () => document.querySelectorAll("main form, #calculator, #net-proceeds, footer").forEach((el) => io.observe(el));
    watch();
    const t = setTimeout(watch, 1500); // tools hydrate after load
    return () => { document.removeEventListener("focusin", on); window.removeEventListener("scroll", onScroll); io.disconnect(); clearTimeout(t); };
  }, [pathname]);
  if (HIDE_BAR_ON.some((p) => pathname.startsWith(p)) || pathname.startsWith("/admin") || formFocus || !scrolled || formVisible) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-black px-4 py-3 backdrop-blur lg:hidden tone-dark">
      <Link href="/cash-offer-calculator" className="btn btn-primary w-full" onClick={() => track("cta_click", { cta_id: "mobile_bar_estimate" })}>
        {label}
      </Link>
    </div>
  );
}

/** Captures first-touch attribution and loads the configured analytics provider (if any). */
export function ClientBoot() {
  const provider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER || "none";
  const id = process.env.NEXT_PUBLIC_ANALYTICS_ID || "";
  const [consent, setConsent] = useState<null | boolean>(null);

  useEffect(() => {
    captureAttribution();
    if (provider === "ga4") {
      try {
        const v = localStorage.getItem("primed.analyticsConsent");
        setConsent(v === null ? null : v === "yes");
        window.__primedConsent = v === "yes";
      } catch { setConsent(null); }
    }
  }, [provider]);

  const decide = (yes: boolean) => {
    try { localStorage.setItem("primed.analyticsConsent", yes ? "yes" : "no"); } catch {}
    window.__primedConsent = yes;
    setConsent(yes);
  };

  return (
    <>
      {provider === "plausible" && id && (
        <Script defer data-domain={id} src="https://plausible.io/js/script.tagged-events.js" strategy="afterInteractive" />
      )}
      {provider === "ga4" && id && consent === true && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${id.replace(/[^A-Z0-9-]/gi, "")}',{anonymize_ip:true,allow_google_signals:false});`}</Script>
        </>
      )}
      {provider === "ga4" && id && consent === null && (
        <div role="region" aria-label="Analytics choice" className="fixed inset-x-3 bottom-24 z-40 mx-auto max-w-xl rounded-2xl border border-line bg-surface p-4 text-[0.95rem] shadow-2xl lg:bottom-6">
          <p className="mb-3">We would like to use analytics cookies to understand how visitors use this site. No form contents or contact details are shared with analytics.</p>
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-primary !min-h-11" onClick={() => decide(true)}>Allow analytics</button>
            <button className="btn btn-secondary !min-h-11" onClick={() => decide(false)}>Decline</button>
            <Link href="/privacy" className="btn btn-ghost">Privacy policy</Link>
          </div>
        </div>
      )}
    </>
  );
}

export function TrackedLink({ href, ctaId, className, children }: { href: string; ctaId: string; className?: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={className} onClick={() => track("cta_click", { cta_id: ctaId })}>
      {children}
    </Link>
  );
}

/** Phone/email links that record a non-personal contact_click event (method only). */
export function ContactLink({ href, method, className, children }: { href: string; method: "phone" | "email"; className?: string; children: React.ReactNode }) {
  return (
    <a href={href} className={className} onClick={() => track("contact_click", { method })}>
      {children}
    </a>
  );
}

/**
 * Small visual enhancements: sections fade in as they scroll into view, and link cards get a soft
 * light that follows the pointer. Both are skipped for visitors who prefer reduced motion, and
 * content is fully visible if scripts never run (the hiding class is only added here).
 */
export function Enhancements() {
  const pathname = usePathname();
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) return;
    const root = document.documentElement;
    const items = Array.from(document.querySelectorAll<HTMLElement>("main [data-reveal]"));
    // Anything already on screen is shown immediately so nothing flashes.
    const vh = window.innerHeight;
    items.forEach((el) => { if (el.getBoundingClientRect().top < vh) el.classList.add("is-in"); });
    root.classList.add("js-reveal");
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach((el) => { if (!el.classList.contains("is-in")) io.observe(el); });
    const fallback = setTimeout(() => items.forEach((el) => el.classList.add("is-in")), 4000);
    const onMove = (e: PointerEvent) => {
      const card = (e.target as HTMLElement)?.closest?.<HTMLElement>(".card-link");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => { io.disconnect(); clearTimeout(fallback); document.removeEventListener("pointermove", onMove); };
  }, [pathname]);
  return null;
}
