# Project Map — Inventory Management System Frontend
# Domain ownership reference. Read this before any core domain change.
# Last updated: 2026-06-09

## Purpose
A web frontend (Angular 21 SPA) for searching and viewing the stock of products. In V1 it is read-only and used by everyone — there is no login and no editing. Product and stock data live in a single Google Sheet; the app reads from it and presents searchable, viewable results. Editing is done directly in the Google Sheet for now; write features are planned for later versions.

## Core Domains

### Products
- **Owns:** the typed `Product` model and the mapping from raw Google Sheet rows to that model (name, code/SKU, category, and other descriptive fields).
- **Does NOT own:** stock quantities/availability (Stock domain), HTTP transport (Data Source), or how products are rendered (UI).
- **Code lives in:** `src/app/core/models/product.ts` (the typed model) and `src/app/core/sheets/data-mapping.ts` (the `DataMapping` service: row→model mapping + internal-field stripping), surfaced via the data-access service.
- **The rule:** the Google Sheet is the single source of truth for product data; the app only reads and maps it.
- **Forbidden:** hardcoding products in components; mutating product data; transforming fields inline in templates.

### Stock & Inventory Levels
- **Owns:** the representation and read-side logic for stock quantity / availability per product, as derived from the sheet.
- **Does NOT own:** product identity (Products), persistence, or any write/adjustment flow (out of scope in V1).
- **Code lives in:** `src/app/core/models/product.ts` (the `stockQty`/`lowStockThreshold`/`stockStatus` fields) and the mapping in `src/app/core/sheets/data-mapping.ts`. `stockStatus` is read verbatim from the sheet, never derived from quantity.
- **The rule:** stock is shown exactly as it appears in the sheet — no client-side recalculation.
- **Forbidden:** incrementing/decrementing or writing stock back to the sheet; computing stock from any source other than the sheet.

### Data Source (Google Sheets) — cross-cutting
- **Owns:** all communication with the single Google Sheet via `HttpClient`, and exposing the result as signals.
- **Does NOT own:** domain shaping beyond row→model mapping, or UI concerns.
- **Code lives in:** `src/app/core/sheets/sheets-data.ts` (the `HttpClient` GET, RxJS debounce/cancellation, signal state — including the `loading` vs `refreshing` fetch states). `gviz-parse.ts` unwraps the JSONP envelope only; `data-mapping.ts` (the `DataMapping` service) owns row→model mapping + internal-field stripping; raw response types in `gviz-types.ts`. The endpoint URL lives in `src/environments/`.
- **The rule:** this is the ONLY place `HttpClient` is used. Read-only in V1.
- **Forbidden:** any non-GET request to the sheet; components bypassing this service.

### Search & View (UI / feature) — cross-cutting
- **Owns:** the search/filter input (Reactive Forms) and the components that display product + stock results.
- **Does NOT own:** data fetching, mapping, or filtering rules (those live in services).
- **Code lives in:** feature components under `src/app/features/` (e.g. `src/app/features/product-search/`, with `product-fields.ts` defining table columns + modal groups, and `filter-panel/` the collapsible facet panel). Query-driven search + validation live in `src/app/core/search/` (`product-matcher.ts` pure rules, `SearchValidation`, and `ProductSearchStore` exposing `searchResults`/`visibleProducts`/`message` + facet option lists). Facet filtering lives in `src/app/core/filter/` — `FilterService` (selected-values state, empty = "All" = no filter) + pure `product-filter.ts` (`applyFilters`); the stock-status→variant resolver is `src/app/core/stock-status.ts`. The filter dropdown is `<stoqr-filter-select>` (wraps `p-multiSelect`, adds the mutually-exclusive "All" option). Reusable presentational pieces live in `src/app/shared/ui/` — the Stoqr UI kit that **wraps PrimeNG** (`<stoqr-data-table>` over `p-table`, `<stoqr-modal>` over `p-dialog`, `empty-state`, `loading-overlay`) plus native primitives `<stoqr-badge>` (stock-status pill; `stock-status.ts` holds the status→variant map), `<stoqr-logo>`, and `<stoqr-toast>` (top-center error toast with Retry). The Active-products filter is `SheetsData.results`; the query filter is `ProductSearchStore` — never the component. Fetch-failure handling lives in `SheetsData` (`error` signal + `retry()`/`dismissError()`; initial failure reverts to hero, refresh failure keeps stale data).
- **The rule:** components request data/search results from services and render them via the `shared/ui` kit; they hold view state as signals only. Features never reference PrimeNG `p-*` directly — only `shared/ui` wrappers do.
- **Forbidden:** calling `HttpClient`, doing business logic, manual subscriptions in components, or importing PrimeNG components outside `shared/ui/`.

## Data Flow (high level)
User opens the SPA → a feature component requests data from the data-access service → the service GETs the Google Sheet via `HttpClient` and maps rows into typed `Product` + stock models exposed as signals → search/filter (driven by a Reactive Form) narrows the signal-derived list → components render the results. Data flows one direction only: Sheet → app → screen.

## Where Changes Belong
- Change how a product field is read/named → the `Product` model + Sheets mapping (`src/app/core/`).
- Change how stock is interpreted/displayed → Stock mapping (`src/app/core/`), then the view component for presentation.
- Change the spreadsheet URL / fetch logic → the data-access service (`src/app/core/sheets/`) only.
- Change search/filter behavior → the search logic in a service; wire the input via a Reactive Form in the feature component.
- Change layout/styling → the relevant component's template + scoped SCSS.
