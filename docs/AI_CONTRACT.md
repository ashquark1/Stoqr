# AI_CONTRACT.md — Inventory Management System Frontend
# If a forbidden pattern isn't written here, Claude is allowed to use it.

## Non-Negotiable Rules
- The frontend is READ-ONLY in V1. No code path may write, update, or delete data in the Google Sheet. If a task seems to require a write, stop and ask.
- All Google Sheet access goes through a single data-access service (e.g. `src/app/core/sheets/`). Components and templates never call `HttpClient` directly.
- No business/derivation logic in components or templates. Mapping raw sheet rows → typed `Product`/stock models, filtering, and search logic live in services. Components render results only.
- State is exposed as Angular signals from services. No NgRx, Akita, or ad-hoc global mutable singletons in V1.
- No `any`, no `@ts-ignore`, no `@ts-nocheck`. Strict mode stays on. Fix the type, don't silence it.
- Standalone components only. No NgModules. Components use `ChangeDetectionStrategy.OnPush`.
- No external validation, UI, or CSS framework added without an explicit decision logged in DECISIONS.md (Q-G2: use proper framework guidelines, not one-off dependencies). The approved component library is PrimeNG (styled mode, `StoqrPreset`); the design system is first-party Stoqr SCSS.
- Features must consume the `shared/ui` wrappers (`<stoqr-data-table>`, `<stoqr-modal>`, …), never PrimeNG `p-*` components directly. Vendor coupling lives only inside `src/app/shared/ui/`.

## Domain Rules

### Products
- Owner: data-access/Sheets service + `Product` model (`src/app/core/`).
- Rule: the Google Sheet is the single source of truth for product identity (name, SKU/code, category, etc.). The app reads and maps it; it never invents or mutates product records.
- Forbidden: hardcoding product data in components; transforming product fields inline in templates.

### Stock & Inventory Levels
- Owner: data-access/Sheets service + stock mapping logic (`src/app/core/`).
- Rule: stock quantities are displayed exactly as read from the sheet. No client-side recomputation, increment/decrement, or "adjustment" of stock in V1.
- Forbidden: writing stock changes back to the sheet; computing stock from anywhere other than the sheet data.

## Forbidden Shortcuts
- One-off "quick fixes" that bypass the data-access service or the model layer (Q-G2). Solve it in the right layer instead.
- Manual `.subscribe()` in components to "just get the data" — use `async` pipe or `toSignal()`.
- Adding `if (specificValue)` special-cases to make one row/product behave differently — fix the model or mapping instead.
- Copy-pasting a component/service and tweaking it instead of extracting a shared piece (design deterioration — Q-G3).
- Reuse over duplication (Q-G3): when new UI shares the same element, behaviour, and a similar function as an existing component or class, REUSE that component/class rather than re-implementing or styling a one-off (e.g. every icon-only button uses the shared `.icon-btn`; vendor widgets go through `shared/ui/` wrappers; shared roundedness uses `--radius-control`). If reuse needs a small variation, extend the shared piece with a modifier/input — don't fork it. Always propose the reuse before adding parallel code.
- Suppressing TypeScript or template errors instead of resolving them.
- Exposing the internal sheet column `id` (`_row_id`): it must never appear on the `Product` model, in any signal, or in any component/template. It is stripped during row→model mapping by the `DataMapping` service (`src/app/core/sheets/data-mapping.ts`) via the configurable `INTERNAL_FIELDS` list. To exclude a future internal column, add its sheet label to `INTERNAL_FIELDS` — nowhere else.
- Hardcoding hex colors, font families, or spacing values in component SCSS — use the design tokens (`var(--token)`) / `.stoqr-*` classes from `src/styles/stoqr-theme.scss`.
- `max-width` media queries. Styling is mobile-first: base = mobile, overrides via `min-width` only (768/1024/1440) using the `from()` mixin in `src/styles/_breakpoints.scss`.
- Filter state or filtering logic in components. Filter STATE lives in `FilterService` (`src/app/core/filter/`); filtering is a pure function (`core/filter/product-filter.ts`); option lists + greying are surfaced by `ProductSearchStore`. Components only render and call setters.

## Self-Enforcing Contract
After any core domain change, Claude must:
1. Update @docs/DECISIONS.md with any trade-off made
2. Update @docs/projectmap.md if domain ownership changed
3. Confirm rule-level tests pass (e.g. "no code path writes to the sheet")
4. Confirm no forbidden patterns above were introduced
