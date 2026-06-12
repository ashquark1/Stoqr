# DECISIONS.md — Inventory Management System Frontend
# Log of non-obvious design choices. Add an entry whenever a trade-off is made.
# Format: ## [DATE]: [Decision title]

## 2026-06-04: Initial stack selection

- Decision: Angular 21 (standalone + signals, no NgModules), TypeScript strict, Angular `HttpClient` for data, Reactive Forms, component-scoped SCSS, Vitest for tests.
- Reason: scaffolded with the current Angular CLI defaults; signals + standalone are the modern Angular baseline and fit a small read-only SPA. HttpClient is the built-in, dependency-free way to read the Google Sheet.
- Rejected: NgModule-based architecture (legacy); external UI/CSS frameworks (none needed yet).
- Note: Deviate only with explicit discussion; don't let Claude introduce alternatives unilaterally.

## 2026-06-04: State management — Signals in services (recommendation, revisitable)

- Decision: app state lives in Angular Signals exposed from injectable services. No NgRx/Akita in V1.
- Reason: V1 is read-only (search + view of one sheet); a full state library would be over-engineering. Signals + services cover it cleanly.
- Rejected: NgRx, NgRx SignalStore — reconsider only if write flows and complex shared state arrive in a later version.
- Note: user answered "not decided" for state; this is a recommended default, open to revision when requirements grow.

## 2026-06-04: Forms & validation — Reactive Forms, no schema library

- Decision: use Angular Reactive Forms + built-in Validators. No Zod/class-validator in V1.
- Reason: the only V1 form is the search/filter input; typed reactive controls integrate with signals (`toSignal` on `valueChanges`). A schema library adds weight with no payoff for read-only search.
- Rejected: Template-driven forms; external validation libraries.
- Note: revisit when V1 gains data-entry / write features.

## 2026-06-04: Data source — single Google Sheet, read-only

- Decision: all data comes from one Google Sheet, accessed read-only through a single data-access service; the frontend never writes to it.
- Reason: V1 requirement — editing happens directly in the sheet; the app only searches and views.
- Rejected: a custom backend/ORM (not in scope for V1).
- Note: write-back / a real backend are anticipated for future versions — that will be a Core change requiring a spec and updates here.

## 2026-06-04: Domain boundary definitions

- Decision: domains are Products and Stock & Inventory Levels, with Data Source (Google Sheets) and Search & View as cross-cutting layers. See docs/projectmap.md for full ownership.
- Reason: keeps mapping/business logic out of components and confines all I/O to one service as the codebase grows.
- Note: prevents logic from leaking across boundaries as more code is generated.

## 2026-06-09: US-01 data fetch — gviz, keyless, fetch-per-search

- Decision (access): read the sheet via the public Google Visualization (gviz) endpoint `/gviz/tq?tqx=out:json` — no API key. AC-07 (restrict an API key to the Sheets API) is therefore N/A in V1.
- Decision (trigger model): debounced typing fetches on threshold-crossing (>= 3 chars, 300ms `debounceTime`); explicit Enter/Search fetches for any non-empty query (>= 1 char); the Refresh button always re-fetches. While a search session is active, further typing filters the cached data locally (no re-fetch). `switchMap` cancels any in-flight request so only the latest completes.
- Decision (mapping): map by column LABEL, not position, so reordering sheet columns does not corrupt data. The internal `id` column is omitted from the field map, which is how `_row_id` is stripped (US-02).
- Decision (coercions): `packing` (number in sheet) → string; `last updated`/`created at` (datetime) → the formatted display string (`f`); a missing/blank numeric cell → `null` (never `0`), so numeric `Product` fields are `number | null`.
- Decision (empty display): at render time a value shows as the literal text "empty" when it is `null` (missing numerics) or an empty/whitespace-only string; genuine placeholders like `"-"` are kept verbatim. Implemented as a shared display helper when the results table lands (US-03).
- Decision (config): the gviz URL lives in `src/environments/` (prod + development), swapped via `angular.json` fileReplacements; recorded as off-limits in the charter.
- Rejected: Sheets API v4 with an API key (unnecessary for a public, read-only sheet; adds credential management).
- Risk: gviz returns JSONP-wrapped text and relies on browser-permitted CORS GETs; verified working in-browser for the current sheet. Revisit if the sheet becomes private or CORS changes.

## 2026-06-09: US-02 — dedicated DataMapping service + configurable strip list

