# Handoff

## Current Truth

- Actual project root: `D:\agent\workspace\vampire_survivors`.
- M0 remains green at `574d0ca` / status record `ba842c4`.
- M1 **CP-M1-01** implementation is complete and checkpointed (or about to be); independent audit is **pending**.
- M2 has **not** been started.
- `AI-Workflow-Library/` remains read-only, ignored, unmodified.

## Implemented (M1)

- Visible player circle on Canvas arena.
- WASD + arrow keys; multi-key combine; opposite cancel; diagonal normalize.
- `requestAnimationFrame` loop; position from delta time (seconds); `MAX_DELTA_SECONDS = 0.05`.
- Bounds clamp using player radius so full body stays in arena.
- Key release; `blur` and `visibilitychange` clear input.
- Pure modules: `src/input.ts`, `src/movement.ts`, `src/vec.ts`; DOM/RAF in `src/main.ts`.
- Vitest coverage for mapping, combine, cancel, normalize, dt movement, bounds, clear/release, delta cap.

## Verified

- `npm test` — 3 files, 26 tests passed.
- `npx tsc --noEmit` — exit 0.
- `npm run build` — success.
- `npm audit` — 0 vulnerabilities.
- Dev server `http://localhost:5173/` HTTP 200; HTML shows M1 status copy.

## Not Yet Verified

- Interactive keyboard movement, diagonal feel, on-screen bounds, blur recovery, narrow viewport layout, console during play — **UNVERIFIED**.
- Independent M1 audit — **pending**.

## Recent Files

- `src/input.ts`, `src/input.test.ts`
- `src/movement.ts`, `src/movement.test.ts`
- `src/vec.ts`, `src/main.ts`, `src/status.ts`, `src/main.test.ts`
- `index.html`, `docs/PLAN.md`, `docs/ACCEPTANCE_CRITERIA.md`, `docs/ARCHITECTURE.md`
- `docs/STATUS.md`, `docs/RUN_LOG.md`, `docs/HANDOFF.md`, `README.md`

## Risks

- Browser interaction not executed; do not treat build success as play acceptance.
- Next agent must not start M2 without independent M1 audit PASS.

## Next Task

Run independent M1 audit and complete browser acceptance checklist. One next task only: **M1 independent audit + remaining browser verification**. Do not implement M2.

## Read First

1. `AGENTS.md`
2. `docs/PROJECT_BRIEF.md`
3. `docs/STATUS.md`
4. `docs/PLAN.md`
5. `docs/ACCEPTANCE_CRITERIA.md`
6. `docs/RUN_LOG.md`
7. `docs/ARCHITECTURE.md`
