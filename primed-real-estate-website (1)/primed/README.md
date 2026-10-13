# Primed Real Estate website

Marketing site, lead intake and owner admin for Primed Real Estate, a Washington-based real estate wholesaling team working nationwide.

**Stack:** Next.js 15.5 (App Router, server-rendered) · React 19 · TypeScript · Tailwind CSS 4 · SQLite (better-sqlite3) · Zod.

## What's included

| Area | Where |
| --- | --- |
| 15 core pages (content as validated data) | `src/content/pages/*.ts`, routes in `src/app/**/page.tsx` |
| Utility pages: privacy, terms, disclosures, thank-you, 404 | `src/app/privacy`, `terms`, `disclosures`, `thank-you`, `not-found.tsx` |
| Preliminary cash-offer calculator (server-side underwriting) | UI `src/components/Calculator.tsx`, engine `src/lib/estimator/engine.ts`, boundary `src/lib/estimator/service.ts`, API `src/app/api/estimate` |
| Net proceeds comparison | `src/components/NetProceeds.tsx` (on /resources) |
| "Which path fits?" situation finder (honestly recommends listing when that fits better) | `src/components/SituationFinder.tsx` (on the home page) |
| Offer checker: compare up to 3 written offers on net and risk | `src/components/OfferCompare.tsx` (on /resources#offer-checker) |
| Private request-status page for sellers (noindex, no contact details) | `src/app/status/[token]/page.tsx`, `getPublicStatus` in `src/lib/leads.ts` |
| US service-area map (all 50 states + DC, keyboard and list access) | `src/components/USMap.tsx`, data `src/data/us-map.json` (built by `npm run map:build`) |
| Seller and investor forms, durable storage, idempotency, honeypot, rate limits | `src/components/SellerForm.tsx`, `InvestorForm.tsx`, `src/lib/leads.ts`, `src/app/api/leads/*` |
| CRM/webhook adapter with outbox and retries | `src/lib/integrations.ts` |
| Owner admin: lead inbox (pipeline board, search, lead pages with notes, follow-ups, activity log, seller updates), CSV export, estimator versions, states, page content, articles, team, settings) | `/admin` → `src/app/admin/*` |
| Analytics adapter (PII-filtered, consent-aware) | `src/lib/analytics.ts`, `src/components/ClientChrome.tsx` |
| SEO: metadata, canonicals, sitemap, robots, JSON-LD | `src/content/loader.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/layout.tsx` |
| Docs | `docs/` (SEO map, launch checklist, verification report, measurement guide, expansion plan) |

## Run it locally

Requires Node.js 20.9+ (tested on 22).

```bash
npm install
cp .env.example .env.local
npm run hash-password -- "choose a long passphrase"   # paste output into ADMIN_PASSWORD_HASH
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"   # paste into SESSION_SECRET
# Optional for a demo: ESTIMATOR_PREVIEW_FIXTURE=true
npm run dev            # http://localhost:3000
```

The SQLite database is created automatically at `data/primed.db` on first request.

## Checks

```bash
npm run typecheck   # TypeScript
npm test            # estimator unit tests, including the $240,000 formula fixture
npm run build       # production build
npm run check       # typecheck + tests
```

## Deploy

The site needs a Node.js server with a **persistent disk** for the SQLite database and uploads (for example a VPS, Docker host, Render, Railway or Fly.io with a volume).

