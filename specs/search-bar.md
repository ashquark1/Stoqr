# Feature: Search Bar as Primary UI (US-05)

## Problem
The search bar is the product's primary entry point. It must be a prominent,
centered hero on load, transition to a compact top bar once searching, and let
users find products across multiple fields with sensible field rules.

## Non-Goals
- No server-side search (filtering is client-side over the cached Active list).
- No fuzzy/ranked search — case-insensitive substring matching.
- No `⌘K` command palette (hint removed).

## Behaviour Rules
- Two states driven by `isSearchActive = hasSearched()`: hero (logo above a
  centered 52px/640px bar) ↔ active (inline logo + 44px/full bar in a sticky top
  bar, results below). CSS-transform transitions both ways. (AC-01/02/04/05/06/07/16)
- Multi-field search over the cached Active products:
  - Terms are whitespace-split, case-insensitive, **AND**-combined. (AC-10)
  - CORE fields (Name/Brand/SKU/Category) match independently. (AC-11)
  - SECONDARY fields (Size/Color/Packing) match only when the query anchors on a
    core term. (AC-12 — anchor broadened to any core field)
  - Secondary-only query → message "Please include a product name or brand in
    your search." (AC-13)
- Editing the query after fetch filters the cache locally (no refetch). (AC-14)
- Returning to the hero (State 1) happens **only when the box is fully cleared**
  (empty/whitespace-only) — that clears results + cache. Reducing to 1-2 chars
  after searching stays in the results state and filters locally. (revised AC-15;
  the 3-char threshold governs only *starting* a fetch from the hero)
- Refresh visible whenever results show; forces a fetch and updates the cache. (AC-17/18/19)
- Placeholder: "Search by product name, SKU, brand or category...". (AC-20)
- Keyboard navigable + screen-reader friendly (`role="search"`, aria-labels). (AC-21)
- Styling via design tokens / theme classes only; mobile-first.

## Deviations from the original ACs (approved)
- **AC-03 prompt removed** — no "Search for a product to get started" line.
- **AC-12 anchor** broadened from Name/Brand to any core field.
- **AC-15 reset** narrowed: return to hero only on a fully cleared box, not below
  3 chars (1-2 chars after searching stays active and filters locally).
- Search + Refresh buttons: icon-only on mobile, icon+text ≥768; the input's
  inner magnifier was removed (icon now lives on the Search button).

## Edge Cases
- Secondary-only query still fetches first (validation needs cached rows to
  classify terms), then shows the message with no table.
- A term matching no eligible field → empty results (not the message).
- Narrow screens: bar shrinks (`min-width:0`), placeholder ellipsises, buttons
  collapse to icon-only.

## Implementation
- `core/search/`: `search-fields.ts`, `product-matcher.ts` (pure),
  `SearchValidation`, `ProductSearchStore` (`visibleProducts` + `message`).
- `shared/ui/logo/`: `<stoqr-logo [inline]>` (currentColor mark, hero/active).
- `features/product-search/`: two-state layout + matched icon buttons; reuses the
  US-03 table/modal and US-04 badge via `cellTemplates`.

## Test Plan
- `product-matcher`: core-independent; AND terms; secondary needs anchor; no match.
- `search-validation`: message for secondary-only; null when anchored/empty/gibberish.
- `ProductSearchStore`: filters cached active products; message hides results.
- `<stoqr-logo>`: hero vs inline lockup.

## Acceptance Checks
- [x] Two-state animated layout, mobile-first (verified in-app)
- [x] Multi-field rules + secondary validation
- [x] Local filter on edit; Refresh forces fetch
- [x] No hardcoded hex/font/spacing in component SCSS
- [x] docs/DECISIONS.md + docs/projectmap.md updated
