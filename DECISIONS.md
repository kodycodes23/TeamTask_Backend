# DECISIONS.md

> Keep this short. Bullets are fine. Be specific and honest. We read every word.

## The feature: assignees + filtering

**What I built**
- Added `assignee_id` support to tasks (nullable), wired it through seed data, API responses, and create task payloads.
- Added assignee selection when creating a task and assignee filtering in the UI (`All assignees` / `Unassigned` / specific user).

**Decisions I made on the ambiguous parts**
- How I handled tasks with no assignee: I kept assignee optional (`assignee_id` nullable) and exposed this explicitly in UI/API as `Unassigned`.
- Single-select vs multi-select filter, and why: Single-select. The domain model is one task -> one assignee, and single-select keeps filtering simple and predictable for this scope.
- How the assignee filter interacts with the existing status/search filter: All filters combine with AND semantics (status + search + assignee).
- Where the filter state lives (URL, local state, etc.) and why: Component local state in `App`. Fastest to implement and matches existing code style without adding routing complexity.

**Anything I assumed instead of asking**
- A task can be created without an assignee.
- Invalid assignee input should be rejected by API (`400`) rather than silently ignored/coerced.

## The bug

- What the bug was: Rapid repeated submit on the new task form could create duplicate tasks (same title submitted twice before first POST completed).
- How I found it: Reproduced by simulating an impatient user and adding artificial latency to `POST /api/tasks`, then triggering rapid double-click submit.
- Why my fix is correct (and not just "it stopped happening"): I added an in-flight submit guard in the form (`isSubmitting`), disabled form controls during submit, and short-circuited duplicate submits while request is pending. This removes the concurrency path that created duplicate inserts.
- Additional bug I found and fixed: I also found a stale-search race where out-of-order responses could overwrite newer results while typing quickly. I fixed this by adding a request-order guard in `App` (`latestLoadId`) so only the newest fetch response can update task state.

Anything similar I noticed but didn't fix: None.


## Tradeoffs

- What I deliberately did NOT do, and why: No pagination/sorting overhaul, no URL-synced filters, and no backend test suite in this pass to keep scope aligned with the take-home time box.
- Where I leaned on AI, and what I changed or rejected from what it gave me: I used AI to accelerate edge-case brainstorming and draft implementation options; I rejected broader refactors and kept only minimal changes that fit existing patterns.

## If I had more time

- Next thing I'd do: Add focused tests around task creation concurrency and filtering semantics (API + UI integration).
- Where this design breaks at 10x or 100x the data: Fetching full filtered lists each interaction and doing simple text search (`LIKE`) without indexing/pagination will degrade as data grows.
- One thing about the existing codebase I'd want to refactor and why: Centralize API error handling in the frontend so failed requests don't silently degrade UX and so error states are consistent.

## Time spent

- Roughly: 2 hours


