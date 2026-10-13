import type { NextConfig } from "next";

const isPreview = process.env.SITE_ENV !== "production";

const analytics = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER;
const scriptHosts = analytics === "plausible" ? " https://plausible.io" : analytics === "ga4" ? " https://www.googletagmanager.com" : "";
const connectHosts = analytics === "plausible" ? " https://plausible.io" : analytics === "ga4" ? " https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com" : "";

// Next.js inlines small bootstrap scripts, so 'unsafe-inline' is required for scripts unless nonces are added.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}${scriptHosts}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${connectHosts}`,
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  trailingSlash: false,
  serverExternalPackages: ["better-sqlite3"],
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    const h = [...securityHeaders];
    // Preview and staging environments are never indexed. Production indexing is controlled by SITE_ENV=production.
    if (isPreview) h.push({ key: "X-Robots-Tag", value: "noindex, nofollow" });
    return [
      { source: "/:path*", headers: h },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "no-store" }] },
      { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }, { key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;
