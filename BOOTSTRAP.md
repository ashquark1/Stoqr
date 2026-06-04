# BOOTSTRAP.md
# Claude Code Project Setup — Universal New Project Bootstrap
#
# HOW TO USE:
#   1. Drop this file into your new project's root directory
#   2. Run: claude "Read BOOTSTRAP.md and set up this project"
#   3. Answer Claude's questions when prompted
#   4. When complete, delete this file: rm BOOTSTRAP.md
#
# WHAT THIS DOES:
#   Runs a 4-phase setup that discovers your project, asks targeted
#   questions, then generates all governance files tailored to your
#   specific stack, team, and domain.
#
# OUTPUT FILES GENERATED:
#   - CLAUDE.md
#   - docs/AI_CONTRACT.md
#   - docs/projectmap.md
#   - docs/DECISIONS.md
#   - docs/session-start.md
#   - docs/claude-charter.md
#   - specs/README.md
#   - .claude/settings.json
#
# ESTIMATED TIME: 10–15 minutes (mostly your answers to questions)
# ---------------------------------------------------------------

You are setting up a new software project's AI development governance.
Your job is to run through 4 phases in order — Discovery, Interview,
Generate, Verify — without skipping or combining steps.

Follow every instruction precisely. Do not freestyle. Do not generate
files until Phase 3. Do not skip the verification in Phase 4.

---

## PHASE 1: DISCOVERY
*Do not ask the user any questions yet. Do not generate any files.
Silently explore the project and build your understanding first.*

Perform the following discovery steps in order:

**1.1 — Map the project structure**
Run `find . -type f -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/dist/*' -not -path '*/.next/*' -not -path '*/coverage/*' -not -path '*/build/*' | head -80` to see what exists.

**1.2 — Detect the stack**
Look for and read (if present):
- `package.json` → framework, key dependencies, scripts
- `tsconfig.json` → TypeScript config, path aliases
- `pyproject.toml` or `requirements.txt` → Python stack
- `Cargo.toml` → Rust stack
- `go.mod` → Go stack
- `Gemfile` → Ruby stack
- `.eslintrc*` or `eslint.config.*` → linting rules
- `prettier.config.*` or `.prettierrc*` → formatting rules
- `Dockerfile` or `docker-compose.yml` → deployment shape

**1.3 — Detect existing conventions**
Look at up to 5 existing source files (if any exist) to observe:
- Naming patterns (files, functions, variables, types)
- Import style (named vs default exports, path aliases)
- Error handling patterns
- Any existing folder structure and what lives where

**1.4 — Detect existing governance**
Check if any of these already exist: `CLAUDE.md`, `docs/`, `specs/`,
`.claude/settings.json`. Note what's already there — don't overwrite it,
integrate with it.

**1.5 — Build your internal summary**
Before moving to Phase 2, form a clear internal picture of:
- Primary language and framework
- Key libraries already chosen (state, data fetching, styling, testing, ORM, etc.)
- Project type (web app, API, CLI tool, library, mobile, etc.)
- Any naming or structural conventions already evident
- What governance files already exist vs. need to be created

After completing all discovery steps, say exactly:

```
DISCOVERY COMPLETE

Here's what I found:
- Language/Runtime: [detected]
- Framework: [detected or "not yet determined"]
- Key libraries: [list what you found in package.json or equivalent]
- Project type: [web app / API / CLI / library / mobile / other]
- Existing conventions detected: [list any naming/structure patterns you observed]
- Existing governance files: [list any CLAUDE.md, docs/, etc. already present]

Ready for Phase 2: I have [N] questions.
```

---

## PHASE 2: INTERVIEW
*Ask all questions in ONE message. Do not ask follow-up questions
one at a time — batch everything you need into a single, numbered list.
Wait for the user's full response before proceeding to Phase 3.*

Based on your discovery, ask only the questions whose answers you genuinely
cannot infer from the code. Skip questions you already know the answer to.

Ask from the following question bank — only the ones you need:

**Stack questions (skip if already detected from package.json):**
- Q-S1: What is the primary framework? (e.g. Next.js, Express, FastAPI, Rails)
- Q-S2: What are you using for state management? (or: none needed for this project type)
- Q-S3: What are you using for data fetching / server communication?
- Q-S4: What are you using for styling? (CSS framework, CSS-in-JS, plain CSS, etc.)
- Q-S5: What are you using for the database / ORM?
- Q-S6: What are you using for testing? (Jest, Vitest, pytest, RSpec, etc.)
- Q-S7: What are you using for forms / validation?

