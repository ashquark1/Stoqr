# Feature: Last Updated Timestamp (US-11)

## Problem
When results are shown, the user has no idea how fresh the data is — the sheet is
edited out-of-band and the app caches a fetch. Without a visible "last fetched"
time, a stale cache looks identical to a just-refreshed one.

## Non-Goals
- No per-row freshness. This is the global "data last successfully fetched" time,
  not the sheet's per-product `lastUpdated` column (which already exists).
- No writing to the sheet; no polling/auto-refetch — only the relative *wording*
  ticks, never the data.

## Behavior Rules
- The timestamp reflects the moment of the **last successful** sheet fetch
  (`SheetsData.fetchedAt`), set only in the fetch success branch. (AC-02)
- A failed fetch (initial or refresh) leaves `fetchedAt` **unchanged**. (AC-06)
- Shown **right-aligned next to the Refresh Results button**, only while results
  are displayed; never in the centered hero state. (AC-01, AC-07)
- Default wording is **relative** ("Last updated: 2 minutes ago"); hovering shows
  the **absolute** time as a tooltip ("12 Jun 2026, 3:45 PM"). (AC-03, AC-04)
- Relative wording **auto-updates every 60s** with no page reload and no re-fetch. (AC-08)
- No `HttpClient`, fetch state, or business logic in the component — `fetchedAt`
  lives in the data-access service; formatting lives in a shared pipe.
- Styling uses design tokens only (no hardcoded hex/font/spacing); mobile-first.

## Edge Cases
- `fetchedAt === null` (before first fetch): timestamp not rendered.
- Refresh fails: stale data + the previous timestamp both remain (AC-06/AC-10 align).
- Clock skew (fetch time slightly in the future): renders "just now".
- Component destroyed: the pipe's 60s interval is cleared (no leak).

## Implementation Phases
- Phase 1 (data-access): add `fetchedAt: Date | null` signal to `SheetsData`, set
  in the success branch only — verified by a `SheetsData` rule test (advances on
  success, unchanged on failure).
- Phase 2 (shared util): pure `relativeTime(from, now)` + `RelativeTimePipe`
  (impure, self-owned 60s interval, `markForCheck`) — verified by pure unit tests
  over every bucket.
- Phase 3 (UI): render in `results__toolbar` next to Refresh; absolute via the
  built-in `DatePipe` `title` — verified visually.

## Test Plan
- RULE: `fetchedAt` advances on a successful fetch and is unchanged on a failed fetch.
- `relativeTime` returns the right bucket/pluralization at every boundary.

## Acceptance Checks
- [ ] All behavior rules hold (AC-01–08)
- [ ] Edge cases covered (null hidden; failure unchanged)
- [ ] No new libraries (native `title` + built-in `DatePipe`)
- [ ] docs/DECISIONS.md updated (auto-update mechanism + native-tooltip choice)
- [ ] docs/projectmap.md updated (Data Source owns the fetch timestamp)
