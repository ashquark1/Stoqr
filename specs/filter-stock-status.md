# Feature: Filter by Stock Status (US-08)

## Problem
Users need to focus on items needing attention (e.g. Low / Out of Stock).
US-08 introduces the shared filter mechanism (panel + service) and the first
facet — Stock Status. US-09 (Category/Sub-category) and US-10 (Brand) extend it.

## Non-Goals
- No server-side filtering — all local over cached results (no API call).
- No Category/Sub-category/Brand here (US-09/10); no Show Inactive/Discontinued
  toggles (US-13). The panel reserves their slots in the locked order.

## Behaviour Rules
- A **collapsible filter panel** sits above the results, toggled by a "Filters"
  button that shows the active count "Filters (N)"; hidden by default. (AC-01/02/03)
- Stock Status is a **multi-select dropdown** with options In Stock / Low Stock /
  Out of Stock / Unknown, plus an explicit **"All"** option. (AC-04/05)
- **"All" is selected by default = no filter.** Selecting a real value clears All;
  selecting All clears the reals. "All" (empty selection) is not an active filter. (AC-06/07)
- Filtering is **local on cached results** and updates immediately. (AC-08/09)
- Active filters **persist** across new searches and Refresh. (AC-10)
- **Reset Filters** clears every facet. (AC-11)
- Status is matched by canonical **variant** (`resolveStockVariant`), so raw sheet
  strings (incl. blank → Unknown) map consistently.
- An option is **greyed/disabled** when absent from the current search results.
- **Empty state** when filters return no results. (AC-13)
- Panel is **full-width on mobile, 280px ≥768**; collapse animates 150ms. (AC-14)

## Architecture
- `core/filter/filter-service.ts` — `FilterService`: selected-set per facet
  (empty = All), `activeCount`, `reset`, `setSelected`, `selectedFor`.
- `core/filter/product-filter.ts` — pure `applyFilters` / `distinctValues` /
  `FilterOption`.
- `core/stock-status.ts` — variant resolver + `STOCK_VARIANTS` (moved from badge).
- `ProductSearchStore` — `searchResults`, `visibleProducts`, `statusOptions`
  (greying), `statusSelected`, `hasActiveFilters`.
- `shared/ui/filter-select/` — `<stoqr-filter-select>` (p-multiSelect + "All").
- `features/product-search/filter-panel/` — the panel; feature toolbar adds the
  toggle + active count + filter-aware empty-state copy.

## Test Plan
- `product-filter`: empty = All (no-op); keep-only-selected per facet; AND across.
- `filter-service`: default empty/0 active; selection counts active; reset clears.
- `ProductSearchStore`: status facet narrows visible products.

## Acceptance Checks
- [x] Collapsible panel + toggle with active count; hidden by default
- [x] Multi-select with "All" default = no filter; mutually exclusive
- [x] Local filtering, immediate, persists across search/refresh; Reset clears
- [x] Greying for absent options; empty state; responsive 280px
- [x] docs DECISIONS / AI_CONTRACT / projectmap updated
