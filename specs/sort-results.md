# Feature: Sort Search Results (US-14)

## Problem
Users need to scan results efficiently by ordering them by Product Name or Stock
Qty. Without sorting, results only appear in sheet order.

## Non-Goals
- No server-side sort; no new fetch (sort is local on already-filtered data).
- No multi-column sort; no sorting of columns other than Name and Stock Qty.
- Not using PrimeNG's built-in sort — sort is our own pure function + state.

## Behaviour Rules
- Only **Product Name** and **Stock Qty** headers are sortable; all others inert. (AC-01/02)
- Clicking a sortable header cycles **asc → desc → none** (3-state), single column;
  selecting a different column starts it at asc. (AC-03/04/07)
- Active column shows up (asc) / down (desc) arrow; inactive sortable headers show a
  neutral double-arrow. (AC-05/06)
- Sort is a **pure function** over the filtered `Product[]`, applied in the core
  search/store layer at: `… active filters → sort → paginate`. No component logic,
  no fetch. (AC-08)
- Name = case-insensitive alphabetical; Stock Qty = numeric; **empty/blank stock
  (`null`) always sorts last** in both directions; stable (ties keep sheet order).
- Default = no sort = sheet order. (AC-13)
- Sort **persists** across pagination, filter changes, and Refresh. (AC-09/10/11)
- Sort **resets on a new search** (a new search session start) — distinct from a
  Refresh, which keeps it. (AC-12)

## Edge Cases
- Stock Qty `null` → always last (never treated as 0).
- Third click on the active column → unsorted (sheet order restored).
- Refresh while sorted → same sort re-applied to the refreshed rows.
- New search while sorted → sort cleared.
- "Reset Filters" does NOT clear sort (sort is not a filter).

## Implementation Phases
- Phase 1 (core): `core/sort/product-sort.ts` — `sortProducts(products, sort)` pure —
  unit tests over name/qty/nulls/none/stability.
- Phase 2 (state): `core/sort/sort-service.ts` — `sort` signal + `cycle`/`reset` — spec.
- Phase 3 (data-access): `SheetsData.searchSerial` (ticks on new-search session start,
  not on refresh) — spec.
- Phase 4 (store): `sortedProducts` computed + reset effect off `searchSerial` — spec.
- Phase 5 (UI): `<stoqr-data-table>` sortable headers + indicators; `product-fields`
  flags; component wiring — contract test + visual.

## Test Plan
- RULE: sort is local — no `HttpClient` request is issued when sorting.
- `sortProducts`: name asc/desc (case-insensitive), qty numeric, nulls last both ways,
  `null` sort → original order, stable ties.
- `SortService`: 3-state cycle; new column → asc; reset.
- `SheetsData`: `searchSerial` ticks on new search, not on refresh.
- Store: sort persists on refresh/filter change, resets on new search.

## Acceptance Checks
- [ ] Only Name + Stock Qty sortable; 3-state cycle; single column (AC-01–07)
- [ ] Local, no fetch; correct pipeline position (AC-08)
- [ ] Persists across pages/filters/refresh; resets on new search (AC-09–12)
- [ ] Default sheet order; nulls last; pure & tested (AC-13)
- [ ] DECISIONS + projectmap updated