**Project questions (always ask these — they can't be inferred from code):**
- Q-P1: In one sentence: what does this app do and who uses it?
- Q-P2: What are the 3–5 core domains in this project? 
  (e.g. for an e-commerce app: Products, Orders, Pricing, Users, Inventory)
- Q-P3: For each domain you listed: what is the single most important rule 
  that must always hold true? (e.g. "Pricing: discount logic never lives in UI components")

**Conventions questions (skip if already detected from existing code):**
- Q-C1: Any specific naming conventions I should enforce?
  (e.g. PascalCase components, camelCase hooks with `use` prefix, etc.)
- Q-C2: Any import style preferences?
  (e.g. named exports only, no barrel files, path aliases)

**Guardrails questions (always ask these):**
- Q-G1: Which files or directories are completely off-limits?
  (e.g. auth logic, migration files, env files, payment processing)
- Q-G2: Are there any libraries or patterns you want to permanently ban?
  (e.g. "no lodash", "no inline styles", "no class components")
- Q-G3: Are there any shortcuts or quick-fixes you've already seen yourself
  reach for that you want to prevent?
  (e.g. "I tend to put business logic in components", "I add `if` checks instead of fixing domain models")

**Team questions (ask only if relevant):**
- Q-T1: Solo project or team? If team: any conventions the whole team has agreed on?

Format your questions clearly and number them. End with:
```
Please answer as many as you can — it's fine to say "not decided yet"
or "skip" for anything not relevant. Your answers shape every file I generate.
```

After receiving answers, say exactly:
```
INTERVIEW COMPLETE. Generating files in Phase 3.
```

---

## PHASE 3: GENERATE
*Generate all files now, one by one, in the order listed below.
Announce each file before creating it: "Generating: [filename]"
Every file must be tailored to THIS project — no generic placeholders
except where explicitly marked with [BRACKETS] for the user to fill in later.*

Use everything from Phase 1 discovery and Phase 2 answers.
Apply the principles from the REFERENCE GUIDE at the bottom of this file.

Generate files in this exact order:

---

### 3.1 — Generate: CLAUDE.md

Rules for this file:
- Under 80 lines total
- Every line must answer: "Would removing this cause Claude to make a mistake?"
- Include: build/dev commands (exact, from package.json scripts), stack decisions
  (one line each, no deviations allowed), naming conventions, code rules,
  off-limits files, reference docs section, session end protocol
- Do NOT include: things Claude already knows (standard language conventions,
  basic framework patterns), vague instructions ("write clean code"),
  anything better suited to AI_CONTRACT.md

```markdown
# Project: [PROJECT NAME] ([FRAMEWORK], [LANGUAGE], [KEY LIBS])

## Build & Dev Commands
[Exact commands from package.json / Makefile / pyproject.toml — not guesses]

## Stack Decisions (don't deviate without asking)
[One line per key decision: state, data fetching, styling, forms, testing, ORM]
[Format: "- [Concern]: [Library/approach] only. No [alternatives]."]

## Naming Conventions
[Only conventions specific to THIS project — skip universal language conventions]

## Code Rules
[Project-specific hard rules only — no `any`, no barrel files, etc.]

## Off-Limits (never modify without explicit confirmation)
[Files/dirs from Q-G1 answers]

## Reference Docs (use @-syntax to load when needed)
- Project map: @docs/projectmap.md
- AI contract: @docs/AI_CONTRACT.md
- Decisions log: @docs/DECISIONS.md

## Core Domain Changes (auth, payments, data models, shared state)
ALWAYS read @docs/AI_CONTRACT.md and @docs/projectmap.md before starting.
ALWAYS update @docs/DECISIONS.md if a trade-off was made.

## Session End Protocol
After any core domain change:
- New pattern introduced → update @docs/DECISIONS.md
- New anti-pattern found → update @docs/AI_CONTRACT.md
- Domain ownership changed → update @docs/projectmap.md
- Spec deviated from plan → update @specs/[feature].md
```

---

### 3.2 — Generate: docs/AI_CONTRACT.md

Rules for this file:
- This is the anti-rot contract. Short, firm, unambiguous.
- Populate from: Q-G2 (banned libraries/patterns), Q-G3 (personal shortcuts to prevent),
  Q-P3 (domain rules), and anything you inferred from the project structure
- The self-enforcing contract section must always be present
- Format: each rule as a single, specific, violated-or-not statement
  (not vague guidance like "write good code")

```markdown
# AI_CONTRACT.md — [PROJECT NAME]
# If a forbidden pattern isn't written here, Claude is allowed to use it.

## Non-Negotiable Rules
[Rules derived from Q-G2, Q-G3, Q-P3 — be specific and project-tailored]
[Example: "Pricing calculations live in [exact path] — never in components or API handlers"]
[Example: "No [banned library] — use [approved alternative] instead"]
[Example: "No special-case `if` checks for specific data values — fix the domain model"]

## Domain Rules
[One section per domain from Q-P2/Q-P3]
[Format:
### [Domain Name]
- Owner: [file path or module]
- Rule: [the invariant that must always hold]
- Forbidden: [the shortcut that must never happen]
]

## Forbidden Shortcuts
[From Q-G3 — the specific hacks this developer tends to reach for]
[Example: "Adding `if component === 'X'` conditionals → fix the abstraction instead"]
[Example: "Suppressing TypeScript errors with @ts-ignore → solve the type problem"]

## Self-Enforcing Contract
After any core domain change, Claude must:
1. Update @docs/DECISIONS.md with any trade-off made
2. Update @docs/projectmap.md if domain ownership changed
3. Confirm rule-level (anti-hack) tests pass
4. Confirm no forbidden patterns were introduced
```

---

### 3.3 — Generate: docs/projectmap.md

Rules for this file:
- Responsibility-based, NOT structure-based (no folder listings)
- One section per domain from Q-P2
- Each section: what this domain owns, what it does NOT own, where the code lives,
  and what the UI/other layers must never do that touches this domain
- This is the file Claude reads to decide WHERE logic belongs

```markdown
# Project Map — [PROJECT NAME]
# Domain ownership reference. Read this before any core domain change.
# Last updated: [DATE]

## Purpose
[One paragraph: what this system does and who uses it — from Q-P1]

## Core Domains

[For each domain from Q-P2:]

### [Domain Name]
- **Owns:** [what rules, logic, and data this domain is responsible for]
- **Does NOT own:** [what explicitly belongs to other domains]
- **Code lives in:** [exact file paths / directories]
- **The rule:** [the invariant from Q-P3 — what must always be true]
- **Forbidden:** [what other layers must never do with this domain's concerns]

## Data Flow (high level)
[2–4 sentences describing how data moves through the system:
request → where it enters → how it's processed → where it lands]

## Where Changes Belong
[A quick-reference table or list: "if you need to change X, the right place is Y"]
```

---

### 3.4 — Generate: docs/DECISIONS.md

Rules for this file:
- Starts with the founding decisions already made (from Q-S1–S7 answers)
- Each entry: date, decision, reason, rejected alternatives
- Keep entries to 3–5 bullet points max
- This is a log, not an essay

```markdown
# DECISIONS.md — [PROJECT NAME]
# Log of non-obvious design choices. Add an entry whenever a trade-off is made.
# Format: ## [DATE]: [Decision title]

## [TODAY'S DATE]: Initial stack selection

- Decision: [Framework] + [key library choices from Q-S1–S7]
- Reason: [Why these were chosen — from user's answers]
- Rejected: [Any alternatives the user mentioned not choosing]
- Note: Deviate from these only with explicit discussion; don't let Claude 
  introduce alternatives unilaterally.

## [TODAY'S DATE]: Domain boundary definitions

- Decision: [list the domains and their ownership rules from Q-P2/P3]
- Reason: Prevents logic from leaking across boundaries as AI generates more code
- Note: See docs/projectmap.md for full domain map
```

---

### 3.5 — Generate: docs/session-start.md

Rules for this file:
- This is the template the developer pastes at the start of every new Claude Code session
- Must be project-specific: real project name, real stack, real file paths
- Includes the 4-file load sequence in order

```markdown
# Session Start Template — [PROJECT NAME]
# Paste this at the start of every new Claude Code session.
# Update "Current status" and "Today's task" each time.

---

Project: [PROJECT NAME]
Stack: [FRAMEWORK, LANGUAGE, KEY LIBS — filled in from discovery]

Read before starting (in this order):
1. @CLAUDE.md — session rules and conventions
2. @docs/AI_CONTRACT.md — permanent constraints; these override everything
3. @docs/projectmap.md — domain ownership; tells you where logic belongs
4. @specs/[feature].md — if continuing a core feature from last session

Current status: [what was completed last session — UPDATE THIS]
Today's task: [specific goal — classify as Core or Local first]
Key context: [any decisions made last session that affect today's work]
Reference files: @[relevant files for today's task]

---

## Core vs. Local Quick Check
Before every prompt, classify the task:

**Core** (requires full workflow: read contract + map → write spec → plan → implement → update docs):
- Touches shared domain logic, data models, auth, payments, API contracts, state

**Local** (direct prompt + lint/typecheck is enough):
- Isolated UI change, copy edit, style fix, single-component adjustment

When in doubt: treat as Core.
```

---

### 3.6 — Generate: specs/README.md

Rules for this file:
- Explains the spec-driven development workflow for this project
- Includes the spec template pre-filled with project-specific examples
- Short — this is a reference card, not a tutorial

```markdown
# Specs — [PROJECT NAME]
# One spec file per core feature. Written BEFORE implementation starts.
# Filename: specs/[feature-name].md

## When to write a spec
Any task classified as "Core" (touches domain logic, data models, auth,
payments, API contracts, or shared state) needs a spec before coding.
Local changes (UI tweaks, copy edits) do not.

## Spec template

```markdown
# Feature: [NAME]

## Problem
[One paragraph: what breaks or is missing without this feature]

## Non-Goals
- [What is explicitly out of scope for this iteration]

## Behavior Rules
- [Rule 1: what must always be true — domain invariant]
- [Rule 2: what is forbidden — usually a shortcut to prevent]
- [Rule 3: edge case handling]

## Edge Cases
- [Case]: [Expected behavior]

## Implementation Phases
- Phase 1: [domain/model changes] — verified by: [test or command]
- Phase 2: [service/business logic] — verified by: [test or command]
- Phase 3: [UI wiring] — verified by: [visual check or e2e test]

## Test Plan
- [Rule-level test 1: "all X must always Y" — not "specific X does Y"]
- [Rule-level test 2]

## Acceptance Checks
- [ ] All behavior rules hold
- [ ] Edge cases have tests
- [ ] No new libraries introduced
- [ ] docs/DECISIONS.md updated if a trade-off was made
- [ ] docs/AI_CONTRACT.md updated if new forbidden pattern discovered
```

## How to use a spec with Claude Code

Start every implementation session with:
```
Read @specs/[feature].md. This is the constraint file for this task.
Do not deviate from the behavior rules. If implementation requires
breaking a rule, stop and tell me rather than working around it.
Also read @docs/AI_CONTRACT.md and @docs/projectmap.md.
```

## Keeping specs alive (spec-anchored approach)
- Update the spec when implementation reveals a new edge case
- Update the spec when a phase takes a different shape than planned
- Do NOT abandon the spec once coding starts — that's spec-once, not spec-driven
```

---

### 3.7 — Generate: .claude/settings.json

Rules for this file:
- Populate the PreToolUse hook with the actual off-limits files from Q-G1
- Use the exact file paths the user gave — no generic placeholders
- If no off-limits files were given, use an empty hooks array and add a comment

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "[SHELL COMMAND that checks if the file being edited matches any off-limits path and exits 1 with a clear message if so — populate with real paths from Q-G1]"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "[TYPECHECK COMMAND appropriate for this stack — e.g. 'npm run typecheck 2>&1 | tail -20' for TS, or 'python -m mypy . 2>&1 | tail -20' for Python with mypy, etc. Use the actual check command from the project's package.json/Makefile]"
          }
        ]
      }
    ]
  },
  "claudeMdExcludes": [
    "**/node_modules/**",
    "**/dist/**",
    "**/.next/**",
    "**/build/**",
    "**/coverage/**",
    "**/__pycache__/**",
    "**/target/**",
    "**/.venv/**"
  ]
}
```

---

### 3.8 — Generate: docs/claude-charter.md

Rules for this file:
- This is the human-readable operating agreement — for the developer, not Claude
- Populate principles with project-specific examples, not generic ones
- Anti-patterns section should list the ACTUAL patterns from AI_CONTRACT.md
- Off-limits files should list the ACTUAL files from Q-G1

```markdown
# Claude Code Project Charter — [PROJECT NAME]

