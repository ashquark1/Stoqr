# Feature: Filter by Brand (US-10)

## Problem
Users want to view a specific brand's inventory. US-10 completes the filter panel
(US-08/09) with a searchable Brand facet.

## Behaviour Rules
- Brand is a **searchable multi-select dropdown**, last in the panel
  (Stock Status → Category → Sub-category → Brand). (AC-01/02)
- Options **derived dynamically** from cached data; refresh re-derives. (AC-03)
- Brand options **always show all brands**, independent of the selected Category
  or Sub-category. (AC-04)
- Inline **search input** filters the brand options within the dropdown
  (`showSearch` → PrimeNG `p-multiSelect [filter]`). (AC-05)
- Zero-result brands shown but **greyed/disabled**. (AC-06)
- Multiple values; local filtering, immediate, persists across search/refresh;
  Reset clears it; empty state on no results. (AC-07–12)

## Implementation
- `ProductSearchStore`: `brandOptions` = `optionsFrom('brand', Active set)` (the
  full Active set, so it ignores category/sub-category selections); `brandSelected`.
- `FilterPanel`: a `<stoqr-filter-select label="Brand" [showSearch]="true">`.
- The wrapper's `showSearch` reuses the same dropdown component (Category/
  Sub-category pattern) — just toggles the inline filter, as the tech note asks.

## Test Plan
- `ProductSearchStore`: brand options derive from data; unchanged by category
  selection (independence); brand facet narrows visible products.

## Acceptance Checks
- [x] Searchable brand dropdown; options independent of category/sub-category
- [x] Dynamic options; zero-result greyed; multi-select
- [x] Local + immediate; persists; Reset clears; empty state
- [x] No hardcoded brand values