1. Set environment variables from `.env.example` (`SITE_ENV=production`, `NEXT_PUBLIC_SITE_URL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, `DATABASE_PATH`, `UPLOAD_DIR`).
2. `npm ci && npm run build && npm start` (listens on `PORT`, default 3000) behind HTTPS.
3. Back up `DATABASE_PATH` and `UPLOAD_DIR` regularly.

Serverless platforms with read-only or ephemeral file systems (e.g. default Vercel) won't keep SQLite data. To use one, replace `src/lib/db.ts` with a managed database (Postgres, Turso/libSQL); all data access goes through `src/lib/*` modules.

Rate limiting is in-memory per server instance and keys on `x-forwarded-for`; run behind a proxy that sets that header (and strips client-supplied values), or move limits to Redis for multiple instances.

## Configuration and content editing

Sign in at `/admin` with the owner password.

- **Settings:** public phone, email, hours, mailing address, social links, logo path and alt text, role statement, navigation labels, Search Console code, marketing programs (consent checkboxes appear only when a real program is switched on), public image uploads.
- **Page content:** every core page is JSON validated against `src/content/types.ts`. Edit copy, SEO title and description, `published` and `noindex`; reset to the original at any time. Text supports `**bold**` and `[link](/path)`.
- **Estimator:** create versioned underwriting assumptions (factor, fee mode, separate buyer costs, Primed costs, scenarios, bounds, rounding, eligible property types, optional repair model), activate a version, switch public estimates on or off and use the test bench. Values never reach the browser.
- **States:** per-state transaction status (manual review by default), online-estimate switch, private factor override, public note, approved disclosure text, review date and source reference. Inquiries are accepted from every state regardless.
- **Articles:** future resource articles (`/resources/<slug>`) as validated JSON, draft or published. Nothing is linked until published.
- **Team:** add profiles with photos and alt text, publish them and enable the section. While disabled or empty, nothing appears on the site.
- **Lead inbox** (`/admin/leads`): every website request lands here the moment it's submitted.
  - **Board** view: seller requests in columns (New, Contacted, Reviewing, Offer sent, Under contract, Closed). Urgent requests show at the top of New. **List** view and **search** (name, phone, email, city, address, ZIP, notes) for both sellers and investors.
  - **Lead page:** contact details with Call / Text / Email buttons and copy buttons, property and situation, the calculator result they saw (server record), attribution and consent.
  - **Pipeline:** change status, set a **follow-up date** (due and overdue follow-ups appear on the dashboard).
  - **Activity log:** private notes, logged calls/texts/emails, every status change, and **updates visible to the seller**, which appear on their private status page.
  - **Delete** (type DELETE to confirm) for privacy requests or junk. **CSV export** (formula-injection safe).
- **Seller status page:** after submitting, a seller gets a private link (`/status/<random token>`). It shows only the stage (Received → In review → Offer sent → Under contract → Closed), city and state, and the updates you chose to share. It's never indexed, never sent as a referrer and disappears if you delete the lead.

### Colors and background images

Black and silver only: gradient black backgrounds, silver text, headings and buttons, with color used only for status messages (errors, warnings, success). Tokens live at the top of `src/app/globals.css`.

Background images are in `public/images/bg-*.webp`. They're computer-rendered abstract art made by `scripts/render-backgrounds.py`. To replace them with AI-generated photos (prompts included) or set a different image for one page, see `docs/IMAGE-GUIDE.md`.

### Logo

The site uses the supplied logo with its black background removed (`public/brand/logo-cutout-720.webp`, plus 180/360 sizes and a full-size `logo-cutout.png`). The artwork itself is unchanged: not redrawn or recolored. The cutout was made with `scripts/cutout-logo.py` (run `python3 scripts/cutout-logo.py public/brand/primed-real-estate-logo-original.png public/brand`; needs Pillow, NumPy and SciPy):

1. Measure each pixel's brightness. The background is near-black (about RGB 7,7,8); the chrome lettering is much brighter.
2. Build a transparency mask with a smooth ramp: darker than 24/255 becomes fully transparent, brighter than 58/255 fully opaque, with a soft blend between so edges stay anti-aliased.
3. Remove the faint brushed scratches in the background: keep only large connected bright shapes (the house, "PRE" and the wordmark) and drop small specks. The "PRIMED REAL ESTATE" line is protected so thin letters aren't lost.
4. Feather the mask by about a pixel, then "un-mix" the black from semi-transparent edge pixels so there's no dark halo on any background.
5. Crop to the artwork plus 12 px padding and save PNG and WebP sizes.

The original is kept at `public/brand/primed-real-estate-logo-original.png`. The favicon (`src/app/icon.png`) is a square crop of the same artwork. To change the logo, upload the file in Settings and set its path.

### Estimator formula

```
seller contract price cap = ARV × buyer acquisition factor
                          − repair budget
                          − separately budgeted buyer costs/reserves (only items NOT inside the factor)
                          − target wholesale fee (flat or % of ARV)
                          − Primed transaction costs (excluding anything counted above)
```

Computed in integer cents for low/base/high scenarios, rounded down to the configured increment. Non-positive, inconsistent, out-of-bounds or incomplete inputs return **manual review**, never $0 or a floor. Public responses contain only the low–high range and plain-language assumptions; the base value and all settings stay server-side. Leads store the server's estimate record by ID; client-supplied numbers are ignored.

### Analytics events

`cta_click`, `seller_form_start`, `seller_inquiry_submitted`, `calculator_start`, `calculator_step_complete`, `estimate_generated`, `estimate_manual_review`, `reviewed_offer_requested`, `state_selected`, `eligibility_inquiry_submitted`, `investor_form_start`, `investor_inquiry_submitted`, `contact_click`, `net_proceeds_compared`. Payloads pass an allowlist (route, CTA id, step, state code, form, method, inquiry type, mode, result) and drop anything resembling an email, ZIP, phone or dollar amount. Conversions fire only after a durable save and are de-duplicated per submission.

## Security notes

- Admin pages, server actions and APIs each verify the signed session on the server; middleware is only a first gate. Login is rate-limited.
- Cross-site POSTs to the public APIs are rejected by Origin check; server actions use Next.js's built-in origin protection.
- Security headers: CSP, HSTS, nosniff, frame and referrer policy. Admin and API responses are `no-store` and `noindex`.
- Uploaded images are type, size and magic-byte checked, stored outside `public/`, and served only once published (team) or marked public (settings).
- Public forms never ask for ID documents, bank statements, SSNs or tenant records.