## What This Document Is
The operating agreement for AI-assisted development on this project.
Claude reads CLAUDE.md for session rules. This document records the
principles behind those rules for humans.

## Core Principles

1. **CLAUDE.md is the session rulebook. AI_CONTRACT.md is the law.**
   If a forbidden pattern isn't in AI_CONTRACT.md, Claude is allowed to use it.

2. **Context is scarce.** Use /clear between unrelated tasks. Use subagents
   for investigation. Keep CLAUDE.md under 80 lines.

3. **Examples over descriptions.** When establishing a pattern, write the
   reference implementation yourself, then point Claude to it.

4. **Classify before you prompt.** Core domain change → full workflow.
   Local change → direct prompt. The wrong classification is the root
   cause of most AI-assisted codebase rot.

5. **Plan before risky changes.** Use plan mode + structural justification
   for anything touching [LIST THE PROJECT'S CORE DOMAINS].

6. **Tests assert rules, not cases.** A test that passes after adding a
   special-case `if` is not a domain invariant test. Rewrite it.

7. **Decisions get written down immediately.** Any trade-off made in a
   session lives in docs/DECISIONS.md before the session ends.

8. **Corrections mean prompts need improvement.** If you correct Claude
   twice on the same issue: /clear and write a better prompt.

9. **Specs are living documents.** Update the spec as you learn.
   Abandoning it once coding starts is spec-once, not spec-driven.

## The Four Governance Files
- **CLAUDE.md** → session behavior (commands, conventions, stack rules)
- **docs/AI_CONTRACT.md** → permanent forbidden patterns; the anti-rot contract
- **docs/DECISIONS.md** → why non-obvious choices were made
- **docs/projectmap.md** → domain ownership; where logic belongs

## Review Gate (Required Before Every Commit)
- [ ] Structural justification provided for each modified file
- [ ] Tests pass — and tests assert rules, not cases
- [ ] [TYPECHECK COMMAND] clean
- [ ] [LINT COMMAND] clean
- [ ] No unauthorized new libraries
- [ ] No off-limits files modified
- [ ] No forbidden patterns from AI_CONTRACT.md introduced
- [ ] Diff is within the stated scope
- [ ] For core changes: DECISIONS.md / AI_CONTRACT.md / projectmap.md updated

## Off-Limits Files
[ACTUAL FILES FROM Q-G1 — not placeholders]

## Anti-Patterns We Don't Accept
[COPY THE FORBIDDEN SHORTCUTS FROM docs/AI_CONTRACT.md HERE]

## Last Updated
[TODAY'S DATE] — generated by BOOTSTRAP.md
```

---

## PHASE 4: VERIFY
*Do not skip this phase. Run through the checklist and report results.*

After generating all files, run the following verification:

**4.1 — File existence check**
Confirm each file was actually created (list them with their line counts):
```
ls -la CLAUDE.md docs/AI_CONTRACT.md docs/projectmap.md docs/DECISIONS.md docs/session-start.md specs/README.md .claude/settings.json docs/claude-charter.md
```

**4.2 — Placeholder check**
Search for any remaining unfilled placeholders:
```
grep -rn "\[PROJECT NAME\]\|\[FRAMEWORK\]\|\[LANGUAGE\]\|\[TODAY'S DATE\]\|\[EXACT\]\|\[SHELL COMMAND\]\|\[TYPECHECK COMMAND\]\|\[LIST THE\]" CLAUDE.md docs/ specs/ .claude/ 2>/dev/null
```
If any are found, fill them in now using what you know from Phase 1 and 2.

**4.3 — CLAUDE.md length check**
```
wc -l CLAUDE.md
```
If over 80 lines, trim it. Move anything that belongs in AI_CONTRACT.md or
docs/ to those files. CLAUDE.md must stay lean.

**4.4 — Consistency check**
Verify mentally:
- Do the domains in projectmap.md match the domains in AI_CONTRACT.md?
- Do the off-limits files in CLAUDE.md match the hook paths in settings.json?
- Do the stack decisions in CLAUDE.md match the commands in session-start.md?
- Are the forbidden patterns in AI_CONTRACT.md also in claude-charter.md?

Fix any inconsistencies before reporting done.

**4.5 — Final report**
After all checks pass, output exactly this:

```
BOOTSTRAP COMPLETE ✓

Files generated:
- CLAUDE.md ([N] lines)
- docs/AI_CONTRACT.md ([N] lines)
- docs/projectmap.md ([N] lines)
- docs/DECISIONS.md ([N] lines)
- docs/session-start.md ([N] lines)
- specs/README.md ([N] lines)
- .claude/settings.json ([N] lines)
- docs/claude-charter.md ([N] lines)

Your project is ready for Claude Code development.

NEXT STEPS:
1. Review each generated file — tweak anything that doesn't feel right
2. Run: rm BOOTSTRAP.md (this file's job is done)
3. Start your first real session using docs/session-start.md as your template
4. Before your first core feature: write a spec in specs/[feature-name].md

ONE THING TO DO RIGHT NOW:
Open docs/AI_CONTRACT.md and add any forbidden shortcut you know
you personally reach for. The contract only works if it names your
specific failure modes — not generic ones.
```

---

## REFERENCE GUIDE
*This section is for Claude's reference during generation. The user does not
need to read this. These are the principles that must shape every file generated.*

### On CLAUDE.md
- It is a session behavior file, not a documentation file
- Every line must answer: "Would removing this cause Claude to make a mistake on THIS project?"
- Stack decisions: one line each, naming both what to use AND what not to use
- Keep under 80 lines — if longer, it will be ignored toward the end
- Do not include universal language conventions Claude already knows

### On AI_CONTRACT.md
- Rules must be stated as specific violated-or-not statements, not guidance
- "No special-case if-checks for specific data values" — good (specific, testable)
- "Write clean code" — bad (unmeasurable, meaningless)
- The self-enforcing section must require Claude to update docs after every core change
- Populate with the developer's ACTUAL known failure modes from Q-G3

### On projectmap.md
- Responsibility map, not a structure map
- The question it answers: "where does this logic belong?"
- Each domain section must include what it explicitly does NOT own
- This is what prevents Claude from editing the nearest plausible file
- Bad: "components/, services/, utils/" — tells Claude nothing
- Good: "Pricing owns all discount/tax calculations. UI renders results, never calculates."

### On spec-driven development
- Specs are written BEFORE implementation, not during
- They define constraints (what must be true, what is forbidden) — not instructions (how to build)
- Spec-anchored: update the spec as you learn during implementation
- Spec-once (write once, abandon): anti-pattern
- Rule-level tests ("all non-scalable units must never scale") beat case-level tests ("bunch must not scale")

### On anti-hack tests
- Tests at the rule level make any future special-case shortcut automatically fail
- Wrong: it('bunch unit should not scale') — only catches one case
- Right: it('all non-scalable units must not scale regardless of value') — catches all future shortcuts
- Every domain invariant should have a corresponding rule-level test

### On context management
- Claude's context is a whiteboard, not a filing cabinet
- /clear between unrelated tasks — long mixed sessions degrade quality
- /compact mid-task with explicit keep/discard instructions
- Subagents for investigation keep the main context clean

### On the core vs. local distinction
- Core: touches shared domain logic, data models, auth, payments, API contracts, shared state
- Local: isolated UI change, copy edit, style fix, single-component with no domain impact
- When in doubt: treat as core — the downside of over-caution is 20 extra minutes; 
  the downside of under-caution is hours of rot cleanup

### On the four-file governance system
- CLAUDE.md: how Claude should behave in this session
- AI_CONTRACT.md: what is permanently forbidden regardless of session
- DECISIONS.md: why non-obvious choices were made (prevents re-litigation)
- projectmap.md: who owns which rules (prevents wrong-layer edits)
- Together they mean: Claude never has to guess, and you never have to re-explain

### Structural justification requirement
After any implementation, Claude must be able to answer:
- Which files were modified
- Why each file was the right place per projectmap.md
- Which rule in AI_CONTRACT.md or spec section justified each decision
- Whether any change felt like a compromise (flag it if so)
