# Feature: Error State (US-07)

## Problem
If a fetch fails, the user must never be left with a blank screen or a raw error.
They need a clear, friendly, dismissible message and a way to retry — without
losing data they already had.

## Non-Goals
- No technical details / stack traces in any message (AC-06).
- No global HTTP error interceptor; failure state is owned by the data service.
- No multi-toast queue — a single active error toast.

## Behaviour Rules
- Any fetch failure (initial or refresh) shows a top-center toast with the single
  message "We couldn't fetch the products. Please check your connection and try
  again." (AC-01/02/03/06)
- Toast auto-dismisses after 5s and can be dismissed manually. (AC-04/05)
- Toast has a Retry button that re-attempts the exact same query. (AC-07/08)
- Initial-search failure: results table not shown — revert to the centered hero
  state. (AC-09)
- Refresh failure: table stays visible with stale data. (AC-10)
- Toast is branded (theme `.stoqr-toast*`, tokens only) and announced to screen
  readers (`role="alert"` + `aria-live="assertive"`). (AC-11/12)

## Edge Cases
- Retry after an initial failure re-runs the search (`searchNow(lastQuery)`);
  retry after a refresh failure re-runs `refresh()` — tracked via `lastRefresh`.
- Manual dismiss / retry / a successful fetch all clear the `error` signal.
- A new in-flight request cancels the previous (switchMap); the error reflects
  only the latest outcome.

## Implementation
- `shared/ui/toast/`: `<stoqr-toast [message] [title] (retry) (dismiss)>` —
  fixed top-center, 5s `setTimeout` cleared on dismiss/retry/destroy.
- `SheetsData`: single `FETCH_ERROR_MESSAGE`; `isRefresh` carried into the
  result; initial failure → `hasSearched=false`, refresh failure → keep products;
  `retry()` / `dismissError()`.
- `features/product-search/`: global `<stoqr-toast>` overlay on `error()`.

## Test Plan
- `SheetsData`: initial failure reverts to hero (no table); refresh failure keeps
  stale data + active; retry re-fetches; dismiss clears the error.
- `<stoqr-toast>`: renders title/message/Retry; emits retry & dismiss;
  auto-dismisses after the timeout.

## Acceptance Checks
- [x] Toast on both initial and refresh failure; top-center; branded; aria-live
- [x] Auto-dismiss + manual dismiss + Retry (same query)
- [x] No technical details exposed
- [x] Hero preserved on initial failure; stale table kept on refresh failure
- [x] docs/DECISIONS.md + docs/projectmap.md updated
