# Feature: Refresh Results (US-18) — reference story

## Problem
Users need to force-fetch the latest sheet data without reloading the page.

## Status
**Reference story — no new code.** All behaviour is implemented across US-05
(button + cache logic), US-06 (inline spinner) and US-07 (error toast). This file
maps each AC to where it lives and records the one intentional deviation.

## AC → implementation map
- AC-01 (visible above table when results shown) — `.results__toolbar` in
  `features/product-search/product-search.html` (active, non-loading branch).
- AC-02 (right-aligned) — toolbar `justify-content: space-between` (count left,
  button right) in `product-search.scss`.
- AC-03 (forces a fetch regardless of cache) — `SheetsData.refresh()` always
  emits the immediate trigger; `switchMap` cancels any in-flight request.
- AC-04 (cache updated after refresh) — the subscribe sets `_products` on success.
- AC-05 ("Refreshing…" + disabled) — `@if (refreshing())` label +
  `[disabled]="refreshing()"`. (Ellipsis per the US-06 decision.)
- AC-06 (inline spinner replaces icon) — `@if (refreshing())` swaps the refresh
  icon for a 14px `.stoqr-spinner`.
- AC-07 (returns to default on done/fail) — `_refreshing` cleared in the subscribe
  on both success and error paths.
- Button style — `.stoqr-refresh` (`@extends .stoqr-btn--secondary`), refresh icon.
- Failure toast (DoD) — US-07: refresh failure keeps the stale table + shows the
  top-center toast with Retry.

## Intentional deviation from the tech note
- The tech note says "on click, clear cache …". We **do not clear the cache** on
  refresh — doing so would blank the table, contradicting US-06 AC-07 / US-07
  AC-10 (table stays visible during refresh). The cache is **replaced atomically
  on success**; on failure the stale cache is kept.

## Spec-vs-implementation (kept as-is, by decision)
- Disabled opacity: theme value 0.45 (vs spec 0.4) — kept for button consistency.
- Active label: "Refreshing…" (ellipsis) vs "Refreshing..." — kept for app-wide
  consistency (US-06 decision).

## Tests (existing)
- `SheetsData`: refresh always re-fetches; sets `refreshing` (not `loading`);
  refresh failure keeps stale data + active state; retry re-fetches.

## Acceptance Checks
- [x] All ACs map to shipped behaviour (US-05/06/07)
- [x] No cache-clear-on-click (deliberate; table stays visible)
- [x] No new code required
