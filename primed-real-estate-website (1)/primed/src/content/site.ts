/** Public, non-secret brand and navigation structure. Labels can be renamed in /admin/settings. */

export const BRAND = {
  name: "Primed Real Estate",
  short: "Primed",
  tagline: "A clearer path to selling your property.",
  base: "Washington State",
};

export const SITUATION_LINKS = [
  { href: "/sell-inherited-property", label: "Inherited property", desc: "Co-owners, belongings, distance and estate questions" },
  { href: "/sell-house-needing-repairs", label: "House needing repairs", desc: "Deferred maintenance, damage or dated interiors" },
  { href: "/sell-before-foreclosure", label: "Before a foreclosure deadline", desc: "Careful, time-sensitive review" },
  { href: "/sell-rental-property", label: "Rental property", desc: "Occupied or vacant, leases and access" },
  { href: "/sell-house-relocation", label: "Relocating or out of state", desc: "Remote ownership and timing" },
];

export const SELL_MENU = [
  { href: "/sell-your-house-for-cash", label: "Sell your house for cash", desc: "What an as-is cash purchase involves" },
  { href: "/how-it-works", label: "How it works", desc: "From inquiry to a written offer and closing" },
  ...SITUATION_LINKS,
];

/** Public URL used for canonicals, sitemap and structured data. Unset = no canonical/sitemap entries emitted. */
export function siteUrl(): string | null {
  const u = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!u || !/^https:\/\//.test(u)) return null;
  return u.replace(/\/$/, "");
}

export const isProductionSite = () => process.env.SITE_ENV === "production" && siteUrl() !== null;
