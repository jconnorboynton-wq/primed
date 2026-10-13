"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { SELL_MENU } from "@/content/site";
import { track } from "@/lib/analytics";

type Labels = { sell: string; calculator: string; areas: string; resources: string; about: string; investors: string; cta: string };

export function SiteHeader({ labels, logoSrc, logoAlt }: { labels: Labels; logoSrc: string; logoAlt: string }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const sellRef = useRef<HTMLDivElement>(null);

  // Header turns from glass to solid once the page scrolls.
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // Close menus on navigation.
  useEffect(() => {
    setMenuOpen(false);
    setSellOpen(false);
  }, [pathname]);

  // Lock background scroll only while the mobile menu is open; restore focus on close.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first = panelRef.current?.querySelector<HTMLElement>("a, button");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
      if (e.key === "Tab" && panelRef.current) {
        const f = Array.from(panelRef.current.querySelectorAll<HTMLElement>("a, button")).concat(menuBtn.current ? [menuBtn.current] : []);
        const i = f.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1]?.focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0]?.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      menuBtn.current?.focus();
    };
  }, [menuOpen]);

  // Desktop dropdown: close on outside click / Escape.
  useEffect(() => {
    if (!sellOpen) return;
    const onDown = (e: MouseEvent) => { if (!sellRef.current?.contains(e.target as Node)) setSellOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setSellOpen(false); sellRef.current?.querySelector("button")?.focus(); } };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [sellOpen]);

  const nav = [
    { href: "/cash-offer-calculator", label: labels.calculator },
    { href: "/service-areas", label: labels.areas },
    { href: "/resources", label: labels.resources },
    { href: "/about", label: labels.about },
  ];
  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const sellActive = SELL_MENU.some((l) => active(l.href));

  return (
    <header className="site-header tone-dark sticky top-0 z-40" data-scrolled={scrolled || menuOpen ? "true" : "false"} data-home={pathname === "/" ? "true" : "false"}>
      <a href="#main" className="sr-only-focusable absolute left-3 top-3 z-50 rounded bg-fg px-3 py-2 text-sm font-semibold text-ink">
        Skip to main content
      </a>
      <div className="mx-auto flex h-[76px] max-w-[1240px] items-center gap-4 px-4 sm:px-6">
        <span className="header-logo"><Logo src={logoSrc} alt={logoAlt} height={54} priority /></span>

        <nav aria-label="Main" className="ml-4 hidden flex-1 items-center justify-center gap-1 lg:flex">
          <div className="relative" ref={sellRef}>
            <button
              type="button"
              aria-expanded={sellOpen}
              aria-controls="sell-menu"
              onClick={() => setSellOpen((o) => !o)}
              className={`flex min-h-11 items-center gap-1 rounded-md px-3 text-[0.95rem] font-medium hover:text-silver-hi ${sellActive ? "text-silver-hi" : "text-fg"}`}
            >
              {labels.sell}
              <svg aria-hidden width="12" height="12" viewBox="0 0 12 12" className={`transition-transform ${sellOpen ? "rotate-180" : ""}`}><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" fill="none" /></svg>
            </button>
            {sellOpen && (
              <div id="sell-menu" className="absolute left-1/2 top-full mt-3 w-[640px] -translate-x-1/2 rounded-3xl border border-line-strong bg-black p-3 text-fg shadow-[0_40px_80px_-30px_rgba(0,0,0,.9)] backdrop-blur-xl">
                <ul className="grid grid-cols-2 gap-1">
                  {SELL_MENU.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="block rounded-2xl px-4 py-3 hover:bg-black focus-visible:bg-black" aria-current={active(l.href) ? "page" : undefined}>
                        <span className="block font-semibold">{l.label}</span>
                        <span className="block text-sm text-fg-muted">{l.desc}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {nav.map((l) => (
            <Link key={l.href} href={l.href} aria-current={active(l.href) ? "page" : undefined}
              className={`nav-link flex min-h-11 items-center rounded-md px-3 text-[0.94rem] font-medium hover:text-silver-hi ${active(l.href) ? "text-silver-hi" : "text-fg"}`}>
              {l.label}
            </Link>
          ))}
          <Link href="/investors" aria-current={active("/investors") ? "page" : undefined}
            className={`flex min-h-11 items-center rounded-md px-3 text-[0.9rem] hover:text-silver-hi ${active("/investors") ? "text-silver-hi" : "text-fg-muted"}`}>
            {labels.investors}
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Link href="/cash-offer-calculator" className="btn btn-primary hidden !min-h-11 !px-5 !text-[0.9rem] sm:inline-flex" onClick={() => track("cta_click", { cta_id: "header_estimate" })}>
            {labels.cta}
          </Link>
          <button
            ref={menuBtn}
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
            <svg aria-hidden width="22" height="22" viewBox="0 0 22 22">
              {menuOpen ? <path d="M5 5l12 12M17 5L5 17" stroke="currentColor" strokeWidth="1.8" /> : <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="mobile-menu" ref={panelRef} className="fixed inset-x-0 bottom-0 top-[76px] bg-ink z-40 overflow-y-auto border-t border-white/10 px-4 pb-10 pt-4 lg:hidden" role="dialog" aria-modal="true" aria-label="Site menu">
          <Link href="/cash-offer-calculator" className="btn btn-primary mb-5 w-full" onClick={() => track("cta_click", { cta_id: "mobile_menu_estimate" })}>{labels.cta}</Link>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-fg-muted">{labels.sell}</p>
          <ul className="mb-4 divide-y divide-white/10 border-y border-white/10">
            {SELL_MENU.map((l) => (
              <li key={l.href}><Link href={l.href} className="flex min-h-12 items-center py-2 text-[1.02rem]" aria-current={active(l.href) ? "page" : undefined}>{l.label}</Link></li>
            ))}
          </ul>
          <ul className="divide-y divide-white/10 border-y border-white/10">
            {[...nav, { href: "/investors", label: labels.investors }, { href: "/contact", label: "Contact" }].map((l) => (
              <li key={l.href}><Link href={l.href} className="flex min-h-12 items-center py-2 text-[1.02rem]" aria-current={active(l.href) ? "page" : undefined}>{l.label}</Link></li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
