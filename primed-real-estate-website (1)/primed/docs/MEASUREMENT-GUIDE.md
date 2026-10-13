# Measurement guide

Page views say little about this business. Judge the site by **qualified conversations and outcomes**.

## What to track weekly

| Measure | Where it comes from |
| --- | --- |
| Seller inquiries (by inquiry type and state) | /admin/leads, `seller_inquiry_submitted` and `reviewed_offer_requested` events |
| Calculator completion: started → estimate or manual review → reviewed-offer request | `calculator_start`, `estimate_generated` / `estimate_manual_review`, `reviewed_offer_requested` |
| Share of inquiries that are a fit (your judgement, recorded as lead status) | Lead status: `reviewing`, `offer_sent`, `not_a_fit`, `spam` |
| Offers sent → under contract → closed | Lead status workflow |
| Investor buy boxes received, and matches made | `investor_inquiry_submitted`, investor lead status |
| Source of qualified leads | Lead attribution (landing page, UTM tags, referrer) in /admin/leads or the CSV export |

## Healthy signs

- Rising share of inquiries with useful property details (calculator or expanded form).
- Manual-review results still converting to requests (the honest "needs a review" path working).
- More `offer_sent` and `under_contract` per 100 inquiries over time, not just more inquiries.

## Campaign tagging

Use UTM tags on outreach links (for example `?utm_source=mailer&utm_campaign=pierce-oct`). The site stores first-touch tags with each lead without creating indexable duplicate pages (canonical URLs ignore query strings).

## Privacy rules built in

Analytics never receives names, contact details, addresses, ZIP codes or dollar amounts. Conversions fire only after the lead is saved and once per submission. Keep it that way if you add tools.

## Performance

Lab tests (Lighthouse, simulated mobile) are a guide only. Judge Core Web Vitals from real-user field data in Search Console once the site has traffic (targets: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at the 75th percentile).
