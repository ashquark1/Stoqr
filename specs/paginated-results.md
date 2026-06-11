# Feature: Paginated Search Results Display (US-03)

## Problem
After a search, users need to review matching products efficiently: a full
20-field table they can page through, and a detailed view per product. Without
it, fetched data has nowhere to render.

## Non-Goals
- No writing back to the sheet (read-only V1).
- No query-based filtering of the list (US-05) — US-03 renders the Active list.
- No sorting, column resize, or virtualization.
- Stock-status badge styling (US-04) — rendered as plain text here.
- Hero/topbar search-bar polish (US-05) — minimal input only.

## Behavior Rules
- Results render only after a valid search is triggered (gated on `hasSearched`). (AC-01)
- Table shows all 20 frontend fields as columns; one variant (sheet row) per row. (AC-02/03)
- Table is horizontally scrollable on overflow. (AC-04)
- Pagination: page sizes 10/25/50, default 25; first/prev/next/last; current/total
  pages; total count; "Showing {first} to {last} of {totalRecords} results". (AC-05–09)
- Only `Status = Active` products appear, filtered in `SheetsData.results`. (AC-10)
- Empty state with a clear message when no products match. (AC-11)
- Clicking a row opens a read-only modal of all 20 fields grouped Product / Stock /
  Pricing / Additional (8/5/4/3). (AC-12/13)
- Modal is read-only, close-only, restores scroll position on close. (AC-14/15)
- Styling via design tokens / PrimeNG `StoqrPreset` only; mobile-first.

## Edge Cases
- Missing numeric / blank string cell: rendered as the literal "empty"; `"-"` kept.
- Fetched rows all inactive: empty state (results is empty).
- Modal open while page scrolled: PrimeNG `blockScroll` locks + restores scroll.

## Implementation Phases
- Phase 1: deps (PrimeNG/@primeuix/themes/cdk), preset, aliases, includePaths.
- Phase 2: shared kit — `display-value`, `column-def`/`field-group`, `<stoqr-data-table>`,
  `<stoqr-modal>`, `empty-state`, `loading-overlay` — verified by unit tests.
- Phase 3: `SheetsData.results` Active filter + `isEmpty` — verified by service test.
- Phase 4: feature — `product-fields.ts` + orchestrator composition.

## Test Plan
- `displayValue`: null/empty/whitespace → "empty"; "-" kept; numbers incl. 0.
- `product-fields`: 20 columns; groups 8/5/4/3; sku is mono.
- `SheetsData.results`: only Active products; `isEmpty` when none Active.
- `<stoqr-data-table>`: renders headers + cells (null → "empty").
- `<stoqr-modal>`: emits close when visibility turns off.

## Acceptance Checks
- [x] All behavior rules hold (visual ACs 04/12/15 confirmed in-browser)
- [x] No hardcoded hex/font/spacing in component SCSS
- [x] docs/DECISIONS.md updated (2026-06-10: PrimeNG + architecture)
- [x] docs/AI_CONTRACT.md updated (shared/ui wrapper rule; PrimeNG approved)
- [x] docs/projectmap.md updated (Search & View components)
