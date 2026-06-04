# Project Map — Inventory Management System Frontend
# Domain ownership reference. Read this before any core domain change.
# Last updated: 2026-06-04

## Purpose
A web frontend (Angular 21 SPA) for searching and viewing the stock of products. In V1 it is read-only and used by everyone — there is no login and no editing. Product and stock data live in a single Google Sheet; the app reads from it and presents searchable, viewable results. Editing is done directly in the Google Sheet for now; write features are planned for later versions.

## Core Domains

### Products
- **Owns:** the typed `Product` model and the mapping from raw Google Sheet rows to that model (name, code/SKU, category, and other descriptive fields).
- **Does NOT own:** stock quantities/availability (Stock domain), HTTP transport (Data Source), or how products are rendered (UI).
- **Code lives in:** `src/app/core/` (model + mapping), surfaced via the data-access service.
- **The rule:** the Google Sheet is the single source of truth for product data; the app only reads and maps it.
- **Forbidden:** hardcoding products in components; mutating product data; transforming fields inline in templates.

### Stock & Inventory Levels
- **Owns:** the representation and read-side logic for stock quantity / availability per product, as derived from the sheet.
- **Does NOT own:** product identity (Products), persistence, or any write/adjustment flow (out of scope in V1).
- **Code lives in:** `src/app/core/` alongside the Product mapping.
- **The rule:** stock is shown exactly as it appears in the sheet — no client-side recalculation.
- **Forbidden:** incrementing/decrementing or writing stock back to the sheet; computing stock from any source other than the sheet.

### Data Source (Google Sheets) — cross-cutting
- **Owns:** all communication with the single Google Sheet via `HttpClient`, and exposing the result as signals.
- **Does NOT own:** domain shaping beyond row→model mapping, or UI concerns.
- **Code lives in:** a dedicated data-access service, e.g. `src/app/core/sheets/`.
- **The rule:** this is the ONLY place `HttpClient` is used. Read-only in V1.
- **Forbidden:** any non-GET request to the sheet; components bypassing this service.

### Search & View (UI / feature) — cross-cutting
- **Owns:** the search/filter input (Reactive Forms) and the components that display product + stock results.
- **Does NOT own:** data fetching, mapping, or filtering rules (those live in services).
- **Code lives in:** feature components under `src/app/` (e.g. `src/app/features/`).
- **The rule:** components request data/search results from services and render them; they hold view state as signals only.
- **Forbidden:** calling `HttpClient`, doing business logic, or manual subscriptions in components.

## Data Flow (high level)
User opens the SPA → a feature component requests data from the data-access service → the service GETs the Google Sheet via `HttpClient` and maps rows into typed `Product` + stock models exposed as signals → search/filter (driven by a Reactive Form) narrows the signal-derived list → components render the results. Data flows one direction only: Sheet → app → screen.

## Where Changes Belong
- Change how a product field is read/named → the `Product` model + Sheets mapping (`src/app/core/`).
- Change how stock is interpreted/displayed → Stock mapping (`src/app/core/`), then the view component for presentation.
- Change the spreadsheet URL / fetch logic → the data-access service (`src/app/core/sheets/`) only.
- Change search/filter behavior → the search logic in a service; wire the input via a Reactive Form in the feature component.
- Change layout/styling → the relevant component's template + scoped SCSS.
