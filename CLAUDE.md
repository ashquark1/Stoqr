# Project: Inventory Management System — Frontend (Angular 21, TypeScript, Signals + HttpClient)

V1 scope: read-only. Search and view product stock. Data lives in a single Google Sheet; everyone can view.

## Build & Dev Commands
- Requires Node 22 (`nvm use 22.22.3` — fresh terminals may default to Node 20.18.0, which Angular 21 rejects).
- `npm start` — dev server (`ng serve`, http://localhost:4200)
- `npm run build` — production build
- `npm run watch` — dev build, rebuild on change
- `npm test` — unit tests (Vitest via `ng test`)

## Stack Decisions (don't deviate without asking)
- State: Angular Signals in injectable services only. No NgRx in V1.
- Data fetching: Angular `HttpClient` only, wrapped in a data-access service. No `HttpClient` in components.
- Data source: one Google Sheet, READ-ONLY in V1. The frontend never writes to the sheet.
- Forms: Reactive Forms + built-in Validators only. No external validation library in V1.
- Styling: component-scoped SCSS. No CSS/UI framework chosen — ask before adding one.
- Testing: Vitest via `ng test`.
- Components: standalone, `ChangeDetectionStrategy.OnPush`, signal-based. No NgModules.

## Naming Conventions (Angular 21 style guide)
- Files: kebab-case, NO `.component`/`.service` suffix (e.g. `product-list.ts`, `product-store.ts`) — match the scaffold (`app.ts`, `app.config.ts`).
- Component class: PascalCase; selector: kebab-case with a feature prefix (`app-`).
- Template-only members: `protected readonly`. State: `signal()` / `computed()`.

## Code Rules
- Strict TS. No `any`, no `@ts-ignore`, no `@ts-nocheck`.
- No manual `.subscribe()` in components — use the `async` pipe or `toSignal()`.
- No business logic in components — it belongs in services/stores.
- Components never call `HttpClient` directly — go through the data-access service.
- Never write to the Google Sheet (read-only V1).
- Standalone components only. No NgModules.

## Off-Limits (never modify without explicit confirmation)
None declared yet. When auth, API keys, or env config are added, list them here and in `.claude/settings.json`.

## Reference Docs (use @-syntax to load when needed)
- Project map: @docs/projectmap.md
- AI contract: @docs/AI_CONTRACT.md
- Decisions log: @docs/DECISIONS.md

## Core Domain Changes (data model, data-access/Sheets integration, shared state)
ALWAYS read @docs/AI_CONTRACT.md and @docs/projectmap.md before starting.
ALWAYS update @docs/DECISIONS.md if a trade-off was made.

## Session End Protocol
After any core domain change:
- New pattern introduced → update @docs/DECISIONS.md
- New anti-pattern found → update @docs/AI_CONTRACT.md
- Domain ownership changed → update @docs/projectmap.md
- Spec deviated from plan → update @specs/[feature].md
