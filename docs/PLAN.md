# Plan

## Current Goal

**M1 complete.** Stopped between M1 and M2. Next work is architect definition of M2 checkpoint, Must, Non-goals, and acceptance — not M2 implementation until a new development prompt.

## M0 Checkpoint (history)

| ID | Deliverable | Verification | Pass condition | Status |
|---|---|---|---|---|
| CP-M0-01 | Workflow documents and runnable scaffold | `npm install`, `npm test`, `npm run build`, Git inspection | All commands succeed, docs agree, and checkpoint commit exists | Green at `574d0ca` |

The M0 rollback point is `574d0ca` (`M0: bootstrap project workflow and toolchain`). Status record: `ba842c4`.

## M1 Checkpoint

| ID | Deliverable | Verification | Pass condition | Status |
|---|---|---|---|---|
| CP-M1-01 | Frame-independent player movement in a bounded arena | Vitest pure-logic tests; `npm test`; `npx tsc --noEmit`; `npm run build`; `npm audit`; manual browser checks | Player moves with WASD/arrows, diagonal normalized, bounds respect radius, blur clears input, loop uses delta time; evidence recorded | **Green** — implementation `563f7ee`; status record `2684ac8`; independent audit PASS; automated green; user manual browser acceptance PASS (11 checks; browser/version not supplied) |

### CP-M1-01 scope (delivered)

- Visible placeholder player on Canvas.
- WASD and arrow keys; multi-key combine; opposite keys cancel.
- Diagonal direction normalized (no √2 speed boost).
- `requestAnimationFrame` loop; position updates from real delta time (seconds).
- Player full extent stays inside logical Canvas bounds.
- Key release stops that direction; `blur` and `visibilitychange` clear input.
- Core move/normalize/clamp logic unit-tested without DOM.
- Outdated M0-only user-visible copy updated.

### Non-goals for this checkpoint

No enemies, combat, XP, upgrades, weapons, audio, saves, ECS, engines, or M2–M4 scaffolding.

## Later Work

| Milestone | Planned sequence | Status |
|---|---|---|
| M1 | Define movement acceptance; implement input, time-based movement, bounds, rendering, and tests | **Complete / Green** (`563f7ee`; independent audit PASS) |
| M2 | Define combat acceptance; implement enemies, pressure, automatic attack, and tests | **Not started** |
| M3 | Define progression acceptance; implement drops, leveling, upgrade choice, and tests | Not started |
| M4 | Define final acceptance; implement run outcome/restart, tune, regress, and audit | Not started |

Only one milestone checkpoint is active at a time. M2 is not active.

## M1 Risks (historical mitigations applied)

| Risk | Mitigation |
|---|---|
| Movement appears frame-rate dependent | Use delta time in seconds; test proportional displacement |
| Diagonal faster than axis move | Normalize non-zero direction vectors |
| Bounds ignore player size | Clamp using radius / half-extent |
| Stuck keys after tab-away | Clear input on window blur |
| Browser checks inferred from build | Record browser evidence separately; user manual acceptance completed |
