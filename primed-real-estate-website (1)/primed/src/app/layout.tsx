import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ClientBoot, MobileActionBar, Enhancements } from "@/components/ClientChrome";
import { JsonLd } from "@/components/JsonLd";
import { getSettings, getAllStateConfigs } from "@/lib/settings";
import { PublicConfigProvider } from "@/components/PublicConfig";
import { siteUrl, isProductionSite, BRAND } from "@/content/site";

const inter = localFont({ src: "../fonts/inter-latin-wght-normal.woff2", variable: "--font-inter", display: "swap", weight: "100 900" });
const montserrat = localFont({ src: "../fonts/montserrat-latin-wght-normal.woff2", variable: "--font-montserrat", display: "swap", weight: "100 900" });

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = getSettings();
  const url = siteUrl();
  return {
    metadataBase: url ? new URL(url) : undefined,
    applicationName: BRAND.name,
    robots: isProductionSite() ? undefined : { index: false, follow: false },
    verification: s.searchConsoleVerification ? { google: s.searchConsoleVerification } : undefined,
    openGraph: { siteName: BRAND.name, type: "website", locale: "en_US", images: url ? [{ url: "/brand/og-image.png", width: 1200, height: 630, alt: "Primed Real Estate logo" }] : undefined },
    twitter: { card: "summary_large_image" },
  };
}

export const viewport: Viewport = { themeColor: "#050607", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const s = getSettings();
  const url = siteUrl();
  const stateDisclosures = Object.fromEntries(Object.values(getAllStateConfigs()).filter((c) => c.disclosure).map((c) => [c.abbr, c.disclosure]));
  const org = url
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": `${url}/#organization`,
            name: BRAND.name,
            url,
            logo: `${url}/brand/logo-640.webp`,
            description: "Washington-based real estate wholesaling company reviewing property inquiries nationwide.",
            ...(s.email ? { email: s.email } : {}),
            ...(s.phone ? { telephone: s.phone } : {}),
            ...(s.socials.length ? { sameAs: s.socials.map((x) => x.url) } : {}),
          },
          { "@type": "WebSite", "@id": `${url}/#website`, url, name: BRAND.name, publisher: { "@id": `${url}/#organization` } },
        ],
      }
    : null;
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="min-h-screen antialiased">
        <SiteHeader labels={s.navLabels} logoSrc={s.logoPath} logoAlt={s.logoAlt} />
        <PublicConfigProvider value={{ marketingEmailProgram: s.marketingEmailProgram, marketingSmsProgram: s.marketingSmsProgram, smsProgramTerms: s.smsProgramTerms, stateDisclosures }}>
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
        </PublicConfigProvider>
        <SiteFooter s={s} />
        <MobileActionBar label={s.navLabels.cta} />
        <ClientBoot />
        <Enhancements />
        {org && <JsonLd data={org} />}
      </body>
    </html>
  );
}
