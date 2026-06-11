# Feature: Stock Status Badge (US-04)

## Problem
Users need to assess availability at a glance. A raw "In Stock"/"Low Stock"/etc.
text string in a 20-column table is easy to miss; a colored pill badge makes
status scannable, in both the table and the detail modal.

## Non-Goals
- No recomputation of stock status (it is read verbatim from the sheet).
- No new data fields; this is pure presentation over `stockStatus`.
- No theme colour changes (badge colours come from existing tokens).

## Behaviour Rules
- Every table row shows a stock-status badge in the Stock Status column. (AC-01)
- Variants: In Stock → green, Low Stock → yellow, Out of Stock → red,
  blank/unrecognised → neutral grey "Unknown". (AC-02–05)
- Badge colours are WCAG-AA (theme tokens, verified in stoqr-brand.md). (AC-06)
- Stock Qty value is colour-coded to match the status. (AC-07)
- Low Stock Threshold is its own column. (AC-08 — already present from US-03)
- The badge also appears in the modal's Stock Info group. (AC-09)
- Reusable `<stoqr-badge [status]>`; status→variant via a constant map (no status
  strings hardcoded in templates); styling uses CSS custom properties only.

## Edge Cases
- Matching is trimmed + case-insensitive ("in stock" == "In Stock").
- Unrecognised non-empty status (e.g. "Backordered") → unknown variant, label = the
  original text; blank → unknown variant, label "Unknown".

## Implementation
- `shared/ui/badge/stock-status.ts` — `StockVariant`, `STOCK_VARIANT_MAP`,
  `resolveStockVariant()`, `stockLabel()`.
- `shared/ui/badge/badge.ts` — `<stoqr-badge [status]>`, reuses `.stoqr-badge--*`.
- Table: `cellTemplates` for `stockStatus` (badge) and `stockQty` (colour-coded).
- Modal: data-driven `badge` flag on the `stockStatus` field.

## Test Plan
- `resolveStockVariant`: known/case/space variants; blank/unrecognised/null → unknown.
- `stockLabel`: trimmed status, or "Unknown" when blank.
- `<stoqr-badge>`: renders the correct `.stoqr-badge--*` class + label + dot per status.
- `product-fields`: `stockStatus` carries `badge: true`.

## Acceptance Checks
- [x] All four variants render with the spec colours (verified in-browser)
- [x] Stock Qty colour-coded; Low Stock Threshold is its own column
- [x] Badge in both table row and modal
- [x] Reusable component, constant-map resolution, token-only SCSS
- [x] docs/DECISIONS.md + docs/projectmap.md updated
