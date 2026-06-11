# Feature: Strip Internal Fields (US-02)

## Problem
The Google Sheet carries an internal row identifier (`id`, conceptually `_row_id`)
used for backend/sheet bookkeeping. If it reaches the frontend it leaks internal
mapping data into component models, templates, and browser devtools. We need a
single, dedicated place that maps raw sheet rows to the typed `Product` model and
guarantees internal fields never escape it.

## Non-Goals
- No writing back to the sheet (V1 is read-only).
- No change to which 20 fields the frontend exposes.
- No runtime/remote configuration of the strip list — a code constant is enough.

## Behavior Rules
- All row→`Product` mapping and field stripping happen in one injectable service,
  `DataMapping` (`src/app/core/sheets/data-mapping.ts`). (AC-01)
- `_row_id`/`id` is never present on the `Product` model, in any signal, in any
  template, or in browser devtools. (AC-02, AC-03)
- The `Product` TypeScript interface does not declare `_row_id`/`id`. (AC-04)
- Internal columns are declared in a single configurable constant
  `INTERNAL_FIELDS = ['id']`; adding a future internal field is a one-line change
  there and nowhere else. (AC-06)
- Mapping is allowlist-based (only the 20 known column labels are emitted); the
  strip list is explicit defense-in-depth on top of that.
- `gviz-parse.ts` is limited to unwrapping the JSONP envelope; it does no mapping.

## Edge Cases
- Internal column reordered/renamed: mapping is by label, and `INTERNAL_FIELDS`
  matches normalized labels, so position changes do not leak the id.
- Column listed in `INTERNAL_FIELDS` that is also a Product field: it is stripped
  (the field falls back to its empty/null default) — used only to prove the list
  is data-driven; production lists only truly-internal columns.
- Empty sheet / absent table: mapping yields `[]` (no error).

## Implementation Phases
- Phase 1: extract mapping + `INTERNAL_FIELDS` into `DataMapping`
  (`core/sheets/data-mapping.ts`); slim `gviz-parse.ts` to unwrap only —
  verified by: `data-mapping.spec.ts`.
- Phase 2: rewire `SheetsData` to inject `DataMapping` — verified by: existing
  `sheets-data.spec.ts` stays green.

## Test Plan
- Rule: mapped `Product` has exactly 20 keys and contains no `id`/`_row_id`. (AC-05)
- Rule: `TestBed.inject(DataMapping).toProducts(table)` strips the id. (AC-01)
- Rule: a label added to the strip list is excluded from output — the list is
  data-driven, not hardcoded. (AC-06)
- Rule (carried from US-01): no code path issues a non-GET request to the sheet.

## Acceptance Checks
- [x] All behavior rules hold
- [x] Edge cases have tests
- [x] No new libraries introduced
- [x] docs/DECISIONS.md updated (2026-06-09: DataMapping service + strip list)
- [x] docs/AI_CONTRACT.md updated (strip rule repointed to data-mapping.ts)
