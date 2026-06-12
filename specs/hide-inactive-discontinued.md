# Feature: Hide Inactive and Discontinued Products (US-13)

## Problem
The default view should show only relevant inventory. Inactive and Discontinued
products must be hidden by default, with an opt-in to reveal each — tagged with a
distinct badge so they read as exceptional.

## Non-Goals
- No writing to the sheet; status is read verbatim.
- No filtering in `DataMapping` (see Behavior Rules — that would make the reveal
  toggles impossible).

## Behavior Rules
- Default visible set = **Active only**. Inactive, Discontinued, and any other/blank
  status are hidden. (AC-01/02/03)
- Status visibility is applied in the **core search/store layer, before any
  component** — never in `DataMapping` (mapping stays pure and complete) and never
  in a component. This is the only design where the reveal toggles can work; it
  also matches the US-03 precedent. (AC-04, reinterpreted)
- Two independent toggles ("Show Inactive Products", "Show Discontinued Products")
  relax the default: a hidden bucket appears only while its toggle is on. (AC-08/09)
- The default hide always applies (persists across search/refresh); the **toggles
  reset to off** on every successful new-search/refresh fetch. (AC-05 + AC-12)
- Hidden products are excluded from facet option lists and the results count
  (both derive from the status-visible universe). (AC-06/07)
- Revealed Inactive → grey "Inactive" pill; revealed Discontinued → muted-red
  "Discontinued" pill; both a **distinct visual family from Stock Status badges**
  (outline, no status dot). Active renders as plain text. (AC-10/11/13)
- Tokens only (no hardcoded values); mobile-first.

## Edge Cases
- Status blank or an unrecognized value → hidden by default, no toggle reveals it.
- Toggle on, then Refresh → toggle resets off, view returns to Active-only (AC-12).
- Reset Filters button also clears the toggles.
- A search that matches only Inactive/Discontinued rows shows the empty state until
  the matching toggle is turned on.

## Implementation Phases
- Phase 1 (core): `product-status.ts` — `resolveProductStatus`, `applyStatusVisibility`
  — verified by pure unit tests.
- Phase 2 (state): `FilterService` toggles (default off, reset) — verified by spec.
- Phase 3 (store): `statusVisible` universe feeds search/options/count; effect resets
  toggles on fetch — verified by store spec.
- Phase 4 (UI): `<stoqr-toggle>`, `<stoqr-status-badge>`, filter-panel + table/modal
  wiring, theme badge variants — verified visually.

## Test Plan
- RULE: only Active is visible by default; Inactive/Discontinued appear only with
  their toggle; blank/other never appear.
- RULE: hidden products are excluded from facet options and the count.
- `FilterService` toggles default false and reset.
- `resolveProductStatus` bucketing is case/space-insensitive.

## Acceptance Checks
- [ ] Active-only default; Inactive/Discontinued hidden (AC-01/02/03)
- [ ] Status filtering in core layer, mapping untouched (AC-04 reinterpreted)
- [ ] Toggles reveal with distinct badges; reset on search/refresh (AC-08–12)
- [ ] Hidden excluded from option counts + total count (AC-06/07)
- [ ] Badges distinct from stock badges; tokens only (AC-13)
- [ ] DECISIONS updated (revises US-03 Active-filter home); projectmap updated