- Decision: extracted row→`Product` mapping out of `gviz-parse.ts` into an injectable `DataMapping` service (`src/app/core/sheets/data-mapping.ts`); `gviz-parse.ts` now only unwraps the JSONP envelope.
- Decision: internal fields are stripped via a single configurable `INTERNAL_FIELDS = ['id']` constant (AC-06). `id` is the sheet column label for the conceptual `_row_id`; to exclude a future internal column, add its label here and nowhere else.
- Decision: kept allowlist mapping (only the 20 known column labels are emitted, so any unknown column — including `id` — can never leak) as the primary guarantee; `INTERNAL_FIELDS` is explicit, auditable defense-in-depth layered on top.
- Decision (naming): class `DataMapping` (no `Service` suffix) to match `SheetsData` and the Angular-21 no-suffix convention, despite the user story text referring to "DataMappingService".
- Note: pure mapping is exposed as `mapTableToProducts(table, internalLabels = INTERNAL_FIELDS)`; the injectable `DataMapping.toProducts()` delegates to it. The optional param makes the strip list's configurability unit-testable without an InjectionToken.

## 2026-06-09: Adopt Stoqr design system + mobile-first responsive

- Decision: adopted the first-party Stoqr design-token SCSS (`src/styles/stoqr-theme.scss`) as the single styling source — design tokens + `.stoqr-*` component classes. This is a first-party design system, not a third-party UI/CSS framework. Component SCSS references `var(--token)`/`.stoqr-*` only; no hardcoded hex/font/spacing.
- Decision: typography loaded from Google Fonts via `@import url(...)` in the theme (Lora / DM Sans / DM Mono). Risk: external network dependency (offline + privacy); acceptable for V1, revisit if self-hosting fonts is required.
- Decision: mobile-first responsive — base styles target mobile, overrides via `min-width` only at 768 / 1024 / 1440, using the `from()` mixin in `src/styles/_breakpoints.scss`. `max-width` media queries are forbidden.
- Trade-off: the supplied theme used a `1200px` desktop step; retuned to `1024px` to match the agreed breakpoints. Logo (`public/stoqr-logo.svg`) added as a static asset; a colorway-aware (currentColor) logo component will follow with the hero/topbar in US-05.
- Rejected: a third-party CSS/UI framework (none needed; the design system covers it).

## 2026-06-10: US-03 — PrimeNG component library + scalable feature architecture

- Decision (library): adopted **PrimeNG 21** (`primeng`, `@primeuix/themes`, `@angular/cdk` peer) as the approved component library for the results table, paginator, and detail modal. Chosen over native-only and over Angular Material/AG Grid per user direction. Used in **styled mode** with a custom `StoqrPreset` (`definePreset(Aura, …)`) mapping PrimeNG's primary palette to the Stoqr greens; `provideAnimationsAsync()` is NOT needed (PrimeNG 21 has no `@angular/animations` dependency).
- Decision (two-channel styling): native markup is styled by `.stoqr-*` + CSS vars (`stoqr-theme.scss`); PrimeNG by the preset + a global, unlayered `_primeng-overrides.scss` (PrimeNG emits into a `primeng` @layer so our unlayered overrides win). Both trace to `brand-tokens.ts` (single TS source of brand values).
- Decision (architecture): feature-based + layered — `core/` (domain + data-access, no UI), `shared/` (`ui/` vendor wrappers, `util/`, `models/`), `features/<feature>/` (lazy). **Wrap the vendor:** features use `<stoqr-data-table>` / `<stoqr-modal>`, never `p-*` directly, so a future PrimeNG swap/upgrade has a one-wrapper blast radius. Generic, config-driven `ColumnDef[]` table is reusable by future features (e.g. dashboards). Path aliases `@core`/`@shared`/`@features`/`@styles`/`@env`; SCSS `includePaths: ['src/styles']` so components `@use 'breakpoints'`.
- Decision (pagination): use PrimeNG p-table's built-in paginator (rows=25, options 10/25/50, current-page report) instead of a hand-rolled `PaginationComponent` (tech-note deviation) — satisfies AC-05/06/07/08/09 directly.
- Decision (Active filter): `Status = Active` filtering lives in `SheetsData.results` (data-access computed), not the pure mapper or the component (tech-note said "data mapping layer"; service is the architecturally-correct home per projectmap). `isEmpty` keys off `results`.
- Decision (empty display): `shared/util/display-value.ts` renders `null`/empty/whitespace as the literal "empty", keeps `"-"`; numbers (incl. 0) as strings.
- Risk: PrimeNG inflates the `product-search` lazy chunk (~620 kB raw); lazy-loaded so initial bundle stays under budget. Watch as more PrimeNG components are added.

