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
