# Owner launch checklist (private)

The site is complete and runs today. These are the real-world facts, accounts and decisions only you can supply before it collects live leads.

## 1. Legal and business setup (do first)

- [ ] **Have the transaction structure reviewed by a Washington real estate attorney**, including how you contract, assign and disclose your role. Washington broker licensing is under chapter 18.85 RCW (Department of Licensing).
- [ ] **State by state:** before approving transactions in any state, review its rules for wholesalers. Some states require registration or specific written disclosures (for example, Oregon requires residential property wholesalers to register or be licensed and to give a written disclosure before contracting: oregon.gov/rea, "Residential Property Wholesaling"). Record the review date, source and any required disclosure text in **/admin/states**.
- [ ] Have the **privacy policy, website terms, disclosures page and role statement** reviewed. Edit the role statement in /admin/settings; the policies are in `src/app/privacy`, `terms` and `disclosures`.
- [ ] Confirm the Washington-specific statements on `/service-areas/washington` still match current law and rates (REET thresholds change January 1, 2027).

## 2. Facts and assets to add

- [ ] Public phone, email and contact hours (optional) → /admin/settings. Leave blank to keep them off the site.
- [ ] A mailing address, only if you want it published.
- [ ] Social profile URLs, if any.
- [ ] **Property imagery:** the site launches without photos because no licensed images were supplied. Upload images you own or have licensed (Settings → Upload a public image) and add them to page content. Avoid stock houses presented as purchases.
- [ ] Team profiles and photos when ready → /admin/team, then enable the section.
- [ ] A dedicated favicon, if you'd prefer one other than the square crop of the logo in `src/app/icon.png`.

## 3. Calculator

- [ ] Decide your real underwriting assumptions: buyer acquisition factor, fee mode and amount, separately budgeted buyer costs (only items not already inside the factor), your transaction costs, scenarios, ARV bounds, maximum repair ratio, rounding and eligible property types.
- [ ] Save them as a version in **/admin/estimator**, test with the test bench, then activate.
- [ ] Enable online estimates **per state** in /admin/states (all start off).
- [ ] Turn public estimates on. Until then, visitors see "needs a personalized review."
- [ ] Optional: a repair planning model ($/sq ft by condition), only if you have a defensible basis.
- [ ] Optional later: an address-autocomplete or valuation provider, only with licensed API access and terms that allow your use. Not included; the calculator never scrapes valuations.

## 4. Accounts and integrations

- [ ] Hosting with a persistent disk (see README → Deploy) and HTTPS.
- [ ] Domain → set `NEXT_PUBLIC_SITE_URL` and `SITE_ENV=production`.
- [ ] Owner password hash and session secret (`npm run hash-password`).
- [ ] CRM: if you use one, set `CRM_WEBHOOK_URL` and `CRM_WEBHOOK_SECRET`. Leads are saved on the site either way.
- [ ] Email or text notifications for new leads: not built in. Most CRMs and automation tools can notify you from the webhook.
- [ ] Analytics (optional): Plausible (cookieless) or GA4 (consent prompt included). Set `NEXT_PUBLIC_ANALYTICS_PROVIDER` and `NEXT_PUBLIC_ANALYTICS_ID`.
- [ ] Marketing email or SMS program: only switch the consent checkboxes on in Settings when a real, compliant program exists; add SMS terms.
- [ ] Google Search Console: add the HTML-tag verification code in Settings, then submit `/sitemap.xml`.

## 5. Go-live switch

- [ ] `SITE_ENV=production`, `LEADS_TEST_MODE=false`, `ESTIMATOR_PREVIEW_FIXTURE` unset.
- [ ] Submit one real test inquiry and confirm it in /admin/leads (and your CRM, if connected). Then mark it `spam` or delete it.
- [ ] Check `/robots.txt` allows crawling and `/sitemap.xml` lists the 15 pages plus policies.
- [ ] Set up database backups.