## 2026-06-10: US-04 — stock-status badge

- Decision: `<stoqr-badge [status]>` (`shared/ui/badge/`) takes the verbatim sheet `stockStatus` string and resolves the pill variant internally. It reuses the theme's `.stoqr-badge--*` classes (which are token-based and WCAG-AA) rather than duplicating the pill styles in component SCSS (DRY over the tech-note's "own SCSS file").
- Decision: status→variant lives in a single constant map `resolveStockVariant()` (`shared/ui/badge/stock-status.ts`), case/space-insensitive; blank or unrecognised → `unknown`. The Stock Qty colour-coding (AC-07) reuses the same resolver so badge and qty never disagree.
- Decision: the badge is wired into the table via the `<stoqr-data-table>` `cellTemplates` seam (no wrapper change) and into the modal via a data-driven `badge` flag on the field metadata.
- Note: the badge is pure presentation of the verbatim `stockStatus` — no stock recomputation (Stock domain rule intact).

## 2026-06-10: US-05 — search-as-primary-UI + multi-field search logic

- Decision (search algorithm): query is split into whitespace TERMS, matched case-insensitively as substrings, **AND across terms** (adding words narrows). CORE fields (productName/brand/sku/category) are always eligible; SECONDARY fields (size/color/packing) are eligible only when the query "anchors" on a core term. A query that references only secondary fields with no anchor shows the AC-13 message instead of results.
- Decision (anchor scope): **any** core field anchors secondary matching (Name/Brand/SKU/Category), broadening AC-12's "Name/Brand only" wording (user choice).
- Decision (placement): pure matcher in `core/search/product-matcher.ts`; injectable `SearchValidation` (AC-13 message) and `ProductSearchStore` (exposes `visibleProducts` + `message`, derived from `SheetsData.searchTerm()` + `SheetsData.results()`). Search/filter logic stays out of components and out of the pure Sheets mapper. `SheetsData` keeps the term + fetch triggers (US-01); no duplication.
- Decision (two-state UI): hero (logo above a 52px/640px centered bar) ↔ active (inline logo + 44px/full bar in a sticky top bar + results). Driven by `isSearchActive = hasSearched()`. Pure **CSS transforms/transitions** (translateY for the move, size transitions on the logo/bar); no JS animation. Mobile-first via the `from()` mixin.
- Decision (logo): `<stoqr-logo [inline]>` inlines the clover SVG with `fill="currentColor"`; mark = `var(--color-pine)` (Pine on light → Sage on dark); wordmark = `var(--color-ink)` (adapts to dark) instead of the theme's fixed Forest.
- Deviation (AC-03): the "Search for a product to get started" prompt was **removed** at user request.
- Enhancement: Search + Refresh buttons are icon-only on mobile, icon+text from 768px (shared `.icon-btn` pattern); the search input no longer carries an inner magnifier (it's on the button).
- Note: validation needs the cached products to classify terms, so a secondary-only query still fetches first, then shows the message.

## 2026-06-10: US-06 — loading vs refreshing states

- Decision: `SheetsData` splits in-flight state into two signals — `loading` (initial fetch → full-page `<stoqr-loading-overlay>` with "Fetching products…", table hidden) and `refreshing` (Refresh fetch → inline spinner on the Refresh button, table stays visible and updates seamlessly). The immediate trigger carries an `isRefresh` boolean; the debounced/typing path is always `false`.
- Decision: the Refresh button replaces its icon with a 14px `.stoqr-spinner`, changes its label to "Refreshing…", and is `disabled` (`aria-busy`) while refreshing (brand refresh-button spec + tech note).
- Decision: aligned the theme `.stoqr-spinner` to the brand/US-06 spec — inline 14px, full (`--lg`) 28px, 2.5px border (was 16/32/3px). The spinner lives in `stoqr-theme.scss` (reusable for any future loading state).
- Note: copy uses an ellipsis ("Fetching products…", "Refreshing…") for consistency with the rest of the UI rather than literal "...".

## 2026-06-11: Reset-to-hero only on a fully cleared search box

- Decision: the active→hero transition (State 2 → State 1) fires **only when the search box is empty/whitespace-only**, not when it drops below 3 characters. Once a search is active, typing down to 1-2 chars stays in the results state and filters the cache locally; only a full clear resets (clears cache + returns to centered).
- Rationale: avoids jarringly bouncing the user back to the hero mid-edit. The 3-char threshold still governs *starting* a fetch from the hero; it no longer governs tearing the results down.
- Deviation: overrides the original AC-15 (US-05) and AC-01/AC-10 (US-01) "clearing below 3 characters returns to the centered state" wording (user request).
- Code: `SheetsData.onSearchInput` resets on `trimmed.length === 0`; `searchNow` already did.

## 2026-06-11: US-07 — error toast + failure-state behavior

- Decision: reusable `<stoqr-toast>` (`shared/ui/toast/`) — fixed **top-center**, branded `.stoqr-toast`, with Retry + close, `role="alert"` + `aria-live="assertive"`, and a 5s `setTimeout` auto-dismiss cleared on dismiss/retry/destroy. Positioned top-center per US-07 (the theme's default `.stoqr-toast-container` is bottom-right, unused here).
- Decision: a single friendly, technical-detail-free message for **all** fetch failures — "We couldn't fetch the products. Please check your connection and try again." (AC-01/02/06); `SheetsData` no longer branches on error type.
- Decision (failure states): initial-search failure reverts to the centered hero (`hasSearched=false`, no table — AC-09); refresh failure keeps the stale products + active state (table stays — AC-10). The trigger carries `isRefresh` through to the result so the subscribe can branch.
- Decision: `retry()` re-runs the last query the same way (refresh vs initial, via a `lastRefresh` flag + the stored `searchTerm`); `dismissError()` clears the toast. The toast is a global overlay driven by `SheetsData.error()`.
- Deviation (tech note): the toast exposes Angular **outputs** (`retry`/`dismiss`) instead of an `onRetry: Function` input — more idiomatic, still reusable.

## 2026-06-11: US-08 — facet filter mechanism (Stock Status)

- Decision (pipeline): `results (Active) → query match (searchResults) → facet filters → visibleProducts`. Facet filtering is a pure function `applyFilters` (`core/filter/product-filter.ts`); state lives in a dedicated `FilterService` (`core/filter/`); option lists + greying are computed in `ProductSearchStore`. No DI cycle (FilterService holds no data).
- Decision (selection model): each facet stores the **selected values** (a set); **empty = "All" = no filter** and is not counted in "Filters (N)". The `<stoqr-filter-select>` dropdown (wraps PrimeNG `p-multiSelect`) adds an explicit **"All"** option that is mutually exclusive with the real options — selecting a real value clears All; selecting All clears the reals (user request). Selections persist across searches/refresh (value-based, independent of current options).
- Decision (options/greying): Stock Status options are the 4 fixed variants (`core/stock-status.ts` `STOCK_VARIANTS`); an option is greyed/disabled when absent from the current `searchResults` (AC-06/07 pattern, reused by US-09/10).
- Decision (refactor): the stock-status→variant resolver moved from `shared/ui/badge/stock-status.ts` to `core/stock-status.ts` (it is domain logic used by both the badge and the filter; keeps the core ← shared dependency direction correct).
- Decision (panel): collapsible `FilterPanelComponent` (150ms ease, full-width mobile / 280px ≥768) holds the facets in the locked order Status → Category → Sub-category → Brand → toggles (US-13) → Reset.

## 2026-06-12: US-11 — last-updated freshness timestamp

- Decision: `SheetsData` owns a `fetchedAt: Date | null` signal, set ONLY in the fetch success branch. A failed fetch (initial or refresh) never touches it, so AC-06 ("unchanged on failure") falls out structurally rather than via branching.
- Decision (auto-update): relative wording ticks via an impure `RelativeTimePipe` (`shared/util/relative-time.ts`) that owns a single 60s interval and calls `markForCheck()`, cleared on destroy. Chosen over a global `now` signal-tick + pure pipe to keep the component free of timer wiring (one self-contained label).
- Decision (formatting): pure `relativeTime(from, now)` (unit-testable, mirrors the `display-value` helper pattern); absolute tooltip via the built-in `DatePipe` + native `title` attribute — no one-off TooltipDirective (Q-G2).
- Rejected: per-row `lastUpdated` column as the source (that is sheet data, not fetch freshness); a new tooltip library/directive (native title suffices).
