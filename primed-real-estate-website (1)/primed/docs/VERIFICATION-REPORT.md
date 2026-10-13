# Verification report

Run on October 12, 2026 against a production build (`next build` + `next start`) in preview mode with the documented test fixture enabled.

## Verified in this build

| Area | Result |
| --- | --- |
| TypeScript (`tsc --noEmit`) | Pass |
| Production build | Pass, all 15 core routes plus utility routes server-rendered |
| Estimator unit tests (`npm test`, 12 tests) | Pass, including the formula fixture: ARV $400,000 × 0.80 − $40,000 − $15,000 − $20,000 − $5,000 = **$240,000**; ordered low ≤ base ≤ high; negative/NaN/infinite/out-of-range inputs, missing values, non-positive caps, excessive repair ratios, disabled states and ineligible property types all return manual review; cent-accurate arithmetic |
| Page content schema | All 15 pages validate against the content model (titles 45–59 chars, descriptions ≤ 170) |
| Route status | 15 core pages, privacy, terms, disclosures, thank-you = 200; unknown path = branded 404; `/admin` redirects to login |
| Browser end-to-end (Chromium, 27 checks) | Pass: hero → calculator handoff; validation and error summary; range shown with preview label and required disclaimer; no fee or factor in page; reviewed-offer request saved; unknown value/repairs → manual review with no number; map click, arrow-key navigation, Enter, search; map → contact carries state with no personal data in URL; contact, investor, foreclosure (deadline) forms; net proceeds math; timeline planner → form; mobile menu open, scroll lock, Escape + focus return; team section hidden; zero console errors with CSP enabled |
| Owner admin end-to-end (18 checks) | Pass: login (wrong password rejected); dashboard warnings; leads list; CSV export; save + activate estimator version; live mode honors per-state switch; live estimate uses owner config; approval requires a review date; content edit publishes, invalid JSON rejected, reset restores; team hidden until a profile is published; sign-out revokes API access |
| API security | Client-supplied factor/fee/config fields ignored (identical result); responses contain only status, range, mode, model label, assumptions and estimate ID; cross-origin POST → 403; unauthenticated admin API → 401; same idempotency key twice → one row; honeypot → success response, nothing stored; forged estimate data not stored (server attaches its own record by ID); estimate rate limit returns 429 after 20/min |
| Secrets in client bundles | None: no underwriting field names, fixture, session or password variables in `.next/static` |
| Accessibility (axe-core, WCAG 2.0/2.1/2.2 A and AA rules) | 0 violations on all 15 core pages, policies, admin login and 404, at 1280 px and 390 px |
| Mobile layout | No horizontal scrolling at 390 px on any core page (checked by script); screenshots reviewed at 390 and 1440 px |
| Lighthouse (lab, simulated mobile, warm server) | Home: Performance 94–96, Accessibility 100, Best Practices 100, LCP 2.6–3.0 s, TBT ~100 ms, CLS 0. Service areas: 96 / 100 / 100, LCP 2.6 s. Calculator: 95 / 100 / 100, LCP 2.9 s. The first cold-start run scored lower. SEO category reads 58 only because preview mode intentionally sets `noindex`. Lab LCP is slightly above the 2.5 s field target under throttling; judge real performance from field data after launch. |
| Redesign and new features (Oct 12 update, 32 browser checks) | Pass: transparent cutout logo in header and home hero; header logo hidden at top of home and shown on scroll; situation finder recommends a listing or an as-is sale from the answers and adds the right first stop (lender/housing counselor, probate, lease, co-owners); offer checker computes net per offer, marks highest net and fewest flags, flags small deposits, long review periods, loans, assignment and missing proof of funds; seller submission shows a private status link; status page shows the stage, city and state only, is noindex, sends no referrer and returns 404 for unknown or deleted leads; owner inbox board and list views, search by name/phone, lead page with call/text/email, status change logged, private notes vs. seller-visible updates (only the latter appear on the status page), follow-up dates with overdue items on the dashboard, delete requires typing DELETE |
| Accessibility after redesign | axe-core: 0 violations at 1280 px and 390 px on all public pages, the status page and the owner dashboard, inbox (board and list) and lead page; no horizontal scrolling |
| Security headers | CSP, HSTS, nosniff, frame and referrer policies present; preview sends `X-Robots-Tag: noindex` |

## Not verifiable here (needs your accounts or production)

- CRM webhook delivery: the outbox, signing and retry logic are implemented, but no endpoint was configured and delivery is held in test mode by design.
- Analytics providers (Plausible/GA4): adapter and consent prompt implemented; no account IDs were supplied.
- Production indexing, canonicals, sitemap entries and structured data: emitted only once `NEXT_PUBLIC_SITE_URL` and `SITE_ENV=production` are set. Preview correctly returns an empty sitemap and a blocking robots.txt.
- Search Console verification: field provided in settings; needs your code.
- Address autocomplete and valuation data: intentionally not connected (no licensed provider supplied).
- Field Core Web Vitals: require real traffic.
- Legal sufficiency of policies, disclosures and state eligibility: needs attorney review (see the launch checklist).
- Multi-instance hosting: rate limits are per instance (see README).

## Not included by design

No invented testimonials, ratings, team members, offices, transaction counts, licenses, phone numbers or addresses. No stock imagery. No FAQ structured data (Google retired FAQ rich results in May 2026). No fabricated search volumes or ranking claims.
