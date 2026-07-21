# Plan

## Current Goal

Complete M0 only: create a reproducible Vite + TypeScript + Canvas scaffold, install a basic test harness, establish project-local workflow, and save a Git checkpoint.

## M0 Checkpoint

| ID | Deliverable | Verification | Pass condition | Status |
|---|---|---|---|---|
| CP-M0-01 | Workflow documents and runnable scaffold | `npm install`, `npm test`, `npm run build`, Git inspection | All commands succeed, docs agree, and checkpoint commit exists | Green at `574d0ca` |

The M0 rollback point is the final `M0: bootstrap project workflow and toolchain` commit.

## Later Work

| Milestone | Planned sequence | Status |
|---|---|---|
| M1 | Define movement acceptance; implement input, time-based movement, bounds, rendering, and tests | Not started |
| M2 | Define combat acceptance; implement enemies, pressure, automatic attack, and tests | Not started |
| M3 | Define progression acceptance; implement drops, leveling, upgrade choice, and tests | Not started |
| M4 | Define final acceptance; implement run outcome/restart, tune, regress, and audit | Not started |

Only one milestone checkpoint is active at a time. Details for later milestones are refined immediately before that milestone, not during M0.

## M0 Risks

| Risk | Mitigation |
|---|---|
| Reference paths differ from the actual workspace | Use the detected repository root and document the correction |
| Workflow overhead crowds out a small game | Keep only ten required documents and one checkpoint table |
| Browser behavior is falsely inferred from build success | Record browser checks separately from automated checks |
| Future scope drifts into a full clone | Enforce the five-item scope lock and explicit non-goals |
