# Acceptance Criteria

## M0

- [x] The actual project location and pre-existing files are documented.
- [x] Git is initialized and the worktree is inspected before checkpointing.
- [x] The required ten workflow and project documents exist and do not contain material contradictions.
- [x] Vite, strict TypeScript, HTML Canvas, and Vitest are configured without gameplay implementation.
- [x] `npm install` exits successfully and creates a lockfile.
- [x] `npm test` exits successfully with at least one executed test.
- [x] `npm run build` exits successfully and creates ignored build output.
- [x] Actual command evidence is present in `RUN_LOG.md`.
- [x] `STATUS.md` and `HANDOFF.md` reflect the post-verification state.
- [x] A Git checkpoint named `M0: bootstrap project workflow and toolchain` exists (`574d0ca`).

## M1 (CP-M1-01)

Observable and testable criteria. Check only with real evidence in `RUN_LOG.md`.

### Automated / pure logic

- [x] Key mapping: `W`/ArrowUp → up; `A`/ArrowLeft → left; `S`/ArrowDown → down; `D`/ArrowRight → right.
- [x] WASD and arrow keys are equivalent for the same direction.
- [x] Multiple directions combine; opposite directions cancel to zero on that axis.
- [x] No input → zero direction; player does not move.
- [x] Single-axis direction has length 1 (or correct unit axis vector).
- [x] Diagonal direction is normalized (length 1; not ~√2 faster).
- [x] Displacement scales with delta time at fixed speed and input.
- [x] Two smaller steps match one larger step for equal total time (away from bounds).
- [x] Player cannot cross left, right, top, or bottom bounds (radius/size considered).
- [x] Key release removes only that key; other held keys remain.
- [x] Clearing input stops further movement.
- [x] If a max delta is used, its behavior is tested.
- [x] Core tests run in Vitest without importing the browser entry (no `document is not defined`).
- [x] `npm test` passes.
- [x] `npx tsc --noEmit` passes.
- [x] `npm run build` passes.
- [x] `npm audit` recorded (prefer zero high/critical blockers for this stack).

### Browser / manual (or UNVERIFIED)

- [ ] Page opens; console has no unhandled errors. — static HTTP 200 only; **console UNVERIFIED**
- [ ] Canvas layout usable on desktop and narrow viewports. — **UNVERIFIED**
- [ ] Arena and player placeholder clearly visible. — **UNVERIFIED** (drawn in code; not visually confirmed)
- [ ] WASD and arrows move the player; release stops that motion. — **UNVERIFIED**
- [ ] Diagonal move works and is not obviously faster than axis move. — unit-tested; visual **UNVERIFIED**
- [ ] Opposite keys do not produce wrong drift. — unit-tested; visual **UNVERIFIED**
- [ ] Player stays inside visible Canvas bounds on all sides. — unit-tested; visual **UNVERIFIED**
- [ ] Continuous hold does not accelerate per frame (frame-rate independence). — unit-tested; visual **UNVERIFIED**
- [ ] Blur / switch-away while holding a key does not leave stuck movement after return. — **UNVERIFIED**
- [x] User-visible copy no longer claims gameplay only begins later / M0-only ready as the sole state. (HTTP HTML check)

### Process

- [x] M1 checkpoint commit exists with intended files only (`563f7ee`).
- [x] Independent M1 audit is not claimed by the implementer; status records audit pending unless a separate auditor passes.

## Milestone Audit Rule

The implementing agent may gather evidence but must not represent its own review as an independent milestone audit. Before entering the next milestone, a fresh agent or the user should compare this checklist with the repository and rerun critical commands. Until then, implementation can be checkpointed while independent audit status remains explicitly recorded.
