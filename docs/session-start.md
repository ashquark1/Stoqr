# Session Start Template — Inventory Management System Frontend
# Paste this at the start of every new Claude Code session.
# Update "Current status" and "Today's task" each time.

---

Project: Inventory Management System — Frontend
Stack: Angular 21 (standalone, signals), TypeScript (strict), HttpClient, Reactive Forms, SCSS, Vitest. Node 22 (`nvm use 22.22.3`).
Data source: a single Google Sheet, read-only in V1.

Read before starting (in this order):
1. @CLAUDE.md — session rules and conventions
2. @docs/AI_CONTRACT.md — permanent constraints; these override everything
3. @docs/projectmap.md — domain ownership; tells you where logic belongs
4. @specs/[feature].md — if continuing a core feature from last session

Current status: [what was completed last session — UPDATE THIS. e.g. "fresh scaffold + governance set up; no features built yet"]
Today's task: [specific goal — classify as Core or Local first]
Key context: [any decisions made last session that affect today's work]
Reference files: @[relevant files for today's task]

---

## Core vs. Local Quick Check
Before every prompt, classify the task:

**Core** (requires full workflow: read contract + map → write spec → plan → implement → update docs):
- Touches the `Product`/stock models, the Google Sheets data-access service, search/filter logic, or shared signal state.

**Local** (direct prompt + typecheck/test is enough):
- Isolated UI change, copy edit, SCSS/style fix, single-component layout adjustment with no data impact.

When in doubt: treat as Core.
