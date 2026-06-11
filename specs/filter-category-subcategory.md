# Feature: Filter by Category and Sub-category (US-09)

## Problem
Users need to narrow results to relevant product groups. US-09 adds the Category
and Sub-category facets to the filter panel built in US-08 (same dropdown + "All"
behaviour, same FilterService).

## Behaviour Rules
- Category and Sub-category are **multi-select dropdowns** inside the panel, in
  order Stock Status → Category → Sub-category → (Brand US-10). (AC-01/02)
- Options are **derived dynamically** from the cached Active data — no hardcoding;
  they update after Refresh. (AC-03)
- **Sub-category cascades:** options scoped to the selected categories; if no
  category is selected, all sub-categories are shown. (AC-04/05)
- Category/Sub-category options with **zero results in the current search are
  shown but greyed/disabled**. (AC-06/07)
- Multiple values per facet; local filtering, immediate, persists across
  search/refresh; Reset clears them with the rest. (AC-08–13)
- Empty state when filters return no results. (AC-14)

## Implementation
- `ProductSearchStore`:
  - `optionsFrom(facet, source)` — distinct values (sorted), `disabled` when
    absent from `searchResults`.
  - `categoryOptions` from the Active set; `subCategoryOptions` from a
    `subCategoryScope` (products whose category ∈ selected categories, or all).
  - `category/subCategorySelected` from `FilterService`.
- `FilterPanel` — adds the two `<stoqr-filter-select>` dropdowns + setters.

## Test Plan
- `ProductSearchStore`: category options derive from data (sorted); sub-category
  shows all when no category selected; cascades to the selected category; the
  facet narrows visible products.

## Acceptance Checks
- [x] Dynamic category/sub-category options; sub-category cascades on category
- [x] Zero-result options greyed; multi-select; local + immediate; persists
- [x] Reset clears them; empty state on no results
- [x] No hardcoded category/sub-category values
