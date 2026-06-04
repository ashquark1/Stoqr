# AI_CONTRACT.md — Inventory Management System Frontend
# If a forbidden pattern isn't written here, Claude is allowed to use it.

## Non-Negotiable Rules
- The frontend is READ-ONLY in V1. No code path may write, update, or delete data in the Google Sheet. If a task seems to require a write, stop and ask.
- All Google Sheet access goes through a single data-access service (e.g. `src/app/core/sheets/`). Components and templates never call `HttpClient` directly.
- No business/derivation logic in components or templates. Mapping raw sheet rows → typed `Product`/stock models, filtering, and search logic live in services. Components render results only.
- State is exposed as Angular signals from services. No NgRx, Akita, or ad-hoc global mutable singletons in V1.
- No `any`, no `@ts-ignore`, no `@ts-nocheck`. Strict mode stays on. Fix the type, don't silence it.
- Standalone components only. No NgModules. Components use `ChangeDetectionStrategy.OnPush`.
- No external validation, UI, or CSS framework added without an explicit decision logged in DECISIONS.md (Q-G2: use proper framework guidelines, not one-off dependencies).

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
- Suppressing TypeScript or template errors instead of resolving them.

## Self-Enforcing Contract
After any core domain change, Claude must:
1. Update @docs/DECISIONS.md with any trade-off made
2. Update @docs/projectmap.md if domain ownership changed
3. Confirm rule-level tests pass (e.g. "no code path writes to the sheet")
4. Confirm no forbidden patterns above were introduced
