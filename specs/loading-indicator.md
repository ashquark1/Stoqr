# Feature: Loading Indicator (US-06)

## Problem
Users need clear feedback that the app is working during a fetch — a prominent
indicator on the initial search, and an unobtrusive one on refresh that doesn't
yank the table away.

## Non-Goals
- No skeleton rows or progress bars — a branded spinner only.
- No global HTTP interceptor; loading state is owned by the data service.

## Behaviour Rules
- Two distinct fetch states on `SheetsData`:
  - `loading` — initial search. Full-page `<stoqr-loading-overlay>` with
    "Fetching products…"; the results table is NOT rendered. (AC-01–05)
  - `refreshing` — Refresh Results. Inline 14px spinner replaces the Refresh
    button icon, label → "Refreshing…", button disabled; the table stays visible
    and updates seamlessly when fresh data arrives. (AC-06–09)
- Both spinners clear as soon as data is ready.
- Spinner is the theme `.stoqr-spinner` (CSS custom properties only): inline 14px,
  full 28px, 2.5px border, top Pine, spin 750ms.

## Edge Cases
- Refresh is only reachable from the active results view, so `refreshing` never
  hides the search UI.
- A new trigger mid-flight cancels the previous request (switchMap); the relevant
  spinner clears on the latest completion.
- On clear (reset) both `loading` and `refreshing` are cleared.

## Implementation
- `SheetsData`: `loading` / `refreshing` signals; the immediate trigger carries
  an `isRefresh` flag (typing/`searchNow` → false, `refresh()` → true).
- `features/product-search/`: overlay on `loading()`; Refresh button inline
  spinner + "Refreshing…" + disabled on `refreshing()`.
- `src/styles/stoqr-theme.scss`: `.stoqr-spinner` sized to the brand spec.

## Test Plan
- `SheetsData`: initial search sets `loading` (not `refreshing`); refresh sets
  `refreshing` (not `loading`); both clear after the response.

## Acceptance Checks
- [x] Full spinner + "Fetching products…" on initial fetch; table hidden
- [x] Inline spinner on Refresh; table stays visible; seamless update
- [x] Spinner styled with CSS custom properties only
- [x] docs/DECISIONS.md + docs/projectmap.md updated
